import * as THREE from 'three'

export class CellularGenesisScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    
    // Core cellular system
    this.cells = []
    this.motherCell = null
    this.cellMeshes = []
    this.divisionAnimations = []
    
    // Interactive controls
    this.timeControl = 1.0 // Time multiplier
    this.temperature = 1.0 // Environmental factor
    this.nutrients = 1.0 // Environmental factor
    this.interventionActive = false
    
    // System state
    this.time = 0
    this.isPaused = false // Start active, not paused
    this.totalGenerations = 0
    this.fibonacciSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    
    // PRD-specified configuration for cellular genesis - ULTRA-SLOW meditative pace
    this.config = {
      motherCellSize: 2.0,
      maxCells: 4, // Very few cells for sacred geometry
      divisionCooldown: 600.0, // 10 MINUTES between divisions - extremely slow
      maxGenerations: 2, // Very few generations
      cellLifespan: 2400.0, // 40 minutes lifespan
      colors: {
        motherCell: 0x0D4F5C, // Teal luminescence
        youngCell: 0x1B4F72, // Electric blue
        matureCell: 0x82A67D, // Sage green
        agingCell: 0xB7472A, // Clay red
        membrane: 0xF8F9FA, // Bioluminescent white
        nucleus: 0x0B1426 // Deep ocean
      },
      physics: {
        membraneTension: 0.8,
        nucleusSeparation: 1.2,
        growthRate: 0.1, // Much slower growth for meditative pace
        divisionForce: 1.0 // Gentler division
      }
    }
    
    this.performanceSettings = null
  }

  async init() {
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    this.adjustForPerformance()
    
    // Create the single mother cell in center of view
    this.createMotherCell()
    
    // Setup environmental systems
    this.setupEnvironmentalFactors()
    
    // Setup interactive controls as specified in PRD
    this.setupInteractiveControls()
    
    // Initialize division mechanics
    this.initializeDivisionSystem()
    
    console.log('🧬 Cellular Genesis Simulator initialized - Starting with mother cell')
  }

  updateEvolution(progress) {
    // Keep meditative pace regardless of scroll progress
    this.timeControl = 0.5 // Actually slow down even more for contemplation
  }

  animateEntry() {
    console.log('🧬 Cellular scene entry animation - forcing maximum visibility')
    // Make sure the scene is visible and active
    this.isPaused = false
    
    // Make cells visible without forcing immediate division
    this.cells.forEach(cell => {
      // Reset age to allow natural progression
      cell.age = 0 // Start from beginning of life cycle
      if (cell.mesh) {
        cell.mesh.visible = true
        cell.mesh.scale.setScalar(2.5) // Better visibility without being too large
        cell.mesh.renderOrder = 100
        cell.mesh.position.y = 0 // Ground level
        
        // Make materials more transparent and realistic
        cell.mesh.traverse(child => {
          if (child.material) {
            child.material.opacity = 0.9 // Much more visible
            child.material.transparent = true
            child.material.depthTest = true
          }
        })
      }
    })
    
    // Ensure mother cell is ultra-visible
    if (this.motherCell?.mesh) {
      this.motherCell.mesh.visible = true
      this.motherCell.mesh.scale.setScalar(2.8) // Large but reasonable scale
      this.motherCell.mesh.position.y = 5 // Moderate height position
      this.motherCell.mesh.renderOrder = 200
      console.log('🧬 Mother cell made ultra-visible at scale 4.0, position:', this.motherCell.mesh.position)
    }
    
    // Delay first division to allow proper viewing
    setTimeout(() => {
      if (this.motherCell && !this.motherCell.isDividing) {
        console.log('🧬 Starting first meditative cell division after viewing period')
        this.initiateCellDivision(this.motherCell)
      }
    }, 120000) // Wait 2 minutes before first division
    
    // Continuous division triggers for EXTREMELY slow meditative formation
    this.divisionInterval = setInterval(() => {
      if (this.cells.length < 3) { // Very low max cells for sacred geometry
        const availableCells = this.cells.filter(cell => !cell.isDividing && cell.age > 600) // Require 10 minutes age
        if (availableCells.length > 0 && Math.random() < 0.005) { // Only 0.5% chance to divide
          const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)]
          console.log(`🧬 Auto-triggering ULTRA-slow meditative division for cell ${randomCell.id}`)
          this.initiateCellDivision(randomCell)
        }
      }
    }, 1200000) // Every 20 MINUTES - extremely slow
  }

  animateExit() {
    console.log('🧬 Cellular scene exit animation')
    // Optionally pause evolution when not visible
    this.isPaused = true
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.config.maxCells = 300
        this.config.maxGenerations = 8
        break
      case 'medium':
        this.config.maxCells = 500
        this.config.maxGenerations = 10
        break
      case 'high':
        this.config.maxCells = 800
        this.config.maxGenerations = 12
        break
    }
  }

  createMotherCell() {
    // Create the initial mother cell closer and more visible
    const motherCellData = {
      id: 'mother-0',
      position: new THREE.Vector3(0, 0, 30), // Closer and visible to camera
      generation: 0,
      age: 0,
      size: this.config.motherCellSize * 3, // Much larger
      divisionTimer: 0,
      nucleus: { position: new THREE.Vector3(0, 0, 0) },
      membrane: { tension: 1.0 },
      geneticVariation: this.generateGeneticVariation(),
      isDividing: false,
      children: []
    }
    
    const cellMesh = this.createCellMesh(motherCellData)
    motherCellData.mesh = cellMesh
    
    // Moderate scale settings for good visibility and sacred geometry
    cellMesh.visible = true
    cellMesh.scale.setScalar(2.5) // Much larger scale for better visibility
    cellMesh.renderOrder = 100
    
    this.motherCell = motherCellData
    this.cells.push(motherCellData)
    this.cellMeshes.push(cellMesh)
    this.scene.add(cellMesh)
    
    console.log('🧬 Bright, visible mother cell created at position:', cellMesh.position, 'with scale:', cellMesh.scale.x)
  }

  generateGeneticVariation() {
    // Generate unique visual characteristics as per PRD
    return {
      colorVariation: new THREE.Color().setHSL(
        0.5 + (Math.random() - 0.5) * 0.3, // Hue variation around blue-green
        0.6 + Math.random() * 0.3, // Saturation
        0.4 + Math.random() * 0.4  // Lightness
      ),
      sizeVariation: 0.8 + Math.random() * 0.4,
      divisionTendency: 0.5 + Math.random() * 0.5,
      growthPattern: Math.random() > 0.5 ? 'radial' : 'spiral'
    }
  }

  createCellMesh(cellData) {
    // Create highly visible cell with bright materials
    const cellGroup = new THREE.Group()
    
    // Create bright, glowing membrane with subtle transparency
    const membraneGeometry = new THREE.SphereGeometry(cellData.size, 20, 20)
    const membraneMaterial = new THREE.MeshBasicMaterial({
      color: cellData.geneticVariation.colorVariation,
      transparent: true,
      opacity: 0.8, // More visible, less transparent
      wireframe: false,
      fog: false, // Ignore fog
      depthTest: true, // Enable depth testing for proper transparency
      side: THREE.DoubleSide
    })
    const membraneMesh = new THREE.Mesh(membraneGeometry, membraneMaterial)
    
    // Create bright nucleus with subtle transparency
    const nucleusGeometry = new THREE.SphereGeometry(cellData.size * 0.4, 16, 16)
    const nucleusMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.config.colors.nucleus).multiplyScalar(1.5), // Less bright
      transparent: true,
      opacity: 0.9, // Much more visible
      fog: false,
      depthTest: true
    })
    const nucleusMesh = new THREE.Mesh(nucleusGeometry, nucleusMaterial)
    nucleusMesh.position.copy(cellData.nucleus.position)
    
    // Add subtle wireframe for structure
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: this.config.colors.membrane,
      wireframe: true,
      transparent: true,
      opacity: 0.2, // Very subtle wireframe
      depthTest: true
    })
    const wireframeMesh = new THREE.Mesh(membraneGeometry.clone(), wireframeMaterial)
    
    cellGroup.add(membraneMesh)
    cellGroup.add(nucleusMesh)
    cellGroup.add(wireframeMesh)
    
    cellGroup.position.copy(cellData.position)
    cellGroup.visible = true
    cellGroup.renderOrder = 100 // Render on top
    
    // Store references
    cellGroup.userData = {
      cellData,
      membrane: membraneMesh,
      nucleus: nucleusMesh,
      wireframe: wireframeMesh,
      organelles: []
    }
    
    console.log(`🧬 Created visible cell at position:`, cellData.position)
    return cellGroup
  }

  createMembraneMaterial(cellData) {
    const baseColor = cellData.geneticVariation.colorVariation
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cellAge: { value: 0 },
        divisionProgress: { value: 0 },
        membraneColor: { value: baseColor },
        transparency: { value: 0.7 },
        tension: { value: 1.0 }
      },
      vertexShader: `
        uniform float time;
        uniform float cellAge;
        uniform float divisionProgress;
        uniform float tension;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vLifeCycle;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vLifeCycle = cellAge / 45.0; // Normalize age
          
          vec3 pos = position;
          
          // Membrane tension effects
          pos += normal * sin(time * 2.0 + pos.x * 5.0) * 0.05 * tension;
          
          // Division deformation
          if (divisionProgress > 0.0) {
            float divisionDirection = pos.x > 0.0 ? 1.0 : -1.0;
            pos.x += divisionDirection * divisionProgress * 0.5;
            pos *= 1.0 + divisionProgress * 0.3;
          }
          
          // Pulsing with life
          float pulse = sin(time * 1.5) * 0.02 + 1.0;
          pos *= pulse;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 membraneColor;
        uniform float transparency;
        uniform float cellAge;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vLifeCycle;
        
        void main() {
          // Age-based color changes
          vec3 youngColor = membraneColor;
          vec3 matureColor = mix(membraneColor, vec3(0.5, 0.8, 0.4), 0.3);
          vec3 agingColor = mix(matureColor, vec3(0.8, 0.3, 0.2), 0.5);
          
          vec3 finalColor = youngColor;
          if (vLifeCycle > 0.3) {
            finalColor = mix(youngColor, matureColor, (vLifeCycle - 0.3) / 0.4);
          }
          if (vLifeCycle > 0.7) {
            finalColor = mix(matureColor, agingColor, (vLifeCycle - 0.7) / 0.3);
          }
          
          // Fresnel effect for membrane translucency
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          finalColor += fresnel * 0.3;
          
          // Subtle membrane ripples
          float ripple = sin(vPosition.x * 8.0 + time * 3.0) * 
                        cos(vPosition.y * 6.0 + time * 2.0) * 0.1 + 0.9;
          finalColor *= ripple;
          
          gl_FragColor = vec4(finalColor, transparency);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })
  }

  createNucleusMaterial(cellData) {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        nucleusColor: { value: new THREE.Color(this.config.colors.nucleus) },
        separationProgress: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        uniform float separationProgress;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          vec3 pos = position;
          
          // Nuclear separation during division
          if (separationProgress > 0.0) {
            float separationDirection = pos.x > 0.0 ? 1.0 : -1.0;
            pos.x += separationDirection * separationProgress * 0.8;
          }
          
          // DNA replication movement
          pos += sin(time * 4.0 + pos.y * 10.0) * 0.02;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 nucleusColor;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vec3 color = nucleusColor;
          
          // DNA strands visualization
          float dnaPattern = sin(vPosition.x * 15.0 + time) * 
                           cos(vPosition.y * 12.0 + time * 0.7) * 0.3 + 0.7;
          color *= dnaPattern;
          
          // Central glow
          float centerGlow = 1.0 - length(vPosition) * 0.5;
          color += centerGlow * 0.4;
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true
    })
  }

  createOrganelles(cellData) {
    // Create mitochondria and other organelles for realism
    const organelles = []
    const organelleCount = 3 + Math.floor(Math.random() * 4)
    
    for (let i = 0; i < organelleCount; i++) {
      const organelleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 8, 8)
      const organelleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.3 + Math.random() * 0.4, 0.6, 0.5),
        transparent: true,
        opacity: 0.6
      })
      
      const organelle = new THREE.Mesh(organelleGeometry, organelleMaterial)
      
      // Position organelles around the cell
      const angle = (i / organelleCount) * Math.PI * 2
      const radius = cellData.size * (0.4 + Math.random() * 0.3)
      organelle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * cellData.size * 0.6
      )
      
      organelles.push(organelle)
    }
    
    return organelles
  }

  setupEnvironmentalFactors() {
    // Temperature, nutrients, and other variables as specified in PRD
    this.environmentalControls = {
      temperature: 1.0,
      nutrients: 1.0,
      oxygenLevel: 1.0,
      toxicity: 0.0
    }
  }

  setupDivisionPhysics(animation) {
    // Initialize physics simulation for realistic cell division
    const { parentCell } = animation
    
    // Calculate division axis based on cell orientation
    const divisionAxis = new THREE.Vector3(1, 0, 0)
    if (parentCell.geneticVariation.growthPattern === 'spiral') {
      divisionAxis.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2)
    }
    
    animation.divisionAxis = divisionAxis
    animation.originalScale = parentCell.mesh.scale.clone()
    
    // Setup membrane tension simulation
    animation.membranePoints = this.generateMembranePoints(parentCell)
  }
  
  generateMembranePoints(cell) {
    // Generate points around cell membrane for deformation simulation
    const points = []
    const segments = 16
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const point = {
        angle,
        originalRadius: cell.size,
        currentRadius: cell.size,
        velocity: 0,
        force: 0
      }
      points.push(point)
    }
    
    return points
  }

  setupInteractiveControls() {
    // Setup PRD-specified interactive elements
    const pauseBtn = document.getElementById('pause-btn')
    const resetBtn = document.getElementById('reset-btn')
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.togglePause())
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSimulation())
    }
    
    // Environmental control sliders (if they exist in HTML)
    this.setupEnvironmentalSliders()
  }

  setupEnvironmentalSliders() {
    // Setup sliders for environmental factors if they exist
    const temperatureSlider = document.getElementById('temperature-slider')
    const nutrientSlider = document.getElementById('nutrient-slider')
    
    if (temperatureSlider) {
      temperatureSlider.addEventListener('input', (e) => {
        this.temperature = parseFloat(e.target.value)
      })
    }
    
    if (nutrientSlider) {
      nutrientSlider.addEventListener('input', (e) => {
        this.nutrients = parseFloat(e.target.value)
      })
    }
  }

  initializeDivisionSystem() {
    // Initialize the realistic cell division physics
    this.divisionQueue = []
  }

  togglePause() {
    this.isPaused = !this.isPaused
    
    const pauseBtn = document.getElementById('pause-btn')
    if (pauseBtn) {
      pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause'
    }
  }

  resetSimulation() {
    // Reset to initial mother cell state
    this.cells.forEach(cell => {
      if (cell.mesh) {
        this.scene.remove(cell.mesh)
      }
    })
    
    this.cells = []
    this.cellMeshes = []
    this.divisionAnimations = []
    this.totalGenerations = 0
    this.time = 0
    
    // Recreate mother cell
    this.createMotherCell()
  }

  shouldCellDivide(cell) {
    // Determine if cell should divide based on multiple factors
    if (cell.isDividing || cell.generation >= this.config.maxGenerations) {
      return false
    }
    
    // Age factor - cells divide when mature enough
    if (cell.age < this.config.divisionCooldown) {
      return false
    }
    
    // Environmental factors affect division rate
    const environmentalFactor = this.temperature * this.nutrients * (1 - (this.environmentalControls?.toxicity || 0))
    
    // Genetic variation affects division tendency
    const geneticFactor = cell.geneticVariation.divisionTendency
    
    // Population pressure - fewer divisions when crowded
    const populationPressure = Math.max(0.1, 1 - (this.cells.length / this.config.maxCells))
    
    // Linear probability to prevent exponential growth
    let baseProbability
    if (this.cells.length === 1) {
      baseProbability = 0.05 // Lower for mother cell
    } else if (this.cells.length < 3) {
      baseProbability = 0.03 // Lower for early generations
    } else {
      baseProbability = 0.01 // Very low rate to prevent exponential growth
    }
    
    const divisionProbability = baseProbability * environmentalFactor * geneticFactor * populationPressure * this.timeControl
    
    return Math.random() < divisionProbability
  }

  initiateCellDivision(parentCell) {
    if (this.cells.length >= this.config.maxCells) {
      return
    }
    
    console.log(`🧬 Starting cell division for cell ${parentCell.id} (Generation ${parentCell.generation})`)
    
    parentCell.isDividing = true
    
    // Enhanced division animation with compute-based physics
    const divisionAnimation = {
      parentCell,
      progress: 0,
      duration: 300.0, // ULTRA-slow, 5-minute meditative division
      phase: 'preparation', // phases: preparation, stretching, separation, completion
      childCells: [],
      divisionForce: new THREE.Vector3(),
      membraneDeformation: 0,
      nucleusOffset: new THREE.Vector3()
    }
    
    // Initialize division physics
    this.setupDivisionPhysics(divisionAnimation)
    
    this.divisionAnimations.push(divisionAnimation)
    
    console.log(`🧬 Cell division initiated: Generation ${parentCell.generation} → ${parentCell.generation + 1}`)
  }

  updateDivisionAnimations(deltaTime) {
    if (!this.divisionAnimations || !Array.isArray(this.divisionAnimations)) {
      this.divisionAnimations = []
      return
    }
    
    this.divisionAnimations = this.divisionAnimations.filter(animation => {
      animation.progress += deltaTime / animation.duration
      
      // Compute-based division physics with smooth transitions
      if (animation.progress <= 0.25) {
        // Phase 1: Preparation - cell elongates
        animation.phase = 'preparation'
        this.simulatePreparationPhase(animation, deltaTime)
      } else if (animation.progress <= 0.6) {
        // Phase 2: Stretching - membrane deforms
        animation.phase = 'stretching'
        this.simulateStretchingPhase(animation, deltaTime)
      } else if (animation.progress <= 0.9) {
        // Phase 3: Separation - nucleus divides
        animation.phase = 'separation'
        this.simulateSeparationPhase(animation, deltaTime)
      } else if (animation.progress < 1.0) {
        // Phase 4: Completion - finalize division
        animation.phase = 'completion'
        this.simulateCompletionPhase(animation, deltaTime)
      } else {
        // Division complete
        this.completeDivision(animation)
        return false // Remove animation
      }
      
      return true
    })
  }

  simulatePreparationPhase(animation, deltaTime) {
    const { parentCell, progress } = animation
    const normalizedProgress = progress / 0.25
    
    // Cell begins to elongate along division axis
    const elongationFactor = 1 + normalizedProgress * 0.3
    const mesh = parentCell.mesh
    
    if (mesh) {
      mesh.scale.x = animation.originalScale.x * elongationFactor
      mesh.scale.y = animation.originalScale.y * (1 - normalizedProgress * 0.1)
      mesh.scale.z = animation.originalScale.z * (1 - normalizedProgress * 0.1)
      
      // Update shader uniforms if available
      if (mesh.userData.membrane?.material.uniforms) {
        mesh.userData.membrane.material.uniforms.tension.value = 1 + normalizedProgress * 0.5
      }
    }
    
    console.log(`🧬 Preparation phase: ${Math.round(normalizedProgress * 100)}%`)
  }

  simulateStretchingPhase(animation, deltaTime) {
    const { parentCell, progress } = animation
    const phaseProgress = (progress - 0.25) / 0.35
    const mesh = parentCell.mesh
    
    // Dramatic stretching with membrane physics
    const stretchFactor = 1 + phaseProgress * 1.5
    const compressionFactor = 1 - phaseProgress * 0.3
    
    if (mesh) {
      mesh.scale.x = animation.originalScale.x * stretchFactor
      mesh.scale.y = animation.originalScale.y * compressionFactor
      mesh.scale.z = animation.originalScale.z * compressionFactor
      
      // Simulate membrane tension
      if (mesh.userData.membrane?.material.uniforms) {
        mesh.userData.membrane.material.uniforms.tension.value = 1 + phaseProgress * 2
        mesh.userData.membrane.material.uniforms.divisionProgress.value = phaseProgress * 0.6
      }
      
      // Nucleus begins to separate
      if (mesh.userData.nucleus?.material.uniforms) {
        mesh.userData.nucleus.material.uniforms.separationProgress.value = phaseProgress * 0.4
      }
    }
    
    console.log(`🧬 Stretching phase: ${Math.round(phaseProgress * 100)}%`)
  }

  simulateSeparationPhase(animation, deltaTime) {
    const { parentCell, progress } = animation
    const phaseProgress = (progress - 0.6) / 0.3
    const mesh = parentCell.mesh
    
    // Maximum deformation before splitting
    const maxStretch = 1 + 1.5 + phaseProgress * 0.5
    const maxCompression = 0.7 - phaseProgress * 0.2
    
    if (mesh) {
      mesh.scale.x = animation.originalScale.x * maxStretch
      mesh.scale.y = animation.originalScale.y * maxCompression
      mesh.scale.z = animation.originalScale.z * maxCompression
      
      // Critical membrane tension
      if (mesh.userData.membrane?.material.uniforms) {
        mesh.userData.membrane.material.uniforms.tension.value = 3 + phaseProgress * 2
        mesh.userData.membrane.material.uniforms.divisionProgress.value = 0.6 + phaseProgress * 0.3
      }
      
      // Complete nuclear separation
      if (mesh.userData.nucleus?.material.uniforms) {
        mesh.userData.nucleus.material.uniforms.separationProgress.value = 0.4 + phaseProgress * 0.6
      }
    }
    
    console.log(`🧬 Separation phase: ${Math.round(phaseProgress * 100)}%`)
  }

  simulateCompletionPhase(animation, deltaTime) {
    const { parentCell, progress } = animation
    const phaseProgress = (progress - 0.9) / 0.1
    
    // Prepare for final split
    console.log(`🧬 Completion phase: ${Math.round(phaseProgress * 100)}% - About to split!`)
  }

  completeDivision(animation) {
    const { parentCell } = animation
    
    if (!parentCell) {
      console.error('🧬 Cannot complete division - parent cell is undefined')
      return
    }
    
    console.log(`🧬 Completing division for cell ${parentCell.id}`)
    
    // Create two daughter cells with maximum visibility
    let daughterCell1, daughterCell2
    
    try {
      daughterCell1 = this.createDaughterCell(parentCell, -1)
      daughterCell2 = this.createDaughterCell(parentCell, 1)
    } catch (error) {
      console.error('🧬 Error creating daughter cells:', error)
      return
    }
    
    if (!daughterCell1 || !daughterCell2) {
      console.error('🧬 Failed to create daughter cells')
      return
    }
    
    // DON'T remove parent cell immediately - keep it visible for a moment
    setTimeout(() => {
      if (parentCell.mesh && this.scene.children.includes(parentCell.mesh)) {
        this.scene.remove(parentCell.mesh)
        const parentIndex = this.cells.indexOf(parentCell)
        if (parentIndex !== -1) {
          this.cells.splice(parentIndex, 1)
        }
      }
    }, 1000) // Keep parent visible for 1 second during transition
    
    // Add daughter cells with forced visibility
    if (!this.cells || !Array.isArray(this.cells)) {
      this.cells = []
    }
    this.cells.push(daughterCell1, daughterCell2)
    parentCell.children = [daughterCell1, daughterCell2]
    
    // Force daughter cells to be ultra-visible (safe array handling)
    const daughterCells = [daughterCell1, daughterCell2].filter(cell => cell && cell.mesh)
    
    daughterCells.forEach(cell => {
      cell.mesh.visible = true
      cell.mesh.scale.setScalar(3.0)
      cell.mesh.renderOrder = 150
      cell.mesh.position.y = 8
      
      // Force all materials to be super bright
      cell.mesh.traverse(child => {
        if (child.material) {
          child.material.opacity = 1.0
          child.material.transparent = false
          child.material.depthTest = false
          child.material.fog = false
        }
      })
    })
    
    this.totalGenerations = Math.max(this.totalGenerations, daughterCell1?.generation || 0)
    
    console.log(`🧬 Division complete! Now have ${this.cells.length} cells total`)
    
    // Apply flower of life sacred geometry arrangement
    this.arrangeCellsInFlowerOfLifePattern()
  }

  createDaughterCell(parentCell, direction) {
    const daughterData = {
      id: `${parentCell.id}-${direction > 0 ? 'right' : 'left'}`,
      position: parentCell.position.clone(),
      generation: parentCell.generation + 1,
      age: 0,
      size: parentCell.size * 0.9, // Keep large for visibility
      divisionTimer: 0,
      nucleus: { position: new THREE.Vector3() },
      membrane: { tension: 1.0 },
      geneticVariation: this.evolveGeneticVariation(parentCell.geneticVariation),
      isDividing: false,
      children: [],
      parent: parentCell
    }
    
    // Position daughter cells with proper sacred geometry spacing
    daughterData.position.x += direction * parentCell.size * 2.0 // Sacred geometry diameter spacing
    daughterData.position.y = 0 // Keep at center level
    daughterData.position.z += direction * parentCell.size * 0.2
    
    const cellMesh = this.createCellMesh(daughterData)
    daughterData.mesh = cellMesh
    
    // Moderate scale for good visibility and sacred geometry
    cellMesh.visible = true
    cellMesh.scale.setScalar(2.2) // Better scale for daughter cells
    cellMesh.renderOrder = 150
    
    this.scene.add(cellMesh)
    
    console.log(`🧬 Created daughter cell ${daughterData.id} at position:`, daughterData.position)
    
    return daughterData
  }

  evolveGeneticVariation(parentVariation) {
    // Introduce slight mutations for genetic diversity
    const mutation = 0.1
    
    return {
      colorVariation: new THREE.Color().copy(parentVariation.colorVariation).offsetHSL(
        (Math.random() - 0.5) * mutation,
        (Math.random() - 0.5) * mutation * 0.5,
        (Math.random() - 0.5) * mutation * 0.5
      ),
      sizeVariation: parentVariation.sizeVariation * (1 + (Math.random() - 0.5) * mutation),
      divisionTendency: Math.max(0.1, Math.min(1.0, 
        parentVariation.divisionTendency + (Math.random() - 0.5) * mutation
      )),
      growthPattern: Math.random() > 0.9 ? 
        (parentVariation.growthPattern === 'radial' ? 'spiral' : 'radial') : 
        parentVariation.growthPattern
    }
  }

  arrangeCellsInFlowerOfLifePattern() {
    // Arrange cells in the sacred geometry Flower of Life pattern with slow pulsing
    if (this.cells.length < 2) return
    
    // Define the Flower of Life positions - hexagonal packing with sacred ratios
    const flowerPositions = this.generateFlowerOfLifePositions(this.cells.length)
    
    // Slow breathing pulse - extremely slow cycle
    const breathingCycle = this.time * 0.05 // Much much slower breathing
    const pulseScale = 0.98 + Math.sin(breathingCycle) * 0.02 // Very gentle 2% scale variation
    const verticalPulse = Math.sin(breathingCycle * 0.7) * 0.3 // Very gentle vertical breathing
    
    this.cells.forEach((cell, index) => {
      if (index === 0) {
        // Mother cell stays at center with gentle pulsing
        const centerPosition = new THREE.Vector3(0, 0 + verticalPulse, 0)
        cell.position.lerp(centerPosition, 0.02) // Slower movement
        
        // Gentle pulsing scale
        if (cell.mesh) {
          const basePulse = 1.0 + Math.sin(breathingCycle + index) * 0.03
          cell.mesh.scale.setScalar(basePulse)
        }
      } else if (index - 1 < flowerPositions.length) {
        // Arrange other cells in flower of life pattern with pulsing
        const flowerPos = flowerPositions[index - 1]
        const targetPosition = new THREE.Vector3(
          flowerPos.x * pulseScale, 
          flowerPos.layer * 3.0 + verticalPulse, // Better 3D layering separation
          flowerPos.z * pulseScale
        )
        
        // Extremely slow, smooth movement towards flower position
        cell.position.lerp(targetPosition, 0.008)
        
        // Very gentle pulsing scale for each cell
        if (cell.mesh) {
          const individualPulse = 1.0 + Math.sin(breathingCycle + index * 0.2) * 0.01
          cell.mesh.scale.setScalar(individualPulse)
          
          // Very slow rotation based on sacred geometry
          const rotationSpeed = 0.0001 // Extremely slow rotation
          cell.mesh.rotation.y += rotationSpeed * (index % 2 === 0 ? 1 : -1)
        }
      }
      
      if (cell.mesh) {
        cell.mesh.position.copy(cell.position)
      }
    })
  }

  generateFlowerOfLifePositions(cellCount) {
    const positions = []
    // Sacred geometry: distance between centers = diameter of spheres for perfect touching
    const sphereDiameter = this.config.motherCellSize * 2 // Cell size is radius, so diameter = 2 * radius
    const centerDistance = sphereDiameter // Perfect sacred geometry spacing - spheres just touch
    
    console.log(`🌸 Generating flower of life for ${cellCount} cells with spacing ${centerDistance}`)
    
    // First ring - 6 cells around center (traditional flower of life)
    for (let i = 0; i < 6 && positions.length < cellCount - 1; i++) {
      const angle = (i / 6) * Math.PI * 2
      positions.push({
        x: Math.cos(angle) * centerDistance,
        z: Math.sin(angle) * centerDistance,
        layer: 0,
        ring: 1,
        index: i
      })
    }
    
    // Second ring - 12 cells in outer ring with proper sacred geometry
    for (let i = 0; i < 12 && positions.length < cellCount - 1; i++) {
      const angle = (i / 12) * Math.PI * 2
      const radius = centerDistance * Math.sqrt(3) // Sacred geometry ratio for second ring
      positions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        layer: 1, // Second layer for 3D effect
        ring: 2,
        index: i
      })
    }
    
    // Third ring - positioned for perfect 3D flower of life geometry  
    for (let i = 0; i < 6 && positions.length < cellCount - 1; i++) {
      const angle = (i / 6) * Math.PI * 2 + (Math.PI / 6) // Offset by 30 degrees
      const radius = centerDistance * 2 // Proper sacred spacing
      positions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        layer: 2, // Third layer for full 3D effect
        ring: 3,
        index: i
      })
    }
    
    // Additional 3D layers - create flower of life in multiple vertical levels
    if (positions.length < cellCount - 1) {
      const remainingCells = (cellCount - 1) - positions.length
      
      for (let layer = 1; layer <= Math.ceil(remainingCells / 19); layer++) {
        // Each layer follows the same pattern but offset vertically
        for (let i = 0; i < 19 && positions.length < cellCount - 1; i++) {
          const ring = i < 6 ? 1 : i < 18 ? 2 : 3
          const ringSize = ring === 1 ? 6 : ring === 2 ? 12 : 6
          const ringIndex = ring === 1 ? i : ring === 2 ? i - 6 : i - 18
          
          const angle = (ringIndex / ringSize) * Math.PI * 2 + (layer * 0.3) // Slight rotation per layer
          const radius = centerDistance * ring * 0.8 // Slightly smaller for upper layers
          
          positions.push({
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius,
            layer: layer,
            ring: ring
          })
        }
      }
    }
    
    return positions
  }

  update(deltaTime) {
    if (this.isPaused) return
    
    this.time += deltaTime * this.timeControl
    
    // Update all cells
    this.cells.forEach(cell => {
      this.updateCell(cell, deltaTime)
    })
    
    // Process division animations
    this.updateDivisionAnimations(deltaTime)
    
    // Check for new divisions
    this.cells.forEach(cell => {
      if (this.shouldCellDivide(cell)) {
        this.initiateCellDivision(cell)
      }
    })
    
    // Arrange cells in flower of life sacred geometry pattern
    this.arrangeCellsInFlowerOfLifePattern()
    
    // Clean up old cells if needed
    this.cleanupOldCells()
  }

  updateCell(cell, deltaTime) {
    cell.age += deltaTime * this.timeControl
    
    // Update cell mesh materials
    if (cell.mesh && cell.mesh.userData) {
      const { membrane, nucleus } = cell.mesh.userData
      
      if (membrane && membrane.material.uniforms) {
        membrane.material.uniforms.time.value = this.time
        membrane.material.uniforms.cellAge.value = cell.age
      }
      
      if (nucleus && nucleus.material.uniforms) {
        nucleus.material.uniforms.time.value = this.time
      }
      
      // Gentle growth over time
      if (cell.age < 10) {
        const growthFactor = 1 + (cell.age / 10) * 0.2
        cell.mesh.scale.setScalar(growthFactor)
      }
      
      // Subtle floating motion
      cell.mesh.position.y += Math.sin(this.time + cell.position.x) * 0.01
    }
  }

  cleanupOldCells() {
    // Don't remove cells - keep them all visible for continuous animation
    // Just limit total count instead of removing by age
    if (this.cells.length > this.config.maxCells * 2) {
      const oldestCells = this.cells
        .filter(cell => !cell.isDividing)
        .sort((a, b) => a.age - b.age)
        .slice(0, 10) // Remove oldest 10 cells
      
      oldestCells.forEach(cell => {
        if (cell.mesh) {
          this.scene.remove(cell.mesh)
        }
        const index = this.cells.indexOf(cell)
        if (index !== -1) {
          this.cells.splice(index, 1)
        }
      })
      
      console.log(`🧬 Cleaned up ${oldestCells.length} oldest cells. Now have ${this.cells.length} cells`)
    }
  }

  updateScroll(progress, direction) {
    // Handle any scroll-based effects
  }

  onEnter() {
    console.log('🧬 Entering Cellular Genesis Simulator')
    
  }

  onExit() {
    console.log('🧬 Exiting Cellular Genesis Simulator')
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.4,
      directionalIntensity: 0.6,
      directionalPosition: [15, 25, 15]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 20, 40],
      target: [0, 0, 0],
      fov: 70
    }
  }

  getDescription() {
    return 'Realistic cellular division simulator showing mitosis with membrane tension and nuclear separation'
  }

  getScene() {
    return this.scene
  }

  dispose() {
    // Clear division interval
    if (this.divisionInterval) {
      clearInterval(this.divisionInterval)
    }
    
    // Clean up all cells and animations
    this.cells.forEach(cell => {
      if (cell.mesh) {
        cell.mesh.traverse(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
        this.scene.remove(cell.mesh)
      }
    })
    
    console.log('🧬 Cellular Genesis scene disposed')
  }
}