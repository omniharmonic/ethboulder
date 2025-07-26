import * as THREE from 'three'

export class SigilSphere3D {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.sphereGroup = null
    this.sphereRadius = 3
    this.autoRotate = false
    this.currentRotationX = 0
    this.currentRotationY = 0
    this.targetRotationX = 0
    this.targetRotationY = 0
  }

  init() {
    this.sphereGroup = new THREE.Group()
    this.createExactSigil()
    console.log('🔮 3D Sigil Sphere created')
    return this.sphereGroup
  }

  createExactSigil() {
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    })

    // Helper function to project 2D point to sphere surface
    const pointOnSphere = (x, y, radius = this.sphereRadius) => {
      const r2d = Math.sqrt(x*x + y*y)
      if (r2d > radius) {
        x = x * radius / r2d
        y = y * radius / r2d
      }
      const z = Math.sqrt(Math.max(0, radius*radius - x*x - y*y))
      return new THREE.Vector3(x, y, z)
    }

    // 1. OUTER CIRCLE - exact boundary
    const outerRadius = this.sphereRadius * 0.95
    const outerCirclePoints = []
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      const x = Math.cos(angle) * outerRadius
      const y = Math.sin(angle) * outerRadius
      outerCirclePoints.push(pointOnSphere(x, y))
    }
    const outerCircleGeometry = new THREE.BufferGeometry().setFromPoints(outerCirclePoints)
    const outerCircle = new THREE.Line(outerCircleGeometry, lineMaterial)
    this.sphereGroup.add(outerCircle)

    // Helper function to create oval shapes
    const createOval = (centerX, centerY, width, height, rotation = 0) => {
      const points = []
      const segments = 64
      
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2
        
        // Create ellipse
        let x = Math.cos(t) * width * 0.5
        let y = Math.sin(t) * height * 0.5
        
        // Apply rotation
        if (rotation !== 0) {
          const cos = Math.cos(rotation)
          const sin = Math.sin(rotation)
          const newX = x * cos - y * sin
          const newY = x * sin + y * cos
          x = newX
          y = newY
        }
        
        // Translate to center
        x += centerX
        y += centerY
        
        points.push(pointOnSphere(x, y))
      }
      
      return points
    }

    // 2. VERTICAL OVAL - elongated vertically, centered
    const ovalWidth = 1.2
    const ovalHeight = 4.8 // Extends close to outer circle
    
    const verticalOvalPoints = createOval(0, 0, ovalWidth, ovalHeight, 0)
    const verticalOvalGeometry = new THREE.BufferGeometry().setFromPoints(verticalOvalPoints)
    const verticalOval = new THREE.Line(verticalOvalGeometry, lineMaterial)
    this.sphereGroup.add(verticalOval)

    // 3. HORIZONTAL OVAL - elongated horizontally, centered
    const horizontalOvalPoints = createOval(0, 0, ovalHeight, ovalWidth, 0) // Swapped width/height
    const horizontalOvalGeometry = new THREE.BufferGeometry().setFromPoints(horizontalOvalPoints)
    const horizontalOval = new THREE.Line(horizontalOvalGeometry, lineMaterial)
    this.sphereGroup.add(horizontalOval)

    // 4. VERTICAL LINE - top to bottom through center
    const verticalLinePoints = []
    for (let i = 0; i <= 32; i++) {
      const t = i / 32
      const y = (t - 0.5) * 2 * outerRadius
      verticalLinePoints.push(pointOnSphere(0, y))
    }
    const verticalLineGeometry = new THREE.BufferGeometry().setFromPoints(verticalLinePoints)
    const verticalLine = new THREE.Line(verticalLineGeometry, lineMaterial)
    this.sphereGroup.add(verticalLine)

    // 5. HORIZONTAL LINE - left to right through center
    const horizontalLinePoints = []
    for (let i = 0; i <= 32; i++) {
      const t = i / 32
      const x = (t - 0.5) * 2 * outerRadius
      horizontalLinePoints.push(pointOnSphere(x, 0))
    }
    const horizontalLineGeometry = new THREE.BufferGeometry().setFromPoints(horizontalLinePoints)
    const horizontalLine = new THREE.Line(horizontalLineGeometry, lineMaterial)
    this.sphereGroup.add(horizontalLine)

    // Add subtle sphere wireframe for context during rotation
    const sphereWireframe = new THREE.SphereGeometry(this.sphereRadius, 16, 12)
    const sphereWireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.05 
    })
    const wireframe = new THREE.Mesh(sphereWireframe, sphereWireframeMaterial)
    this.sphereGroup.add(wireframe)
  }

  enableAutoRotate() {
    this.autoRotate = true
  }

  disableAutoRotate() {
    this.autoRotate = false
  }

  setRotation(x, y) {
    this.targetRotationX = x
    this.targetRotationY = y
  }

  revealSphere() {
    // Animate to a revealing position
    this.targetRotationX = Math.PI / 4
    this.targetRotationY = Math.PI / 3
    this.autoRotate = false
    
    // Enable auto-rotate after reveal animation
    setTimeout(() => {
      this.autoRotate = true
    }, 3000)
  }

  resetView() {
    this.autoRotate = false
    this.targetRotationX = 0
    this.targetRotationY = 0
    this.currentRotationX = 0
    this.currentRotationY = 0
  }

  update(deltaTime) {
    if (!this.sphereGroup) return

    // Smooth rotation interpolation
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.1
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1
    
    // Auto-rotate when enabled
    if (this.autoRotate) {
      this.targetRotationY += 0.005
      this.targetRotationX = Math.sin(Date.now() * 0.001) * 0.2
    }
    
    // Apply rotations
    this.sphereGroup.rotation.x = this.currentRotationX
    this.sphereGroup.rotation.y = this.currentRotationY
  }

  // Method to get the group for adding to scene
  getGroup() {
    return this.sphereGroup
  }

  // Method to position the logo
  setPosition(x, y, z) {
    if (this.sphereGroup) {
      this.sphereGroup.position.set(x, y, z)
    }
  }

  // Method to scale the logo
  setScale(scale) {
    if (this.sphereGroup) {
      this.sphereGroup.scale.setScalar(scale)
    }
  }

  // Method to set material properties
  updateMaterial(color, opacity) {
    if (!this.sphereGroup) return
    
    this.sphereGroup.traverse((child) => {
      if (child.material) {
        child.material.color.setHex(color)
        child.material.opacity = opacity
      }
    })
  }

  dispose() {
    if (this.sphereGroup) {
      this.sphereGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    }
    console.log('🔮 3D Sigil Sphere disposed')
  }
}