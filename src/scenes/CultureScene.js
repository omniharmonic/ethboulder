import * as THREE from 'three'

export class CultureScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    this.cells = []
    this.particleSystem = null
    this.maxCells = 1000
    this.divisionRate = 0.02
    this.isPaused = false
    
    // Configuration
    this.config = {
      initialCells: 1,
      maxGeneration: 10,
      divisionCooldown: 2.0, // seconds
      maxCellAge: 30.0 // seconds
    }
  }

  async init() {
    // Get performance settings
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    
    // Adjust for performance
    this.adjustForPerformance()
    
    // Initialize particle system
    this.initializeParticleSystem()
    
    // Create initial mother cell
    this.createMotherCell()
    
    // Setup controls
    this.setupControls()
    
    console.log('🧬 Culture scene initialized')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.maxCells = 500
        this.divisionRate = 0.015
        break
      case 'medium':
        this.maxCells = 750
        this.divisionRate = 0.018
        break
      case 'high':
        this.maxCells = 1000
        this.divisionRate = 0.02
        break
    }
  }

  initializeParticleSystem() {
    const geometry = new THREE.BufferGeometry()
    
    // Position attribute
    const positions = new Float32Array(this.maxCells * 3)
    const colors = new Float32Array(this.maxCells * 3)
    const scales = new Float32Array(this.maxCells)
    const ages = new Float32Array(this.maxCells)
    const generations = new Float32Array(this.maxCells)
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('age', new THREE.BufferAttribute(ages, 1))
    geometry.setAttribute('generation', new THREE.BufferAttribute(generations, 1))
    
    // Create cell texture
    const cellTexture = this.createCellTexture()
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: cellTexture },
        primaryColor: { value: new THREE.Color(0x0D4F5C) },
        accentColor: { value: new THREE.Color(0x1B4F72) },
        glowColor: { value: new THREE.Color(0xF8F9FA) }
      },
      vertexShader: `
        attribute float scale;
        attribute float age;
        attribute float generation;
        attribute vec3 color;
        
        uniform float time;
        
        varying vec3 vColor;
        varying float vAge;
        varying float vGeneration;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          vAge = age;
          vGeneration = generation;
          
          // Pulsing based on cell cycle
          float pulse = sin(time * 2.0 + age * 0.5) * 0.1 + 0.9;
          float cellScale = scale * pulse;
          
          // Fade out old cells
          vAlpha = 1.0 - smoothstep(25.0, 30.0, age);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = cellScale * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        uniform vec3 primaryColor;
        uniform vec3 accentColor;
        uniform vec3 glowColor;
        
        varying vec3 vColor;
        varying float vAge;
        varying float vGeneration;
        varying float vAlpha;
        
        void main() {
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          
          // Color evolution based on generation
          float generationFactor = vGeneration / 10.0;
          vec3 color = mix(primaryColor, accentColor, generationFactor);
          color = mix(color, glowColor, sin(vAge * 0.1) * 0.2 + 0.1);
          
          float alpha = texColor.a * vAlpha;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    this.particleSystem = new THREE.Points(geometry, material)
    this.scene.add(this.particleSystem)
  }

  createCellTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
    
    gradient.addColorStop(0, 'rgba(248, 249, 250, 1)')
    gradient.addColorStop(0.2, 'rgba(13, 79, 92, 0.8)')
    gradient.addColorStop(0.4, 'rgba(13, 79, 92, 0.4)')
    gradient.addColorStop(1, 'rgba(13, 79, 92, 0)')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, 64, 64)
    
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }

  createMotherCell() {
    const motherCell = {
      position: new THREE.Vector3(0, 0, 0),
      age: 0,
      generation: 0,
      active: true,
      lastDivision: 0,
      id: 0
    }
    
    this.cells.push(motherCell)
    this.updateParticleAttributes()
  }

  setupControls() {
    const pauseBtn = document.getElementById('pause-btn')
    const resetBtn = document.getElementById('reset-btn')
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.togglePause())
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset())
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      if (event.key === 'p' || event.key === 'P') {
        this.togglePause()
      } else if (event.key === 'r' || event.key === 'R') {
        this.reset()
      }
    })
  }

  update(deltaTime) {
    if (this.isPaused) return
    
    const time = performance.now() * 0.001
    
    // Update material time uniform
    if (this.particleSystem.material.uniforms) {
      this.particleSystem.material.uniforms.time.value = time
    }
    
    // Update cell division
    this.updateCellDivision(deltaTime * 0.001)
    
    // Update particle attributes
    this.updateParticleAttributes()
    
    // Cleanup old cells
    this.cleanupOldCells()
  }

  updateCellDivision(deltaTime) {
    const newCells = []
    const currentTime = performance.now() * 0.001
    
    this.cells.forEach((cell, index) => {
      if (!cell.active) return
      
      cell.age += deltaTime
      
      // Check division conditions
      const canDivide = 
        cell.age > this.config.divisionCooldown &&
        cell.generation < this.config.maxGeneration &&
        this.cells.length < this.maxCells &&
        Math.random() < this.divisionRate
      
      if (canDivide) {
        // Create two daughter cells
        const angle = Math.random() * Math.PI * 2
        const distance = 2.0 + Math.random() * 2.0
        
        const daughter1 = {
          position: cell.position.clone().add(
            new THREE.Vector3(
              Math.cos(angle) * distance,
              Math.sin(angle) * distance,
              (Math.random() - 0.5) * distance
            )
          ),
          age: 0,
          generation: cell.generation + 1,
          active: true,
          lastDivision: currentTime,
          id: this.cells.length + newCells.length
        }
        
        const daughter2 = {
          position: cell.position.clone().add(
            new THREE.Vector3(
              Math.cos(angle + Math.PI) * distance,
              Math.sin(angle + Math.PI) * distance,
              (Math.random() - 0.5) * distance
            )
          ),
          age: 0,
          generation: cell.generation + 1,
          active: true,
          lastDivision: currentTime,
          id: this.cells.length + newCells.length + 1
        }
        
        newCells.push(daughter1, daughter2)
        
        // Parent cell becomes inactive after division
        cell.active = false
        
        // Audio feedback for cell division
      }
    })
    
    this.cells.push(...newCells)
  }

  updateParticleAttributes() {
    const positions = this.particleSystem.geometry.attributes.position.array
    const colors = this.particleSystem.geometry.attributes.color.array
    const scales = this.particleSystem.geometry.attributes.scale.array
    const ages = this.particleSystem.geometry.attributes.age.array
    const generations = this.particleSystem.geometry.attributes.generation.array
    
    // Clear arrays
    positions.fill(0)
    colors.fill(0)
    scales.fill(0)
    ages.fill(0)
    generations.fill(0)
    
    this.cells.forEach((cell, index) => {
      if (index >= this.maxCells) return
      
      // Position
      positions[index * 3] = cell.position.x
      positions[index * 3 + 1] = cell.position.y
      positions[index * 3 + 2] = cell.position.z
      
      // Color based on generation
      const generationHue = (cell.generation * 0.1) % 1.0
      const color = new THREE.Color().setHSL(
        0.5 + generationHue * 0.3, // Teal to blue range
        0.8,
        0.6 + Math.sin(cell.age * 0.5) * 0.2
      )
      
      colors[index * 3] = color.r
      colors[index * 3 + 1] = color.g
      colors[index * 3 + 2] = color.b
      
      // Scale based on activity and age
      scales[index] = cell.active ? 1.0 + Math.sin(cell.age) * 0.2 : 0.1
      
      ages[index] = cell.age
      generations[index] = cell.generation
    })
    
    // Mark attributes for update
    this.particleSystem.geometry.attributes.position.needsUpdate = true
    this.particleSystem.geometry.attributes.color.needsUpdate = true
    this.particleSystem.geometry.attributes.scale.needsUpdate = true
    this.particleSystem.geometry.attributes.age.needsUpdate = true
    this.particleSystem.geometry.attributes.generation.needsUpdate = true
  }

  cleanupOldCells() {
    // Remove cells that are too old
    this.cells = this.cells.filter(cell => {
      return cell.age < this.config.maxCellAge
    })
  }

  togglePause() {
    this.isPaused = !this.isPaused
    
    const pauseBtn = document.getElementById('pause-btn')
    if (pauseBtn) {
      pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause'
    }
    
    console.log(`🧬 Cell division ${this.isPaused ? 'paused' : 'resumed'}`)
  }

  reset() {
    // Clear all cells
    this.cells = []
    
    // Create new mother cell
    this.createMotherCell()
    
    // Reset pause state
    this.isPaused = false
    const pauseBtn = document.getElementById('pause-btn')
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause'
    }
    
    console.log('🧬 Cell simulation reset')
  }

  // Interactive methods
  onMouseMove(event) {
    // Create environmental influence based on mouse position
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )
    
    // Influence cell movement slightly
    const influenceRadius = 10
    const influenceStrength = 0.1
    
    this.cells.forEach(cell => {
      if (!cell.active) return
      
      const mouseWorldPos = new THREE.Vector3(mouse.x * 30, mouse.y * 30, 0)
      const distance = cell.position.distanceTo(mouseWorldPos)
      
      if (distance < influenceRadius) {
        const influence = (influenceRadius - distance) / influenceRadius
        const direction = cell.position.clone().sub(mouseWorldPos).normalize()
        cell.position.add(direction.multiplyScalar(influence * influenceStrength))
      }
    })
  }

  onClick(event) {
    // Add environmental stimulus at click location
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )
    
    const stimulusPos = new THREE.Vector3(mouse.x * 30, mouse.y * 30, 0)
    
    // Temporarily increase division rate near stimulus
    this.cells.forEach(cell => {
      const distance = cell.position.distanceTo(stimulusPos)
      if (distance < 5) {
        cell.age += 1.0 // Accelerate aging to trigger division
      }
    })
    
    console.log('🧬 Environmental stimulus applied')
  }

  onEnter() {
    console.log('🧬 Entering culture scene')
    
    // Start culture ambient audio
  }

  onExit() {
    console.log('🧬 Exiting culture scene')
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.5,
      directionalIntensity: 0.5,
      directionalPosition: [10, 20, 30]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 0, 40],
      target: [0, 0, 0],
      fov: 75
    }
  }

  getDescription() {
    return 'Organic cell division simulation showing cultural ideas evolving and multiplying'
  }

  getInteractiveElementCount() {
    return this.cells.filter(cell => cell.active).length
  }

  getScene() {
    return this.scene
  }

  dispose() {
    // Clean up particle system
    if (this.particleSystem) {
      this.particleSystem.geometry.dispose()
      this.particleSystem.material.dispose()
      this.particleSystem.material.uniforms.pointTexture.value.dispose()
    }
    
    console.log('🧬 Culture scene disposed')
  }
}