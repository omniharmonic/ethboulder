import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OmniHarmonicHomePage } from './OmniHarmonicHomePage.js'
import { DebugControls } from '../utils/DebugControls.js'

export class EthBoulderScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    
    // Terrain scene
    this.terrainScene = null
    
    // Ethereum logo (in main scene)
    this.ethereumLogo = null
    this.objLoader = new OBJLoader()
    
    // Cinematic camera loop - disabled for debugging
    this.cameraTime = 0
    this.cameraSpeed = 0.0003 // Very subtle movement
    this.baseCameraPosition = new THREE.Vector3(-470, 250, 490) // Starting position for reference
    this.cameraTarget = new THREE.Vector3(0, 0, 0)
    this.movementRange = 20 // Very subtle movement range
    this.cinematicEnabled = false // Disable for manual positioning
    
    this.time = 0
    
    // Debug controls
    this.debugControls = null
    // Auto-rotation control
    this.autoRotateEnabled = true
    // Camera parallax movement
    this.baseCamera = { x: -470, y: 250, z: 490 }
    this.parallaxEnabled = true
  }

  async init() {
    console.log('🎬 Initializing ethBoulder Simplified Scene')
    
    try {
      // Initialize terrain scene
      await this.initializeTerrain()
      
      // Add proper lighting for OBJ visibility
      this.setupLighting()
      
      // Load Ethereum logo directly into main scene
      this.loadEthereumLogo()
      
      // Setup cinematic camera
      this.setupCinematicCamera()
      
      // Setup debug controls for positioning
      this.setupDebugControls()
      
      console.log('✅ ethBoulder scene initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize ethBoulder scene:', error)
      throw error
    }
  }

  async initializeTerrain() {
    console.log('🏔️ Loading terrain scene...')
    this.terrainScene = new OmniHarmonicHomePage(this.sceneManager)
    await this.terrainScene.init()
    
    // Add terrain to our main scene by copying all children
    const terrainSceneObject = this.terrainScene.getScene()
    console.log(`🏔️ Terrain scene has ${terrainSceneObject.children.length} children`)
    
    terrainSceneObject.children.forEach((child, index) => {
      const clonedChild = child.clone()
      this.scene.add(clonedChild)
      console.log(`🏔️ Added terrain child ${index}: ${child.type}`)
    })
    
    console.log(`✅ Terrain loaded with ${this.scene.children.length} total objects`)
  }


  loadEthereumLogo() {
    console.log('🔷 Loading Ethereum logo...')
    
    this.objLoader.load(
      '/models/Ethereum.obj',
      // Success callback
      (object) => {
        console.log('✅ OBJ file loaded successfully')
        
        // Create a group for the logo
        this.ethereumLogo = new THREE.Group()
        
        // Process the loaded object
        object.traverse((child) => {
          if (child.isMesh) {
            // Apply cyberpunk wireframe material to the logo
            child.material = new THREE.MeshBasicMaterial({
              color: 0x00FFFF, // Cyberpunk cyan
              wireframe: true,
              transparent: true,
              opacity: 0.9
            })
          }
        })
        
        // Scale the logo to debugged size
        object.scale.setScalar(0.176) // Updated scale: 0.12 * 1.464 ≈ 0.176
        this.ethereumLogo.add(object)
        
        // Position the logo at latest debugged location
        this.ethereumLogo.position.set(230, 610, 320)
        
        // Set rotation to latest debugged values
        this.ethereumLogo.rotation.set(-0.244, 387.184, -0.002)
        
        // Set high render order to ensure logo renders on top
        this.ethereumLogo.renderOrder = 1000
        this.ethereumLogo.frustumCulled = false // Prevent distance culling
        this.ethereumLogo.traverse((child) => {
          if (child.isMesh) {
            child.renderOrder = 1000
            child.material.depthTest = false
            child.frustumCulled = false // Prevent distance culling on mesh level
          }
        })
        
        // Add to main scene
        this.scene.add(this.ethereumLogo)
        console.log('✅ Ethereum logo added to main scene at position (0, 320, 0)')
      },
      // Progress callback
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = xhr.loaded / xhr.total * 100
          console.log(`🔷 Loading progress: ${Math.round(percentComplete)}%`)
        }
      },
      // Error callback
      (error) => {
        console.error('❌ Failed to load Ethereum OBJ:', error)
        this.createFallbackLogo()
      }
    )
  }

  setupLighting() {
    // Add cyberpunk ambient light
    const ambientLight = new THREE.AmbientLight(0x0A0A2A, 0.4)
    this.scene.add(ambientLight)
    
    // Add cyberpunk directional light from above
    const directionalLight = new THREE.DirectionalLight(0x00FFFF, 0.8)
    directionalLight.position.set(0, 100, 50)
    directionalLight.target.position.set(0, 0, 0)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)
    this.scene.add(directionalLight.target)
    
    // Add cyberpunk point light for the Ethereum logo
    const pointLight = new THREE.PointLight(0xFF00FF, 1.2, 200) // Magenta accent
    pointLight.position.set(-200, 150, 200)
    this.scene.add(pointLight)
    
    // Add secondary accent light
    const accentLight = new THREE.PointLight(0x00FFFF, 0.8, 150) // Cyan
    accentLight.position.set(-50, 50, 100)
    this.scene.add(accentLight)
    
    console.log('💡 Cyberpunk lighting setup complete')
  }

  createFallbackLogo() {
    console.log('🔷 Creating wireframe fallback logo...')
    const geometry = new THREE.OctahedronGeometry(0.3, 2) // Very small size for header
    const material = new THREE.MeshBasicMaterial({
      color: 0x00FFFF, // Cyberpunk cyan
      wireframe: true,
      transparent: true,
      opacity: 0.9
    })
    
    this.ethereumLogo = new THREE.Mesh(geometry, material)
    this.ethereumLogo.position.set(230, 610, 320) // Same latest debugged position as OBJ logo
    this.ethereumLogo.rotation.set(-0.244, 387.184, -0.002) // Same latest debugged rotation
    
    // Set high render order for fallback logo too
    this.ethereumLogo.renderOrder = 1000
    this.ethereumLogo.material.depthTest = false
    this.ethereumLogo.frustumCulled = false // Prevent distance culling
    
    this.scene.add(this.ethereumLogo)
    console.log('✅ Fallback logo added to main scene')
  }

  setupCinematicCamera() {
    if (!this.sceneManager.camera) return
    
    // Use the current proven working position from debug session
    const camera = this.sceneManager.camera
    camera.position.set(-470, 250, 490) // Proven working position
    camera.rotation.set(-0.258, -1.464, 0.000) // Proven rotation  
    camera.fov = 75
    camera.updateProjectionMatrix()
    
    console.log('📷 Camera set to proven working position: (-470, 250, 490)')
  }

  update(deltaTime) {
    this.time += deltaTime
    this.cameraTime += deltaTime
    
    // Update Ethereum logo rotation around Y axis (vertical spin) - only if auto-rotation enabled
    if (this.ethereumLogo && this.autoRotateEnabled) {
      this.ethereumLogo.rotation.y += 0.008
    }
    
    // Update subtle parallax camera movement (only when debug controls are not active)
    if (this.parallaxEnabled && this.sceneManager.camera && (!this.debugControls || !this.debugControls.isActive)) {
      this.updateParallaxCamera()
    }
    
    // Update cinematic camera loop (only if enabled)
    if (this.cinematicEnabled) {
      this.updateCinematicCamera()
    }
    
    // Update terrain scene if it has an update method
    if (this.terrainScene && this.terrainScene.update) {
      this.terrainScene.update(deltaTime)
    }
  }

  updateCinematicCamera() {
    if (!this.sceneManager.camera) return
    
    const camera = this.sceneManager.camera
    
    // Create very subtle movement around the base position
    const oscillation = Math.sin(this.cameraTime * this.cameraSpeed)
    
    // Apply subtle movement to the proven camera position
    const offsetX = oscillation * this.movementRange
    const offsetY = Math.sin(this.cameraTime * this.cameraSpeed * 0.7) * (this.movementRange * 0.3)
    const offsetZ = Math.cos(this.cameraTime * this.cameraSpeed * 1.3) * (this.movementRange * 0.5)
    
    camera.position.set(
      this.baseCameraPosition.x + offsetX,
      this.baseCameraPosition.y + offsetY,
      this.baseCameraPosition.z + offsetZ
    )
    
    // Keep the camera looking at the center with subtle adjustments
    camera.lookAt(this.cameraTarget)
  }

  updateScroll(progress, direction) {
    // Disable scroll updates - we're using cinematic camera loop instead
    return
  }

  setupDebugControls() {
    // Initialize debug controls for positioning
    this.debugControls = new DebugControls(this.sceneManager.camera, null, null)
    
    // Add keyboard shortcuts for debugging
    document.addEventListener('keydown', (event) => {
      if (event.key === 'p' || event.key === 'P') {
        // Print current camera position and rotation
        const camera = this.sceneManager.camera
        console.log('📷 Current camera position:', camera.position)
        console.log('📷 Current camera rotation:', camera.rotation)
        console.log('📷 Current camera fov:', camera.fov)
        
        // Copy to clipboard format for easy use
        const positionStr = `position: [${camera.position.x.toFixed(0)}, ${camera.position.y.toFixed(0)}, ${camera.position.z.toFixed(0)}]`
        const rotationStr = `rotation: [${camera.rotation.x.toFixed(3)}, ${camera.rotation.y.toFixed(3)}, ${camera.rotation.z.toFixed(3)}]`
        console.log('📋 Copy this:', `{ ${positionStr}, ${rotationStr}, fov: ${camera.fov} }`)
      }
      
      if (event.key === 'l' || event.key === 'L') {
        // Print current logo position, rotation, and scale
        if (this.ethereumLogo) {
          console.log('🔷 Current logo position:', this.ethereumLogo.position)
          console.log('🔷 Current logo rotation:', this.ethereumLogo.rotation)
          console.log('🔷 Current logo scale:', this.ethereumLogo.scale.x)
          const pos = this.ethereumLogo.position
          const rot = this.ethereumLogo.rotation
          const scale = this.ethereumLogo.scale.x
          console.log('📋 Logo coords:', `position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`)
          console.log('📋 Logo rotation:', `rotation: (${rot.x.toFixed(3)}, ${rot.y.toFixed(3)}, ${rot.z.toFixed(3)})`)
          console.log('📋 Logo scale:', `scale: ${scale.toFixed(3)}`)
        }
      }
      
      if (event.key === '`') {
        // Debug controls are toggled by backtick key in DebugControls class itself
        console.log('🎮 Use backtick (`) key to toggle camera debug controls')
      }
      
      if (event.key === 'c' || event.key === 'C') {
        // Toggle cinematic camera
        this.cinematicEnabled = !this.cinematicEnabled
        console.log('🎥 Cinematic camera:', this.cinematicEnabled ? 'ENABLED' : 'DISABLED')
      }
      
      // Camera controls remain with existing WASD + Arrow keys (when debug enabled)
      
      // Ethereum Logo Position Controls - IJKL keys (always available)
      if (this.ethereumLogo) {
        const moveStep = 10
        const rotStep = 0.1
        
        // Position controls with IJKL
        if (event.key === 'i' || event.key === 'I') {
          this.ethereumLogo.position.z -= moveStep
          console.log('🔷 LOGO: Moving Z backward to:', this.ethereumLogo.position.z.toFixed(1))
          event.preventDefault()
        }
        if (event.key === 'k' || event.key === 'K') {
          this.ethereumLogo.position.z += moveStep
          console.log('🔷 LOGO: Moving Z forward to:', this.ethereumLogo.position.z.toFixed(1))
          event.preventDefault()
        }
        if (event.key === 'j' || event.key === 'J') {
          this.ethereumLogo.position.x -= moveStep
          console.log('🔷 LOGO: Moving X left to:', this.ethereumLogo.position.x.toFixed(1))
          event.preventDefault()
        }
        if ((event.key === 'l' || event.key === 'L') && !event.ctrlKey && !event.metaKey) {
          this.ethereumLogo.position.x += moveStep
          console.log('🔷 LOGO: Moving X right to:', this.ethereumLogo.position.x.toFixed(1))
          event.preventDefault()
        }
        
        // Height controls with Shift+I/K
        if (event.shiftKey && (event.key === 'i' || event.key === 'I')) {
          this.ethereumLogo.position.y += moveStep
          console.log('🔷 LOGO: Y up to:', this.ethereumLogo.position.y.toFixed(1))
          event.preventDefault()
        }
        if (event.shiftKey && (event.key === 'k' || event.key === 'K')) {
          this.ethereumLogo.position.y -= moveStep
          console.log('🔷 LOGO: Y down to:', this.ethereumLogo.position.y.toFixed(1))
          event.preventDefault()
        }
        
        // Y-axis rotation (left/right) with UO keys
        if (event.key === 'u' || event.key === 'U') {
          this.autoRotateEnabled = false // Disable auto-rotation when manually controlling
          this.ethereumLogo.rotation.y -= rotStep
          console.log('🔷 LOGO: Y-rotation (left/right):', this.ethereumLogo.rotation.y.toFixed(3))
          console.log('🔄 Auto-rotation disabled')
          event.preventDefault()
        }
        if (event.key === 'o' || event.key === 'O') {
          this.autoRotateEnabled = false // Disable auto-rotation when manually controlling
          this.ethereumLogo.rotation.y += rotStep
          console.log('🔷 LOGO: Y-rotation (left/right):', this.ethereumLogo.rotation.y.toFixed(3))
          console.log('🔄 Auto-rotation disabled')
          event.preventDefault()
        }
        
        // X-axis rotation (tilt up/down) with 7/8 keys
        if (event.key === '7') {
          this.autoRotateEnabled = false
          this.ethereumLogo.rotation.x -= rotStep
          console.log('🔷 LOGO: X-rotation (tilt up/down):', this.ethereumLogo.rotation.x.toFixed(3))
          console.log('🔄 Auto-rotation disabled')
          event.preventDefault()
        }
        if (event.key === '8') {
          this.autoRotateEnabled = false
          this.ethereumLogo.rotation.x += rotStep
          console.log('🔷 LOGO: X-rotation (tilt up/down):', this.ethereumLogo.rotation.x.toFixed(3))
          console.log('🔄 Auto-rotation disabled')
          event.preventDefault()
        }
        
        // Z-axis rotation (roll) with 9/0 keys
        if (event.key === '9') {
          this.autoRotateEnabled = false
          this.ethereumLogo.rotation.z -= rotStep
          console.log('🔷 LOGO: Z-rotation (roll):', this.ethereumLogo.rotation.z.toFixed(3))
          console.log('🔄 Auto-rotation disabled')
          event.preventDefault()
        }
        if (event.key === '0') {
          this.autoRotateEnabled = false
          this.ethereumLogo.rotation.z += rotStep
          console.log('🔷 LOGO: Z-rotation (roll):', this.ethereumLogo.rotation.z.toFixed(3))
          console.log('🔄 Auto-rotation disabled')
          event.preventDefault()
        }
        
        // Scale controls with +/- keys
        if (event.key === '=' || event.key === '+') {
          const currentScale = this.ethereumLogo.scale.x
          const newScale = currentScale * 1.1 // 10% increase
          this.ethereumLogo.scale.setScalar(newScale)
          console.log('🔷 LOGO: Scale increased to:', newScale.toFixed(3))
          event.preventDefault()
        }
        if (event.key === '-' || event.key === '_') {
          const currentScale = this.ethereumLogo.scale.x
          const newScale = currentScale * 0.9 // 10% decrease
          this.ethereumLogo.scale.setScalar(newScale)
          console.log('🔷 LOGO: Scale decreased to:', newScale.toFixed(3))
          event.preventDefault()
        }
        
        // Reset auto-rotation with R key
        if (event.key === 'r' || event.key === 'R') {
          this.autoRotateEnabled = !this.autoRotateEnabled
          console.log('🔄 Auto-rotation:', this.autoRotateEnabled ? 'ENABLED' : 'DISABLED')
          event.preventDefault()
        }
      }
      
      // Camera parallax toggle (outside logo check so it always works)
      if (event.key === 'v' || event.key === 'V') {
        this.parallaxEnabled = !this.parallaxEnabled
        console.log('📹 Camera parallax:', this.parallaxEnabled ? 'ENABLED' : 'DISABLED')
        if (!this.parallaxEnabled) {
          // Reset to base position when disabled
          const camera = this.sceneManager.camera
          camera.position.set(this.baseCamera.x, this.baseCamera.y, this.baseCamera.z)
          camera.rotation.set(-0.258, -1.464, 0)
        }
        event.preventDefault()
      }
    })
    
    console.log('🎮 Debug controls initialized:')
    console.log('   ` (backtick) = Toggle camera debug controls')
    console.log('   P = Print camera position') 
    console.log('   Ctrl/Cmd+L = Print logo position & rotation')
    console.log('   C = Toggle cinematic camera')
    console.log('')
    console.log('   📷 CAMERA CONTROLS (when debug enabled with `):')
    console.log('   Arrow Keys = Rotate camera look direction')
    console.log('   WASD = Move camera position')
    console.log('   QE = Move camera up/down')
    console.log('')
    console.log('   🔷 LOGO CONTROLS (always available):')
    console.log('   IJKL = Move logo X/Z position')
    console.log('   Shift+I/K = Move logo Y (height)')
    console.log('   UO = Y-axis rotation (turn left/right)')
    console.log('   78 = X-axis rotation (tilt up/down)')
    console.log('   90 = Z-axis rotation (roll)')
    console.log('   +/- = Increase/decrease logo scale')
    console.log('   R = Toggle auto-rotation on/off')
    console.log('')
    console.log('   📹 CAMERA CONTROLS:')
    console.log('   V = Toggle subtle parallax movement')
    console.log('')
    console.log('   🏔️ TERRAIN CONTROLS (when debug enabled):')
    console.log('   TFGH = Rotate terrain (fine control)')
    console.log('')
    console.log('   Cinematic camera is currently DISABLED for manual positioning')
  }

  updateParallaxCamera() {
    // Slow push toward logo/terrain center - 30 seconds in each direction
    const camera = this.sceneManager.camera
    const t = this.time * 0.0005 // Even slower - 120 second full cycle (60s forward, 60s back)
    
    // Calculate direction vector from camera to logo/terrain center
    const logoPosition = { x: 230, y: 610, z: 320 } // Latest debugged logo position
    const cameraBase = this.baseCamera
    
    // Direction vector from camera to logo (normalized)
    const dx = logoPosition.x - cameraBase.x  // 230 - (-470) = 700
    const dy = logoPosition.y - cameraBase.y  // 610 - 250 = 360  
    const dz = logoPosition.z - cameraBase.z  // 320 - 490 = -170
    
    // Normalize the direction vector
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
    const dirX = dx / distance
    const dirY = dy / distance
    const dirZ = dz / distance
    
    // Pulse movement toward the logo/terrain
    const pulseIntensity = Math.sin(t) * 25 // Push toward logo over 30s cycles
    
    // Apply movement in direction of logo
    camera.position.x = cameraBase.x + (dirX * pulseIntensity)
    camera.position.y = cameraBase.y + (dirY * pulseIntensity)
    camera.position.z = cameraBase.z + (dirZ * pulseIntensity)
    
    // Keep rotation completely static
    camera.rotation.x = -0.258
    camera.rotation.y = -1.464 
    camera.rotation.z = 0
  }

  onEnter() {
    console.log('🎬 Entering ethBoulder scene')
    this.setupCinematicCamera()
  }

  onExit() {
    console.log('🎬 Exiting ethBoulder scene')
  }

  getScene() {
    return this.scene
  }

  getDescription() {
    return 'ethBoulder - Ethereum conference with cinematic terrain view'
  }

  dispose() {
    // Clean up resources
    if (this.ethereumLogo) {
      this.ethereumLogo.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
      this.scene.remove(this.ethereumLogo)
    }
    
    if (this.terrainScene && this.terrainScene.dispose) {
      this.terrainScene.dispose()
    }
    
    console.log('🎬 ethBoulder scene disposed')
  }
}