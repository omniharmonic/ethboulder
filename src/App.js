import { SceneManager } from './scenes/SceneManager.js'
import { PerformanceMonitor } from './utils/PerformanceMonitor.js'
import { AccessibilityManager } from './utils/AccessibilityManager.js'
import { ScrollController } from './utils/ScrollController.js'
import { LoadingManager } from './utils/LoadingManager.js'
import { FrostedGlassCardsUI } from './components/FrostedGlassCardsUI.js'

export class App {
  constructor() {
    this.isInitialized = false
    this.isPaused = false
    this.startTime = performance.now()
    this.deltaTime = 0
    this.lastTime = 0
    
    // Core managers
    this.loadingManager = new LoadingManager()
    this.performanceMonitor = new PerformanceMonitor()
    this.sceneManager = null
    this.accessibilityManager = null
    this.scrollController = null
    this.frostedCardsUI = null
    
    // Bind methods
    this.render = this.render.bind(this)
    this.handleResize = this.handleResize.bind(this)
  }

  async init() {
    if (this.isInitialized) return
    
    try {
      console.log('🌊 Initializing OmniHarmonic...')
      
      // Show loading screen
      this.showLoadingScreen()
      
      // Add a safety timeout to hide loading screen if something goes wrong
      const loadingTimeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout reached, forcing loading screen hide')
        this.hideLoadingScreen()
      }, 10000) // 10 second timeout
      
      // Initialize core managers
      await this.initializeManagers()
      
      // Load initial assets
      await this.loadCriticalAssets()
      
      // Setup user interactions
      this.setupEventListeners()
      
      // Start render loop
      this.startRenderLoop()
      
      // Clear timeout and hide loading screen
      clearTimeout(loadingTimeout)
      this.hideLoadingScreen()
      
      this.isInitialized = true
      console.log('✨ OmniHarmonic initialized successfully')
      
    } catch (error) {
      console.error('Failed to initialize OmniHarmonic:', error)
      this.hideLoadingScreen() // Make sure to hide loading screen on error
      this.showErrorMessage('Failed to load application. Please refresh the page.')
    }
  }

  async initializeManagers() {
    try {
      console.log('🔧 Initializing managers...')
      
      // Performance monitoring first
      await this.performanceMonitor.init()
      console.log('✅ Performance monitor initialized')
      
      
      // Initialize accessibility
      this.accessibilityManager = new AccessibilityManager()
      console.log('✅ Accessibility manager created')
      
      // Initialize 3D scenes
      console.log('🎬 Creating scene manager...')
      this.sceneManager = new SceneManager(this.performanceMonitor)
      await this.sceneManager.init()
      console.log('✅ Scene manager initialized')
      
      // Initialize scroll controller
      this.scrollController = new ScrollController(this.sceneManager)
      console.log('✅ Scroll controller initialized')
      
      // Initialize frosted glass cards UI
      this.frostedCardsUI = new FrostedGlassCardsUI()
      this.frostedCardsUI.init()
      console.log('✅ Frosted glass cards UI initialized')
      
    } catch (error) {
      console.error('Manager initialization error:', error)
      console.error('Error stack:', error.stack)
      // Continue with limited functionality
      if (!this.sceneManager) {
        throw new Error('Critical: Scene manager failed to initialize')
      }
    }
  }

  async loadCriticalAssets() {
    // Load essential assets for initial experience
    const criticalAssets = [
      // Add paths to critical assets here
    ]
    
    await this.loadingManager.loadAssets(criticalAssets)
  }

  setupEventListeners() {
    // Mouse interactions
    document.addEventListener('mousemove', (event) => {
      if (this.sceneManager && this.sceneManager.currentScene) {
        this.sceneManager.currentScene.onMouseMove?.(event)
      }
    })
    
    document.addEventListener('click', (event) => {
      if (this.sceneManager && this.sceneManager.currentScene) {
        this.sceneManager.currentScene.onClick?.(event)
      }
      
    })
    
    // Touch interactions for mobile
    document.addEventListener('touchstart', (event) => {
      if (this.sceneManager && this.sceneManager.currentScene) {
        this.sceneManager.currentScene.onTouchStart?.(event)
      }
    })
    
    // Keyboard interactions
    document.addEventListener('keydown', (event) => {
      this.accessibilityManager.handleKeyboard(event)
    })
    
    // Scroll interactions
    window.addEventListener('scroll', () => {
      this.scrollController.updateScrollProgress()
    }, { passive: true })
  }

  startRenderLoop() {
    const animate = (currentTime) => {
      if (this.isPaused) {
        requestAnimationFrame(animate)
        return
      }
      
      // Calculate delta time
      this.deltaTime = currentTime - this.lastTime
      this.lastTime = currentTime
      
      // Update managers
      this.performanceMonitor.update(this.deltaTime)
      this.sceneManager?.update(this.deltaTime)
      
      // Render the scene
      this.render()
      
      requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }

  render() {
    if (this.sceneManager) {
      this.sceneManager.render()
    }
  }

  handleResize() {
    if (this.sceneManager) {
      this.sceneManager.handleResize()
    }
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  showLoadingScreen() {
    console.log('🔄 Showing loading screen')
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.style.display = 'flex'
      console.log('✅ Loading screen displayed')
    } else {
      console.error('❌ Loading screen element not found')
    }
  }

  hideLoadingScreen() {
    console.log('✅ Hiding loading screen')
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      setTimeout(() => {
        loadingScreen.style.display = 'none'
        console.log('✅ Loading screen hidden')
      }, 500)
    } else {
      console.error('❌ Loading screen element not found')
    }
  }

  showErrorMessage(message) {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error-message'
    errorDiv.innerHTML = `
      <h2>⚠️ Loading Error</h2>
      <p>${message}</p>
      <button onclick="window.location.reload()">Retry</button>
    `
    document.body.appendChild(errorDiv)
  }
}