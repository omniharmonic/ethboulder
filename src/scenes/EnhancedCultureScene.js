import * as THREE from 'three'

export class EnhancedCultureScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    this.cells = []
    this.membranes = []
    this.maxCells = 200
    this.divisionRate = 0.015
    this.isPaused = false
    this.time = 0
    
    // Configuration
    this.config = {
      initialCells: 1,
      maxGeneration: 8,
      divisionCooldown: 3.0,
      maxCellAge: 40.0,
      membraneDetail: 32
    }
  }

  async init() {
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    this.adjustForPerformance()
    
    this.createMotherCell()
    this.setupControls()
    this.setupEnvironment()
    
    console.log('🧬 Enhanced Culture scene initialized')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.maxCells = 50
        this.config.membraneDetail = 16
        break
      case 'medium':
        this.maxCells = 100
        this.config.membraneDetail = 24
        break
      case 'high':
        this.maxCells = 200
        this.config.membraneDetail = 32
        break
    }
  }

  setupEnvironment() {
    // Create ambient environmental effects
    this.createNutrientField()
    this.createEnvironmentalLighting()
  }

  createNutrientField() {
    // Create floating nutrient particles
    const particleCount = 500
    const geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
      
      const color = new THREE.Color()
      color.setHSL(0.3 + Math.random() * 0.4, 0.6, 0.4 + Math.random() * 0.3)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      sizes[i] = Math.random() * 2 + 0.5
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: this.createNutrientTexture() }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          pos.x += sin(time * 0.5 + position.y * 0.01) * 10.0;
          pos.y += cos(time * 0.3 + position.z * 0.01) * 8.0;
          pos.z += sin(time * 0.4 + position.x * 0.01) * 6.0;
          
          vAlpha = sin(time * 2.0 + length(position) * 0.01) * 0.3 + 0.7;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, texColor.a * vAlpha * 0.3);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    
    this.nutrientField = new THREE.Points(geometry, material)
    this.scene.add(this.nutrientField)
  }

  createNutrientTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
    
    gradient.addColorStop(0, 'rgba(100, 255, 200, 1)')
    gradient.addColorStop(0.4, 'rgba(100, 255, 200, 0.6)')
    gradient.addColorStop(1, 'rgba(100, 255, 200, 0)')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, 32, 32)
    
    return new THREE.CanvasTexture(canvas)
  }

  createEnvironmentalLighting() {
    // Add subtle environmental glow
    const ambientLight = new THREE.AmbientLight(0x004040, 0.2)
    this.scene.add(ambientLight)
    
    // Add point lights for organic feel
    for (let i = 0; i < 3; i++) {
      const light = new THREE.PointLight(0x0D4F5C, 0.5, 100)
      light.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      )
      this.scene.add(light)
    }
  }

  createMotherCell() {
    const motherCell = {
      id: 0,
      position: new THREE.Vector3(0, 0, 0),
      age: 0,
      generation: 0,
      active: true,
      lastDivision: 0,
      radius: 3.0,
      membrane: null,
      nucleus: null,
      dividing: false,
      divisionProgress: 0
    }
    
    // Create cell membrane
    motherCell.membrane = this.createCellMembrane(motherCell)
    motherCell.nucleus = this.createCellNucleus(motherCell)
    
    this.cells.push(motherCell)
    this.scene.add(motherCell.membrane)
    this.scene.add(motherCell.nucleus)
  }

  createCellMembrane(cell) {
    const geometry = new THREE.SphereGeometry(cell.radius, this.config.membraneDetail, this.config.membraneDetail)
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        age: { value: 0 },
        generation: { value: cell.generation },
        dividing: { value: 0.0 },
        membraneColor: { value: new THREE.Color(0x0D4F5C) },
        nucleusColor: { value: new THREE.Color(0x1B4F72) },
        glowColor: { value: new THREE.Color(0xF8F9FA) },
        opacity: { value: 0.6 }
      },
      vertexShader: `
        uniform float time;
        uniform float age;
        uniform float dividing;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDistance;
        varying float vPulse;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          // Membrane breathing
          vec3 pos = position;
          float breathe = sin(time * 2.0 + age * 0.1) * 0.05 + 1.0;
          pos *= breathe;
          
          // Division deformation
          if (dividing > 0.0) {
            float deformation = sin(pos.y * 3.14159) * dividing * 0.3;
            pos.x *= 1.0 + deformation;
            pos.z *= 1.0 + deformation;
            pos.y *= 1.0 - dividing * 0.5;
          }
          
          // Surface ripples
          pos += normal * sin(time * 4.0 + length(position) * 10.0) * 0.02;
          
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          vec4 mvPosition = viewMatrix * worldPosition;
          vDistance = -mvPosition.z;
          
          vPulse = sin(time * 3.0 + age * 0.5) * 0.3 + 0.7;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float age;
        uniform float generation;
        uniform vec3 membraneColor;
        uniform vec3 nucleusColor;
        uniform vec3 glowColor;
        uniform float opacity;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDistance;
        varying float vPulse;
        
        void main() {
          // Generation-based color evolution
          float generationFactor = generation / 8.0;
          vec3 color = mix(membraneColor, nucleusColor, generationFactor);
          
          // Age-based maturation
          float maturation = min(age / 10.0, 1.0);
          color = mix(color, glowColor, maturation * 0.2);
          
          // Fresnel effect for membrane translucency
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = 1.0 - max(0.0, dot(vNormal, viewDirection));
          
          // Membrane texture
          float membrane = sin(vPosition.x * 20.0) * sin(vPosition.y * 20.0) * sin(vPosition.z * 20.0);
          membrane = membrane * 0.1 + 0.9;
          
          // Pulsing life energy
          color += glowColor * vPulse * 0.1;
          
          // Distance fade
          float distanceFade = 1.0 - smoothstep(30.0, 80.0, vDistance);
          
          // Final alpha with fresnel and membrane texture
          float alpha = (opacity + fresnel * 0.4) * membrane * distanceFade;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(cell.position)
    mesh.userData = { cell, type: 'membrane' }
    
    return mesh
  }

  createCellNucleus(cell) {
    const geometry = new THREE.SphereGeometry(cell.radius * 0.4, 16, 16)
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        generation: { value: cell.generation },
        nucleusColor: { value: new THREE.Color(0x1B4F72) },
        dnaColor: { value: new THREE.Color(0xF8F9FA) }
      },
      vertexShader: `
        uniform float time;
        
        varying vec3 vPosition;
        varying float vPulse;
        
        void main() {
          vPosition = position;
          vPulse = sin(time * 4.0) * 0.2 + 0.8;
          
          vec3 pos = position * vPulse;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float generation;
        uniform vec3 nucleusColor;
        uniform vec3 dnaColor;
        
        varying vec3 vPosition;
        varying float vPulse;
        
        void main() {
          // DNA-like helical patterns
          float helix = sin(vPosition.y * 10.0 + time) * cos(vPosition.x * 10.0 + time * 0.7);
          helix = helix * 0.3 + 0.7;
          
          vec3 color = mix(nucleusColor, dnaColor, helix);
          color *= vPulse;
          
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      transparent: true
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(cell.position)
    mesh.userData = { cell, type: 'nucleus' }
    
    return mesh
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
    
    this.time = performance.now() * 0.001
    
    // Update nutrient field
    if (this.nutrientField?.material.uniforms) {
      this.nutrientField.material.uniforms.time.value = this.time
    }
    
    // Update cell division
    this.updateCellDivision(deltaTime * 0.001)
    
    // Update cell visuals
    this.updateCellVisuals()
    
    // Cleanup old cells
    this.cleanupOldCells()
  }

  updateCellDivision(deltaTime) {
    const newCells = []
    const currentTime = this.time
    
    this.cells.forEach((cell, index) => {
      if (!cell.active) return
      
      cell.age += deltaTime
      
      // Update material uniforms
      if (cell.membrane?.material.uniforms) {
        cell.membrane.material.uniforms.age.value = cell.age
        cell.membrane.material.uniforms.time.value = this.time
      }
      
      if (cell.nucleus?.material.uniforms) {
        cell.nucleus.material.uniforms.time.value = this.time
      }
      
      // Check division conditions
      const canDivide = 
        cell.age > this.config.divisionCooldown &&
        cell.generation < this.config.maxGeneration &&
        this.cells.length < this.maxCells &&
        !cell.dividing &&
        Math.random() < this.divisionRate
      
      if (canDivide) {
        this.startCellDivision(cell, newCells)
      }
      
      // Update division animation
      if (cell.dividing) {
        cell.divisionProgress += deltaTime * 2.0
        
        if (cell.membrane?.material.uniforms) {
          cell.membrane.material.uniforms.dividing.value = 
            Math.sin(cell.divisionProgress * Math.PI) * 0.5 + 0.5
        }
        
        // Complete division
        if (cell.divisionProgress >= 1.0) {
          this.completeCellDivision(cell, newCells)
        }
      }
    })
    
    // Add new cells
    newCells.forEach(newCell => {
      this.cells.push(newCell)
      this.scene.add(newCell.membrane)
      this.scene.add(newCell.nucleus)
    })
  }

  startCellDivision(cell, newCells) {
    cell.dividing = true
    cell.divisionProgress = 0
    
    console.log(`🧬 Cell ${cell.id} starting division (generation ${cell.generation})`)
  }

  completeCellDivision(cell, newCells) {
    const angle = Math.random() * Math.PI * 2
    const distance = cell.radius * 2.5
    
    // Create two daughter cells
    const daughter1 = this.createDaughterCell(cell, angle, distance)
    const daughter2 = this.createDaughterCell(cell, angle + Math.PI, distance)
    
    newCells.push(daughter1, daughter2)
    
    // Remove parent cell
    cell.active = false
    this.scene.remove(cell.membrane)
    this.scene.remove(cell.nucleus)
    
    // Audio feedback
  }

  createDaughterCell(parentCell, angle, distance) {
    const daughterCell = {
      id: this.cells.length + Math.random(),
      position: parentCell.position.clone().add(
        new THREE.Vector3(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance,
          (Math.random() - 0.5) * distance * 0.5
        )
      ),
      age: 0,
      generation: parentCell.generation + 1,
      active: true,
      lastDivision: this.time,
      radius: parentCell.radius * (0.8 + Math.random() * 0.4),
      membrane: null,
      nucleus: null,
      dividing: false,
      divisionProgress: 0
    }
    
    daughterCell.membrane = this.createCellMembrane(daughterCell)
    daughterCell.nucleus = this.createCellNucleus(daughterCell)
    
    return daughterCell
  }

  updateCellVisuals() {
    this.cells.forEach(cell => {
      if (!cell.active) return
      
      // Gentle floating motion
      const floatX = Math.sin(this.time * 0.5 + cell.id) * 0.5
      const floatY = Math.cos(this.time * 0.3 + cell.id) * 0.3
      const floatZ = Math.sin(this.time * 0.4 + cell.id) * 0.4
      
      if (cell.membrane) {
        cell.membrane.position.set(
          cell.position.x + floatX,
          cell.position.y + floatY,
          cell.position.z + floatZ
        )
      }
      
      if (cell.nucleus) {
        cell.nucleus.position.copy(cell.membrane.position)
      }
    })
  }

  cleanupOldCells() {
    this.cells = this.cells.filter(cell => {
      if (cell.age > this.config.maxCellAge || !cell.active) {
        if (cell.membrane) {
          this.scene.remove(cell.membrane)
          cell.membrane.geometry.dispose()
          cell.membrane.material.dispose()
        }
        if (cell.nucleus) {
          this.scene.remove(cell.nucleus)
          cell.nucleus.geometry.dispose()
          cell.nucleus.material.dispose()
        }
        return false
      }
      return true
    })
  }

  onMouseMove(event) {
    // Create environmental influence
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )
    
    const influenceRadius = 15
    const influenceStrength = 0.2
    const mouseWorldPos = new THREE.Vector3(mouse.x * 50, mouse.y * 50, 0)
    
    this.cells.forEach(cell => {
      if (!cell.active) return
      
      const distance = cell.position.distanceTo(mouseWorldPos)
      
      if (distance < influenceRadius) {
        const influence = (influenceRadius - distance) / influenceRadius
        const direction = cell.position.clone().sub(mouseWorldPos).normalize()
        cell.position.add(direction.multiplyScalar(influence * influenceStrength))
      }
    })
  }

  onClick(event) {
    // Add nutrients at click location
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )
    
    const stimulusPos = new THREE.Vector3(mouse.x * 50, mouse.y * 50, 0)
    
    // Accelerate nearby cells
    this.cells.forEach(cell => {
      const distance = cell.position.distanceTo(stimulusPos)
      if (distance < 10) {
        cell.age += 0.5 // Accelerate aging to trigger division
      }
    })
    
    console.log('🧬 Nutrient stimulus applied')
  }

  togglePause() {
    this.isPaused = !this.isPaused
    
    const pauseBtn = document.getElementById('pause-btn')
    if (pauseBtn) {
      pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause'
    }
  }

  reset() {
    // Clear all cells
    this.cells.forEach(cell => {
      if (cell.membrane) {
        this.scene.remove(cell.membrane)
        cell.membrane.geometry.dispose()
        cell.membrane.material.dispose()
      }
      if (cell.nucleus) {
        this.scene.remove(cell.nucleus)
        cell.nucleus.geometry.dispose()
        cell.nucleus.material.dispose()
      }
    })
    
    this.cells = []
    this.createMotherCell()
    
    this.isPaused = false
    const pauseBtn = document.getElementById('pause-btn')
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause'
    }
  }

  onEnter() {
    console.log('🧬 Entering enhanced culture scene')
    
  }

  onExit() {
    console.log('🧬 Exiting enhanced culture scene')
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.4,
      directionalIntensity: 0.6,
      directionalPosition: [20, 30, 40]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 0, 60],
      target: [0, 0, 0],
      fov: 75
    }
  }

  getDescription() {
    return 'Realistic cell division simulation with membrane dynamics and organic growth'
  }

  getScene() {
    return this.scene
  }

  dispose() {
    this.cells.forEach(cell => {
      if (cell.membrane) {
        cell.membrane.geometry.dispose()
        cell.membrane.material.dispose()
      }
      if (cell.nucleus) {
        cell.nucleus.geometry.dispose()
        cell.nucleus.material.dispose()
      }
    })
    
    if (this.nutrientField) {
      this.nutrientField.geometry.dispose()
      this.nutrientField.material.dispose()
      this.nutrientField.material.uniforms.pointTexture.value.dispose()
    }
    
    console.log('🧬 Enhanced culture scene disposed')
  }
}