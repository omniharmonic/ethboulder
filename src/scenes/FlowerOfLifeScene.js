import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class FlowerOfLifeScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    
    // GLB model and animation system
    this.flowerModel = null
    this.animatedSpheres = []
    this.loader = new GLTFLoader()
    
    // Animation timing - smooth counter-rotation parallax for meditative effect
    this.time = 0
    this.isPaused = false
    this.rotationSpeed = 0.003 // Increased rotation speed as requested
    this.sphereAppearanceRate = 4.0 // Slower sphere appearance for meditation
    this.nextSphereTime = 0
    this.cameraRotationSpeed = -0.001 // Increased counter-rotation for more visible parallax
    
    // Sacred geometry configuration
    this.config = {
      modelPath: '/models/LeadEdgeMaze3D (2).glb',
      sphereRadius: 0.2, // Much smaller spheres
      maxAnimatedSpheres: 15, // Fewer spheres for simplicity
      colors: {
        primary: 0x4FC3F7, // Transparent blue
        secondary: 0x81D4FA, // Lighter blue
        accent: 0x29B6F6 // Darker blue
      },
      animation: {
        rotationSpeed: 0.005,
        sphereOpacity: 0.6,
        breathingAmplitude: 0.02,
        breathingSpeed: 0.3
      }
    }
    
    // Camera configuration for optimal viewing - EXTREMELY zoomed out and meditative
    this.idealCameraConfig = {
      position: [0, 120, 200], // Much further away for peaceful, broad view
      target: [0, 0, 0],
      fov: 45 // Narrower field of view for focused, distant viewing
    }
  }

  async init() {
    console.log('🌸 Initializing Flower of Life GLB Model Scene')
    
    // Setup ambient environment
    this.setupEnvironment()
    
    // Load the GLB model
    await this.loadFlowerOfLifeModel()
    
    // Setup animated spheres system
    this.setupAnimatedSpheres()
    
    console.log('✨ Flower of Life GLB scene initialized')
  }

  async loadFlowerOfLifeModel() {
    try {
      console.log('🔄 Loading Flower of Life GLB model...')
      const gltf = await this.loader.loadAsync(this.config.modelPath)
      
      this.flowerModel = gltf.scene
      
      // Scale much smaller and position the model appropriately
      this.flowerModel.scale.setScalar(0.8) // Much smaller scale
      this.flowerModel.position.set(0, 0, 0)
      
      // Apply materials to make it match the sacred geometry aesthetic
      this.flowerModel.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhongMaterial({
            color: this.config.colors.primary,
            transparent: true,
            opacity: 0.8,
            shininess: 100
          })
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      this.scene.add(this.flowerModel)
      console.log('✅ Flower of Life GLB model loaded successfully')
      
    } catch (error) {
      console.error('❌ Failed to load Flower of Life GLB model:', error)
      // Fallback to basic geometry if model fails to load
      this.createFallbackGeometry()
    }
  }

  createFallbackGeometry() {
    console.log('🔄 Creating fallback geometry...')
    const geometry = new THREE.SphereGeometry(5, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: this.config.colors.primary,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    })
    
    this.flowerModel = new THREE.Mesh(geometry, material)
    this.scene.add(this.flowerModel)
  }

  setupEnvironment() {
    // Create subtle ground reference (optional)
    const groundGeometry = new THREE.CircleGeometry(50, 32)
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x0B1426,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    this.scene.add(ground)
    
    // Subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)
    
    // Directional light from above for top-down viewing
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
    directionalLight.position.set(0, 50, 0)
    directionalLight.target.position.set(0, 0, 0)
    this.scene.add(directionalLight)
    this.scene.add(directionalLight.target)
  }

  setupAnimatedSpheres() {
    // Initialize the system for spawning animated spheres around the model
    this.nextSphereTime = this.sphereAppearanceRate
    this.spherePositions = this.generateSpherePositions()
    console.log('🌸 Animated spheres system initialized')
  }

  generateSpherePositions() {
    // Generate fixed, harmonious positions around the much smaller flower of life model
    const positions = []
    const radius = 8 // Much smaller radius for smaller model
    const layers = 2 // Fewer layers for simplicity
    
    for (let layer = 0; layer < layers; layer++) {
      const layerRadius = radius + (layer * 6)
      const spheresInLayer = 6 + (layer * 3) // 6, 9 spheres per layer - fewer spheres
      const layerHeight = (layer - 0.5) * 4 // Fixed heights: -2, 2
      
      for (let i = 0; i < spheresInLayer; i++) {
        const angle = (i / spheresInLayer) * Math.PI * 2
        const x = Math.cos(angle) * layerRadius
        const z = Math.sin(angle) * layerRadius
        const y = layerHeight // Fixed height, no random movement
        
        positions.push({
          x, y, z,
          originalY: y,
          color: [this.config.colors.primary, this.config.colors.secondary, this.config.colors.accent][layer],
          layer
        })
      }
    }
    
    return positions
  }

  spawnAnimatedSphere() {
    if (this.animatedSpheres.length >= this.config.maxAnimatedSpheres) {
      return // Don't spawn more than the limit
    }
    
    // Pick a random position from our generated positions
    const positionData = this.spherePositions[Math.floor(Math.random() * this.spherePositions.length)]
    
    // Create sphere data
    const sphereData = {
      id: `animated-sphere-${this.animatedSpheres.length}`,
      targetPosition: new THREE.Vector3(positionData.x, positionData.y, positionData.z),
      currentPosition: new THREE.Vector3(0, 0, 0), // Start at center
      color: positionData.color,
      layer: positionData.layer,
      opacity: 0,
      scale: 0,
      age: 0,
      originalY: positionData.originalY
    }
    
    // Create sphere mesh
    const sphereMesh = this.createAnimatedSphereMesh(sphereData)
    sphereData.mesh = sphereMesh
    
    this.animatedSpheres.push(sphereData)
    this.scene.add(sphereMesh)
    
    console.log(`🌸 Spawned animated sphere at layer ${positionData.layer}`)
  }

  createAnimatedSphereMesh(sphereData) {
    // Create transparent blue sphere for animation
    const geometry = new THREE.SphereGeometry(this.config.sphereRadius, 16, 16)
    
    // Create main sphere with glowing material
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: sphereData.color,
      transparent: true,
      opacity: this.config.animation.sphereOpacity,
      emissive: sphereData.color,
      emissiveIntensity: 0.1,
      shininess: 100
    })
    const sphere = new THREE.Mesh(geometry, sphereMaterial)
    
    // Create glowing wireframe outline
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: sphereData.color,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    })
    const wireframeSphere = new THREE.Mesh(geometry, wireframeMaterial)
    
    // Group both
    const sphereGroup = new THREE.Group()
    sphereGroup.add(sphere)
    sphereGroup.add(wireframeSphere)
    
    sphereGroup.position.copy(sphereData.currentPosition)
    sphereGroup.scale.setScalar(0.1) // Start very small
    
    // Store references
    sphereGroup.userData = {
      sphereData,
      mainSphere: sphere,
      wireframeSphere: wireframeSphere
    }
    
    return sphereGroup
  }

  updateAnimatedSpheres(deltaTime) {
    // Clean, stable sphere animation - no complex timing calculations
    this.animatedSpheres.forEach((sphere, index) => {
      sphere.age += deltaTime
      
      // Smooth movement to target position
      const distance = sphere.currentPosition.distanceTo(sphere.targetPosition)
      if (distance > 0.01) {
        // Simple linear movement - stable and smooth
        const moveSpeed = 0.01 // Fixed movement speed per frame
        const direction = sphere.targetPosition.clone().sub(sphere.currentPosition).normalize()
        sphere.currentPosition.add(direction.multiplyScalar(moveSpeed))
        sphere.mesh.position.copy(sphere.currentPosition)
      } else {
        // Snap to target when close enough
        sphere.mesh.position.copy(sphere.targetPosition)
        sphere.currentPosition.copy(sphere.targetPosition)
      }
      
      // Smooth scale growth animation
      if (sphere.scale < 1.0) {
        sphere.scale = Math.min(1.0, sphere.scale + 0.02)
        sphere.mesh.scale.setScalar(sphere.scale)
      }
      
      // Smooth opacity fade-in animation
      if (sphere.opacity < 1.0) {
        sphere.opacity = Math.min(1.0, sphere.opacity + 0.015)
        if (sphere.mesh.userData && sphere.mesh.userData.mainSphere) {
          sphere.mesh.userData.mainSphere.material.opacity = sphere.opacity * this.config.animation.sphereOpacity
          sphere.mesh.userData.wireframeSphere.material.opacity = sphere.opacity * 0.8
        }
      }
    })
  }

  animateEntry() {
    console.log('🌸 Flower of Life GLB formation entry animation')
    this.isPaused = false
  }

  animateExit() {
    console.log('🌸 Flower of Life GLB formation exit animation')
    // Keep animation running
  }

  updateEvolution(progress) {
    // Adjust rotation speed based on scroll progress
    const speedMultiplier = 0.5 + progress * 1.5
    this.rotationSpeed = this.config.animation.rotationSpeed * speedMultiplier
  }

  update(deltaTime) {
    if (this.isPaused) return
    
    this.time += deltaTime
    
    // TEST: Disable breathing animation again
    if (this.flowerModel) {
      // Keep rotation only
      this.flowerModel.rotation.y += this.rotationSpeed
      
      // Disable breathing to test if this causes jitter
      // const breathingScale = 1 + Math.sin(this.time * this.config.animation.breathingSpeed) * this.config.animation.breathingAmplitude
      // this.flowerModel.scale.setScalar(0.8 * breathingScale)
      
      // Static scale
      this.flowerModel.scale.setScalar(0.8)
    }
    
    // Camera control disabled - let unified scene handle camera to prevent conflicts
    // The jitter was caused by both unified scene and flower scene trying to control camera
    
    // Spawn new animated spheres periodically
    if (this.time >= this.nextSphereTime && this.animatedSpheres.length < this.config.maxAnimatedSpheres) {
      this.spawnAnimatedSphere()
      this.nextSphereTime = this.time + this.sphereAppearanceRate
    }
    
    // Update all animated spheres
    this.updateAnimatedSpheres(deltaTime)
  }

  getCameraConfig() {
    return this.idealCameraConfig
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.6,
      directionalIntensity: 0.8,
      directionalPosition: [0, 50, 0]
    }
  }

  onEnter() {
    console.log('🌸 Entering Flower of Life GLB Formation')
    
    // Camera positioning disabled - unified scene handles all camera transitions
    // This prevents conflicts that were causing jittery movement
  }

  onExit() {
    console.log('🌸 Exiting Flower of Life GLB Formation')
  }

  updateScroll(progress, direction) {
    // Handle scroll-based effects
    this.updateEvolution(progress)
  }

  getDescription() {
    return 'Sacred Flower of Life 3D model with animated spheres emerging from the geometry'
  }

  getScene() {
    return this.scene
  }

  dispose() {
    // Clean up animated spheres
    this.animatedSpheres.forEach(sphere => {
      if (sphere.mesh) {
        sphere.mesh.traverse(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
        this.scene.remove(sphere.mesh)
      }
    })
    
    // Clean up model
    if (this.flowerModel) {
      this.flowerModel.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
      this.scene.remove(this.flowerModel)
    }
    
    this.animatedSpheres = []
    console.log('🌸 Flower of Life GLB formation disposed')
  }
}