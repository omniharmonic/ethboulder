import * as THREE from 'three'
import { EthBoulderScene } from './EthBoulderScene.js'
import { SimpleFallbackScene } from './SimpleFallbackScene.js'

export class SceneManager {
  constructor(performanceMonitor) {
    this.performanceMonitor = performanceMonitor
    this.renderer = null
    this.camera = null
    this.currentScene = null
    this.scenes = new Map()
    this.isInitialized = false
    
    // Scene transition properties
    this.isTransitioning = false
    this.transitionDuration = 1000
    
    // Lighting
    this.ambientLight = null
    this.directionalLight = null
  }

  async init() {
    try {
      this.setupRenderer()
      this.setupCamera()
      this.setupLighting()
      await this.createScenes()
      this.setupEventListeners()
      
      // Start with unified scene
      await this.transitionTo('unified')
      
      this.isInitialized = true
      console.log('🎬 Scene manager initialized')
      
    } catch (error) {
      console.error('Failed to initialize SceneManager:', error)
      throw error
    }
  }

  setupRenderer() {
    const qualitySettings = this.performanceMonitor.getQualitySettings()
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: qualitySettings.antialias,
      alpha: false, // Changed to false to show background color
      powerPreference: 'high-performance'
    })
    
    // Set background color
    this.renderer.setClearColor(0x0B1426, 1.0) // Deep ocean color
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(qualitySettings.pixelRatio)
    
    // Enable shadows based on performance level
    if (qualitySettings.shadowMapSize > 0) {
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // Note: shadowMap size is set on individual lights, not the renderer
    }
    
    // Set color space and tone mapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    
    // Append to canvas container
    console.log('🎨 Looking for canvas-container...')
    const canvasContainer = document.getElementById('canvas-container')
    if (canvasContainer) {
      console.log('✅ Found canvas-container, appending canvas')
      canvasContainer.appendChild(this.renderer.domElement)
      console.log('✅ Canvas attached to canvas-container')
      console.log('Canvas dimensions:', this.renderer.domElement.width, 'x', this.renderer.domElement.height)
    } else {
      console.warn('⚠️ canvas-container not found, appending to body')
      document.body.appendChild(this.renderer.domElement)
    }
    
    console.log('🎨 Renderer setup complete:', this.renderer.domElement.width + 'x' + this.renderer.domElement.height)
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near
      10000 // Far - increased for large scene visibility
    )
    
    // Default camera position - closer to see the cubes better
    this.camera.position.set(0, 0, 10)
    this.camera.lookAt(0, 0, 0)
    console.log('📷 Camera positioned at:', this.camera.position)
  }

  setupLighting() {
    // Ambient light for overall illumination
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    
    // Directional light for shadows and form
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.directionalLight.position.set(50, 50, 50)
    this.directionalLight.castShadow = true
    
    // Configure shadow properties
    if (this.renderer.shadowMap.enabled) {
      const mapSize = this.performanceMonitor.getQualitySettings().shadowMapSize
      this.directionalLight.shadow.mapSize.width = mapSize
      this.directionalLight.shadow.mapSize.height = mapSize
      this.directionalLight.shadow.camera.near = 0.5
      this.directionalLight.shadow.camera.far = 200
      this.directionalLight.shadow.camera.left = -50
      this.directionalLight.shadow.camera.right = 50
      this.directionalLight.shadow.camera.top = 50
      this.directionalLight.shadow.camera.bottom = -50
    }
  }

  async createScenes() {
    try {
      // Add a static test cube first to verify basic rendering
      console.log('🧪 Adding static test cube to verify renderer...')
      const testScene = new THREE.Scene()
      const testGeometry = new THREE.BoxGeometry(2, 2, 2)
      const testMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        wireframe: true
      })
      const testCube = new THREE.Mesh(testGeometry, testMaterial)
      testCube.position.set(0, 0, 0)
      testScene.add(testCube)
      
      // Create a minimal scene wrapper for the test cube
      const testSceneWrapper = {
        getScene: () => testScene,
        update: () => {
          testCube.rotation.x += 0.01
          testCube.rotation.y += 0.01
        }
      }
      
      // Try to create the full OmniHarmonic unified scene
      console.log('🌊 Creating OmniHarmonic Unified Scene...')
      
      try {
        const ethBoulderScene = new EthBoulderScene(this)
        await ethBoulderScene.init()
        this.scenes.set('unified', ethBoulderScene)
        console.log('✅ ethBoulder Scene created successfully')
        
      } catch (fullSceneError) {
        console.warn('⚠️ OmniHarmonic scene failed, falling back to simple scene:', fullSceneError)
        console.error('Full error:', fullSceneError.stack)
        
        // First try the SimpleFallbackScene
        try {
          console.log('🎯 Creating Simple Fallback Scene...')
          const fallbackScene = new SimpleFallbackScene(this)
          await fallbackScene.init()
          this.scenes.set('unified', fallbackScene)
          console.log('✅ Simple Fallback Scene created successfully')
        } catch (fallbackError) {
          console.error('❌ Even fallback scene failed:', fallbackError)
          // Use the minimal test scene as last resort
          this.scenes.set('unified', testSceneWrapper)
          console.log('🆘 Using minimal test cube scene as emergency fallback')
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to create any scenes:', error)
      throw error
    }
  }

  setupEventListeners() {
    // Listen for performance changes
    window.addEventListener('performancechange', (event) => {
      this.handlePerformanceChange(event.detail)
    })
    
    // Listen for accessibility preferences
    window.addEventListener('motionpreference', (event) => {
      this.handleMotionPreference(event.detail)
    })
    
    window.addEventListener('contrastpreference', (event) => {
      this.handleContrastPreference(event.detail)
    })
  }

  handlePerformanceChange(detail) {
    const { settings } = detail
    
    // Update renderer settings
    this.renderer.setPixelRatio(settings.pixelRatio)
    
    // Update shadow map size
    if (this.renderer.shadowMap.enabled && settings.shadowMapSize !== this.currentShadowMapSize) {
      this.directionalLight.shadow.mapSize.width = settings.shadowMapSize
      this.directionalLight.shadow.mapSize.height = settings.shadowMapSize
      this.currentShadowMapSize = settings.shadowMapSize
    }
    
    // Notify all scenes of performance change
    this.scenes.forEach(scene => {
      if (scene.onPerformanceChange) {
        scene.onPerformanceChange(settings)
      }
    })
  }

  handleMotionPreference(detail) {
    this.scenes.forEach(scene => {
      if (scene.onMotionPreference) {
        scene.onMotionPreference(detail.reducedMotion)
      }
    })
  }

  handleContrastPreference(detail) {
    this.scenes.forEach(scene => {
      if (scene.onContrastPreference) {
        scene.onContrastPreference(detail.highContrast)
      }
    })
  }

  async transitionTo(sceneName) {
    console.log(`🎬 Attempting transition to ${sceneName}`)
    
    if (this.isTransitioning || !this.scenes.has(sceneName)) {
      console.log(`⚠️ Cannot transition: isTransitioning=${this.isTransitioning}, hasScene=${this.scenes.has(sceneName)}`)
      return
    }
    
    const newScene = this.scenes.get(sceneName)
    const oldScene = this.currentScene
    
    console.log(`🎬 Transitioning from ${oldScene?.constructor.name || 'none'} to ${newScene.constructor.name}`)
    
    if (oldScene === newScene) {
      console.log('⚠️ Same scene, skipping transition')
      return
    }
    
    this.isTransitioning = true
    
    try {
      // Notify old scene of exit
      if (oldScene && oldScene.onExit) {
        await oldScene.onExit()
      }
      
      // Transition lighting and camera
      await this.transitionLighting(newScene)
      await this.transitionCamera(newScene)
      
      // Set new scene as current
      this.currentScene = newScene
      console.log(`✅ Current scene set to: ${newScene.constructor.name}`)
      
      // Notify new scene of entry
      if (newScene.onEnter) {
        await newScene.onEnter()
      }
      
      // Dispatch scene change event
      window.dispatchEvent(new CustomEvent('scenechange', {
        detail: {
          name: sceneName,
          scene: newScene,
          description: newScene.getDescription?.() || '',
          elementCount: newScene.getInteractiveElementCount?.() || 0
        }
      }))
      
      console.log(`🎬 Transitioned to ${sceneName} scene`)
      
    } catch (error) {
      console.error(`Failed to transition to ${sceneName}:`, error)
    } finally {
      this.isTransitioning = false
    }
  }

  async transitionLighting(newScene) {
    return new Promise((resolve) => {
      // Get lighting configuration from scene
      const lightingConfig = newScene.getLightingConfig?.() || {
        ambientIntensity: 0.3,
        directionalIntensity: 0.8,
        directionalPosition: [50, 50, 50]
      }
      
      // Animate lighting changes
      const duration = this.transitionDuration / 1000
      
      // Use simple transitions since we don't have GSAP imported here
      // In a real implementation, you'd use GSAP for smooth transitions
      this.ambientLight.intensity = lightingConfig.ambientIntensity
      this.directionalLight.intensity = lightingConfig.directionalIntensity
      this.directionalLight.position.set(...lightingConfig.directionalPosition)
      
      setTimeout(resolve, duration * 1000)
    })
  }

  async transitionCamera(newScene) {
    return new Promise((resolve) => {
      // Get camera configuration from scene
      const cameraConfig = newScene.getCameraConfig?.() || {
        position: [0, 0, 50],
        target: [0, 0, 0],
        fov: 75
      }
      
      // Animate camera changes
      const duration = this.transitionDuration / 1000
      
      // Simple position updates - in real implementation use GSAP
      this.camera.position.set(...cameraConfig.position)
      this.camera.lookAt(...cameraConfig.target)
      this.camera.fov = cameraConfig.fov
      this.camera.updateProjectionMatrix()
      
      setTimeout(resolve, duration * 1000)
    })
  }

  update(deltaTime) {
    if (!this.isInitialized || !this.currentScene) return
    
    // Update current scene
    if (this.currentScene.update) {
      this.currentScene.update(deltaTime)
    }
    
    // Update lighting animations
    this.updateLighting(deltaTime)
  }

  updateLighting(deltaTime) {
    // Subtle breathing animation for ambient light
    const breathingCycle = Math.sin(deltaTime * 0.0005) * 0.1 + 0.3
    this.ambientLight.intensity = breathingCycle
  }

  updateScroll(progress, direction) {
    if (this.currentScene && this.currentScene.updateScroll) {
      this.currentScene.updateScroll(progress, direction)
    }
  }

  render() {
    if (!this.isInitialized || !this.currentScene) {
      // Only log occasionally to avoid spam
      if (Math.random() < 0.01) {
        console.log('⚠️ Render called but not ready:', {
          initialized: this.isInitialized,
          hasScene: !!this.currentScene,
          sceneType: this.currentScene?.constructor.name
        })
      }
      return
    }
    
    // Get the current scene's Three.js scene
    const threeScene = this.currentScene.getScene()
    
    if (threeScene) {
      // Add global lighting to scene if not already added
      if (!threeScene.children.includes(this.ambientLight)) {
        threeScene.add(this.ambientLight)
        threeScene.add(this.directionalLight)
        console.log('🔆 Added lighting to scene')
      }
      
      // Debug: log scene children count occasionally
      if (Math.random() < 0.005) { // More frequent logging initially
        console.log('🎬 Rendering scene with', threeScene.children.length, 'children')
        console.log('📷 Camera position:', this.camera.position.toArray())
        console.log('📷 Camera rotation:', this.camera.rotation.toArray())
      }
      
      // Render the scene
      this.renderer.render(threeScene, this.camera)
    } else {
      console.warn('⚠️ No Three.js scene found in current scene')
    }
  }

  handleResize() {
    if (!this.isInitialized) return
    
    const width = window.innerWidth
    const height = window.innerHeight
    
    // Update camera
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    // Update renderer
    this.renderer.setSize(width, height)
    
    // Notify current scene
    if (this.currentScene && this.currentScene.onResize) {
      this.currentScene.onResize(width, height)
    }
  }

  // Delegate mouse and touch events to current scene
  onMouseMove(event) {
    if (this.currentScene && this.currentScene.onMouseMove) {
      this.currentScene.onMouseMove(event)
    }
  }

  onClick(event) {
    if (this.currentScene && this.currentScene.onClick) {
      this.currentScene.onClick(event)
    }
  }

  onTouchStart(event) {
    if (this.currentScene && this.currentScene.onTouchStart) {
      this.currentScene.onTouchStart(event)
    }
  }

  getRenderer() {
    return this.renderer
  }

  getCamera() {
    return this.camera
  }

  getCurrentScene() {
    return this.currentScene
  }

  getScene(name) {
    return this.scenes.get(name)
  }

  dispose() {
    // Dispose of all scenes
    this.scenes.forEach(scene => {
      if (scene.dispose) {
        scene.dispose()
      }
    })
    
    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose()
    }
    
    console.log('🎬 Scene manager disposed')
  }
}