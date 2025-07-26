import * as THREE from 'three'

export class DebugControls {
  constructor(camera, terrain, wireframe) {
    this.camera = camera
    this.terrain = terrain
    this.wireframe = wireframe
    this.isActive = false
    
    // Movement speeds
    this.cameraSpeed = 5
    this.rotationSpeed = 0.05
    this.terrainRotationSpeed = 0.01 // Finer terrain control
    
    // Key states
    this.keys = {}
    
    // Mouse drag controls
    this.mouse = {
      isDown: false,
      lastX: 0,
      lastY: 0,
      sensitivity: 0.003 // Mouse sensitivity for rotation
    }
    
    this.setupEventListeners()
    console.log('🎮 Debug Controls initialized')
    console.log('  - Press ` (backtick) to toggle debug controls')
    console.log('  - WASD: Move camera')
    console.log('  - QE: Move camera up/down')
    console.log('  - Arrow keys: Rotate camera look direction')
    console.log('  - Mouse drag: Rotate camera (when debug active)')
    console.log('  - IJKL: Rotate terrain (fine control)')
    console.log('  - P: Print current positions')
    console.log('  - Mountain repositioning: Use IJKL for precise terrain rotation')
  }
  
  setupEventListeners() {
    document.addEventListener('keydown', (event) => {
      this.keys[event.code] = true
      
      // Toggle debug mode with backtick
      if (event.code === 'Backquote') {
        this.isActive = !this.isActive
        console.log(`🎮 Debug controls ${this.isActive ? 'ENABLED' : 'DISABLED'}`)
        if (this.isActive) {
          this.printCurrentPositions()
          this.addDebugIndicator()
        } else {
          this.removeDebugIndicator()
        }
        event.preventDefault()
      }
      
      // Print positions with P
      if (event.code === 'KeyP' && this.isActive) {
        this.printCurrentPositions()
        event.preventDefault()
      }
    })
    
    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false
    })
    
    // Mouse controls for camera rotation
    document.addEventListener('mousedown', (event) => {
      if (this.isActive && event.button === 0) { // Left mouse button
        this.mouse.isDown = true
        this.mouse.lastX = event.clientX
        this.mouse.lastY = event.clientY
        event.preventDefault()
      }
    })
    
    document.addEventListener('mouseup', (event) => {
      if (event.button === 0) { // Left mouse button
        this.mouse.isDown = false
      }
    })
    
    document.addEventListener('mousemove', (event) => {
      if (this.isActive && this.mouse.isDown) {
        const deltaX = event.clientX - this.mouse.lastX
        const deltaY = event.clientY - this.mouse.lastY
        
        // Apply rotation to camera
        this.camera.rotation.y -= deltaX * this.mouse.sensitivity
        this.camera.rotation.x -= deltaY * this.mouse.sensitivity
        
        // Clamp X rotation to prevent camera flipping
        this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x))
        
        this.mouse.lastX = event.clientX
        this.mouse.lastY = event.clientY
        
        event.preventDefault()
      }
    })
    
    // Prevent context menu when right clicking during debug
    document.addEventListener('contextmenu', (event) => {
      if (this.isActive) {
        event.preventDefault()
      }
    })
  }
  
  update() {
    if (!this.isActive) return
    
    const moveSpeed = this.cameraSpeed
    const rotSpeed = this.rotationSpeed
    const terrainRotSpeed = this.terrainRotationSpeed
    
    // Camera movement (WASD + QE)
    if (this.keys['KeyW']) this.camera.position.z -= moveSpeed
    if (this.keys['KeyS']) this.camera.position.z += moveSpeed
    if (this.keys['KeyA']) this.camera.position.x -= moveSpeed
    if (this.keys['KeyD']) this.camera.position.x += moveSpeed
    if (this.keys['KeyQ']) this.camera.position.y += moveSpeed
    if (this.keys['KeyE']) this.camera.position.y -= moveSpeed
    
    // Camera rotation (Arrow keys)
    if (this.keys['ArrowUp']) {
      this.camera.rotation.x += rotSpeed
    }
    if (this.keys['ArrowDown']) {
      this.camera.rotation.x -= rotSpeed
    }
    if (this.keys['ArrowLeft']) {
      this.camera.rotation.y += rotSpeed
    }
    if (this.keys['ArrowRight']) {
      this.camera.rotation.y -= rotSpeed
    }
    
    // Terrain rotation (IJKL)
    if (this.terrain) {
      if (this.keys['KeyI']) {
        this.terrain.rotation.x += terrainRotSpeed
        if (this.wireframe) this.wireframe.rotation.x += terrainRotSpeed
      }
      if (this.keys['KeyK']) {
        this.terrain.rotation.x -= terrainRotSpeed
        if (this.wireframe) this.wireframe.rotation.x -= terrainRotSpeed
      }
      if (this.keys['KeyJ']) {
        this.terrain.rotation.y += terrainRotSpeed
        if (this.wireframe) this.wireframe.rotation.y += terrainRotSpeed
      }
      if (this.keys['KeyL']) {
        this.terrain.rotation.y -= terrainRotSpeed
        if (this.wireframe) this.wireframe.rotation.y -= terrainRotSpeed
      }
    }
  }
  
  printCurrentPositions() {
    console.log('📍 CURRENT POSITIONS:')
    console.log('Camera position:', {
      x: this.camera.position.x.toFixed(2),
      y: this.camera.position.y.toFixed(2),
      z: this.camera.position.z.toFixed(2)
    })
    console.log('Camera rotation:', {
      x: this.camera.rotation.x.toFixed(3),
      y: this.camera.rotation.y.toFixed(3),
      z: this.camera.rotation.z.toFixed(3)
    })
    if (this.terrain) {
      console.log('Terrain rotation:', {
        x: this.terrain.rotation.x.toFixed(3),
        y: this.terrain.rotation.y.toFixed(3),
        z: this.terrain.rotation.z.toFixed(3)
      })
    }
    console.log('📋 Copy these values for permanent positioning')
  }
  
  addDebugIndicator() {
    // Add visual indicator that debug controls are active
    if (!this.debugIndicator) {
      this.debugIndicator = document.createElement('div')
      this.debugIndicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        pointer-events: none;
      `
      this.debugIndicator.textContent = '🎮 DEBUG ACTIVE - Mouse Drag to Rotate'
      document.body.appendChild(this.debugIndicator)
    }
  }
  
  removeDebugIndicator() {
    if (this.debugIndicator) {
      document.body.removeChild(this.debugIndicator)
      this.debugIndicator = null
    }
  }
  
  dispose() {
    // Clean up event listeners and indicator
    this.removeDebugIndicator()
    console.log('🎮 Debug controls disposed')
  }
}