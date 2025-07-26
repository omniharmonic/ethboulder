import * as THREE from 'three'

export class IndrasNetScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    
    // Particle system following Three.js example structure
    this.particlesData = []
    this.positions = null
    this.colors = null
    this.particles = null
    this.pointCloud = null
    this.particlePositions = null
    this.linesMesh = null
    
    // Configuration matching the reference values
    this.maxParticleCount = 1000
    this.particleCount = 150 // Reference value
    this.r = 800
    this.rHalf = this.r / 2
    
    this.effectController = {
      showDots: true,
      showLines: true,
      minDistance: 150, // Reference value
      limitConnections: true,
      maxConnections: 20, // Reference value
      particleCount: 150 // Reference value
    }
    
    // Visual properties
    this.time = 0
    this.group = null
    
    // Time-based animation system independent of scroll
    this.animationClock = {
      startTime: null,
      smoothTransitions: true
    }
  }

  async init() {
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    this.adjustForPerformance()
    
    this.group = new THREE.Group()
    this.scene.add(this.group)
    
    // Create the particle system like the Three.js example
    this.initParticleSystem()
    this.createPointCloud()
    this.createLineSystem()
    
    console.log('🕸️ Indra\'s Net initialized with', this.particleCount, 'particles')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.particleCount = 100
        this.effectController.maxConnections = 15
        break
      case 'medium':
        this.particleCount = 125
        this.effectController.maxConnections = 18
        break
      case 'high':
        this.particleCount = 150
        this.effectController.maxConnections = 20
        break
    }
    this.effectController.particleCount = this.particleCount
  }

  initParticleSystem() {
    const segments = this.maxParticleCount * this.maxParticleCount
    
    this.positions = new Float32Array(segments * 3)
    this.colors = new Float32Array(segments * 3)
    
    this.particles = new THREE.BufferGeometry()
    this.particlePositions = new Float32Array(this.maxParticleCount * 3)
    
    for (let i = 0; i < this.maxParticleCount; i++) {
      const x = Math.random() * this.r - this.r / 2
      const y = Math.random() * this.r - this.r / 2
      const z = Math.random() * this.r - this.r / 2
      
      this.particlePositions[i * 3] = x
      this.particlePositions[i * 3 + 1] = y
      this.particlePositions[i * 3 + 2] = z
      
      // Add particle data for movement
      this.particlesData.push({
        velocity: new THREE.Vector3(
          -1 + Math.random() * 2,
          -1 + Math.random() * 2,
          -1 + Math.random() * 2
        ),
        numConnections: 0
      })
    }
    
    this.particles.setDrawRange(0, this.particleCount)
    this.particles.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3).setUsage(THREE.DynamicDrawUsage))
  }

  createPointCloud() {
    const pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false
    })
    
    this.pointCloud = new THREE.Points(this.particles, pMaterial)
    this.group.add(this.pointCloud)
  }

  createLineSystem() {
    const geometry = new THREE.BufferGeometry()
    
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage))
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3).setUsage(THREE.DynamicDrawUsage))
    
    geometry.computeBoundingSphere()
    geometry.setDrawRange(0, 0)
    
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    })
    
    this.linesMesh = new THREE.LineSegments(geometry, material)
    this.group.add(this.linesMesh)
  }

  update(deltaTime) {
    // Use consistent time-based animation independent of scroll
    if (!this.animationClock.startTime) {
      this.animationClock.startTime = performance.now()
    }
    
    this.time = (performance.now() - this.animationClock.startTime) * 0.001
    
    let vertexpos = 0
    let colorpos = 0  
    let numConnected = 0
    
    // Reset connection counts
    for (let i = 0; i < this.particleCount; i++) {
      this.particlesData[i].numConnections = 0
    }
    
    // Move particles and calculate connections
    for (let i = 0; i < this.particleCount; i++) {
      const particleData = this.particlesData[i]
      
      // Move particles
      this.particlePositions[i * 3] += particleData.velocity.x
      this.particlePositions[i * 3 + 1] += particleData.velocity.y
      this.particlePositions[i * 3 + 2] += particleData.velocity.z
      
      // Bounce off boundaries
      if (this.particlePositions[i * 3 + 1] < -this.rHalf || this.particlePositions[i * 3 + 1] > this.rHalf)
        particleData.velocity.y = -particleData.velocity.y
        
      if (this.particlePositions[i * 3] < -this.rHalf || this.particlePositions[i * 3] > this.rHalf)
        particleData.velocity.x = -particleData.velocity.x
        
      if (this.particlePositions[i * 3 + 2] < -this.rHalf || this.particlePositions[i * 3 + 2] > this.rHalf)
        particleData.velocity.z = -particleData.velocity.z
        
      if (this.effectController.limitConnections && particleData.numConnections >= this.effectController.maxConnections)
        continue
        
      // Check connections with other particles
      for (let j = i + 1; j < this.particleCount; j++) {
        const particleDataB = this.particlesData[j]
        if (this.effectController.limitConnections && particleDataB.numConnections >= this.effectController.maxConnections)
          continue
          
        const dx = this.particlePositions[i * 3] - this.particlePositions[j * 3]
        const dy = this.particlePositions[i * 3 + 1] - this.particlePositions[j * 3 + 1]
        const dz = this.particlePositions[i * 3 + 2] - this.particlePositions[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (dist < this.effectController.minDistance) {
          particleData.numConnections++
          particleDataB.numConnections++
          
          const alpha = 1.0 - dist / this.effectController.minDistance
          
          // Set line positions
          this.positions[vertexpos++] = this.particlePositions[i * 3]
          this.positions[vertexpos++] = this.particlePositions[i * 3 + 1]
          this.positions[vertexpos++] = this.particlePositions[i * 3 + 2]
          
          this.positions[vertexpos++] = this.particlePositions[j * 3]
          this.positions[vertexpos++] = this.particlePositions[j * 3 + 1] 
          this.positions[vertexpos++] = this.particlePositions[j * 3 + 2]
          
          // Set line colors
          this.colors[colorpos++] = alpha
          this.colors[colorpos++] = alpha
          this.colors[colorpos++] = alpha
          
          this.colors[colorpos++] = alpha
          this.colors[colorpos++] = alpha
          this.colors[colorpos++] = alpha
          
          numConnected++
        }
      }
    }
    
    // Update geometries
    this.linesMesh.geometry.setDrawRange(0, numConnected * 2)
    this.linesMesh.geometry.attributes.position.needsUpdate = true
    this.linesMesh.geometry.attributes.color.needsUpdate = true
    
    this.pointCloud.geometry.attributes.position.needsUpdate = true
    
    // Smooth rotation independent of scroll events
    if (this.group && this.animationClock.smoothTransitions) {
      this.group.rotation.y = this.time * 0.05 // Slower, smoother rotation
    }
  }

  onEnter() {
    console.log('🕸️ Entering Indra\'s Net')
  }

  onExit() {
    console.log('🕸️ Exiting Indra\'s Net')
  }

  updateScroll(progress, direction) {
    // Handle scroll-based updates if needed
  }

  getScene() {
    return this.scene
  }

  getDescription() {
    return 'Interactive particle network with dynamic connections'
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.3,
      directionalIntensity: 0.7,
      directionalPosition: [10, 10, 10]
    }
  }

  getCameraConfig() {
    // Start from terrain's final camera position for seamless transition
    return {
      position: [70, 190, -40], // Terrain end position
      target: [0, 0, 0],
      fov: 75
    }
  }

  dispose() {
    if (this.particles) {
      this.particles.dispose()
    }
    if (this.linesMesh && this.linesMesh.geometry) {
      this.linesMesh.geometry.dispose()
      this.linesMesh.material.dispose()
    }
    if (this.pointCloud && this.pointCloud.geometry) {
      this.pointCloud.geometry.dispose()
      this.pointCloud.material.dispose()
    }
    console.log('🕸️ Indra\'s Net scene disposed')
  }

  onMouseMove(event) {
    // Handle mouse movement for Indra's Net scene
    // This can be extended later for interactive effects
  }

  onMouseClick(event) {
    // Handle mouse clicks for Indra's Net scene
    // This can be extended later for interactive effects
  }
}