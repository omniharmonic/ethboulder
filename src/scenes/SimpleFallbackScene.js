import * as THREE from 'three'

export class SimpleFallbackScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    this.testCube = null
    this.time = 0
  }

  async init() {
    console.log('🎯 Initializing Simple Fallback Scene')
    
    try {
      // Create a simple test cube to verify Three.js is working
      const geometry = new THREE.BoxGeometry(4, 4, 4)
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x0D4F5C,
        wireframe: true
      })
      
      this.testCube = new THREE.Mesh(geometry, material)
      this.testCube.position.set(0, 0, 0) // Ensure it's at origin
      this.scene.add(this.testCube)
      
      // Add a second cube for reference
      const geometry2 = new THREE.BoxGeometry(2, 2, 2)
      const material2 = new THREE.MeshBasicMaterial({ 
        color: 0x1B4F72,
        wireframe: false,
        transparent: true,
        opacity: 0.5
      })
      
      this.testCube2 = new THREE.Mesh(geometry2, material2)
      this.testCube2.position.set(6, 0, 0)
      this.scene.add(this.testCube2)
      
      // Add some basic lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      this.scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(1, 1, 1)
      this.scene.add(directionalLight)
      
      console.log('🎯 Test cubes created and positioned')
      
      console.log('✅ Simple Fallback Scene initialized successfully')
      
    } catch (error) {
      console.error('❌ Error initializing Simple Fallback Scene:', error)
      throw error
    }
  }

  update(deltaTime) {
    this.time += deltaTime
    
    if (this.testCube) {
      this.testCube.rotation.x += 0.01
      this.testCube.rotation.y += 0.01
    }
    
    if (this.testCube2) {
      this.testCube2.rotation.x -= 0.005
      this.testCube2.rotation.z += 0.008
    }
  }

  updateScroll(progress, direction) {
    // Simple response to scroll
    if (this.testCube) {
      this.testCube.scale.setScalar(1 + progress * 0.5)
    }
  }

  onEnter() {
    console.log('🎯 Entering Simple Fallback Scene')
  }

  onExit() {
    console.log('🎯 Exiting Simple Fallback Scene')
  }

  getDescription() {
    return 'Simple fallback scene with animated cube'
  }

  getScene() {
    return this.scene
  }

  dispose() {
    if (this.testCube) {
      this.testCube.geometry.dispose()
      this.testCube.material.dispose()
    }
    console.log('🎯 Simple Fallback Scene disposed')
  }
}