import * as THREE from 'three'
import { OmniHarmonicHomePage } from './OmniHarmonicHomePage.js'
import { IndrasNetScene } from './IndrasNetScene.js'
import { FlowerOfLifeScene } from './FlowerOfLifeScene.js'
import { DebugControls } from '../utils/DebugControls.js'

export class OmniHarmonicUnifiedScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    
    // Core sub-scenes following PRD progression
    this.topographicalScene = null
    this.indrasNetScene = null
    this.flowerOfLifeScene = null
    
    // Unified progression system
    this.globalProgress = 0
    this.currentPhase = 'topographical'
    this.isTransitioning = false
    this.transitionProgress = 0
    this.scrollDirection = 1 // 1 for down, -1 for up
    
    // Ultra-smooth phase configuration with much earlier terrain fade-out
    this.phases = {
      topographical: {
        range: [0, 0.18], // Much shorter terrain phase - fade out much sooner for better Indra's Net visibility
        camera: { position: [0, 200, 0], target: [0, 0, 0], fov: 85 }, // High top-down view
        lighting: { ambient: 0.6, directional: 1.5, position: [0, 150, 0] } // Sun directly overhead
      },
      indrasNet: {
        range: [0.18, 0.70], // Much longer Indra's Net phase for maximum visibility and impact
        camera: { position: [0, 195, 5], target: [0, 0, 0], fov: 80 }, // Much more gradual transition - stay closer to top-down
        lighting: { ambient: 0.4, directional: 0.8, position: [0, 130, 5] }
      },
      flowerOfLife: {
        range: [0.70, 1.0], // Longer final phase with smooth transitions
        camera: { position: [0, 120, 200], target: [0, 0, 0], fov: 45 }, // Much further away for stable view
        lighting: { ambient: 0.6, directional: 0.8, position: [0, 80, 0] } // Light from above for top-down
      }
    }
    
    // Ultra-smooth camera system with continuous flow - adjusted for earlier terrain fade
    this.cameraKeyframes = [
      // Topographical phase (0-18%) - shortened terrain showcase with smoother arc
      { scrollPercent: 0.0, position: [-470, 250, 490], rotation: [-0.258, -1.464, 0.000], fov: 75 },
      { scrollPercent: 0.06, position: [-320, 220, 500], rotation: [-0.280, -1.470, 0.000], fov: 75 }, // Faster approach
      { scrollPercent: 0.12, position: [-200, 200, 450], rotation: [-0.320, -1.200, 0.000], fov: 76 }, // Smoother left turn
      { scrollPercent: 0.18, position: [0, 170, 250], rotation: [-0.600, -0.200, 0.000], fov: 80 }, // End terrain much earlier
      
      // Extended transition to Indra's Net (18-40%) - longer smooth glide for better visibility
      { scrollPercent: 0.22, position: [0, 150, 150], rotation: [-0.800, 0.000, 0.000], fov: 82 }, // Continue smoothly upward
      { scrollPercent: 0.30, position: [0, 120, 50], rotation: [-1.100, 0.000, 0.000], fov: 84 }, // Smooth descent to network level
      { scrollPercent: 0.40, position: [0, 100, 0], rotation: [-1.300, 0.000, 0.000], fov: 82 }, // Arrive at network smoothly
      
      // Indra's Net phase (50-70%) - stable contemplation of the network
      { scrollPercent: 0.58, position: [0, 95, 0], rotation: [-1.400, 0.000, 0.000], fov: 80 }, // Looking down at network
      { scrollPercent: 0.65, position: [0, 90, 0], rotation: [-1.450, 0.000, 0.000], fov: 78 }, // Centered above network
      { scrollPercent: 0.70, position: [0, 85, 0], rotation: [-1.400, 0.000, 0.000], fov: 76 }, // Final network view
      
      // Smooth transition to Flower of Life (70-100%) - continuous cinematic pull-back
      { scrollPercent: 0.75, position: [0, 100, 20], rotation: [-1.200, 0.000, 0.000], fov: 74 }, // Start pulling back smoothly
      { scrollPercent: 0.82, position: [0, 120, 60], rotation: [-0.900, 0.000, 0.000], fov: 68 }, // Continue back continuously
      { scrollPercent: 0.90, position: [0, 140, 120], rotation: [-0.600, 0.000, 0.000], fov: 60 }, // Smooth approach
      { scrollPercent: 1.0, position: [0, 160, 200], rotation: [-0.300, 0.000, 0.000], fov: 50 } // Final meditation view
    ]
    
    this.cameraInitialized = false
    
    // Camera transition system
    this.cameraTransition = {
      isActive: false,
      startPosition: new THREE.Vector3(),
      endPosition: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
      endTarget: new THREE.Vector3(),
      startFov: 75,
      endFov: 75,
      progress: 0,
      duration: 4.5,
      easing: (t) => t // Default linear easing
    }
    
    // Scene cross-fade system
    this.sceneOpacity = {
      topographical: 1.0,
      indrasNet: 0.0,
      flowerOfLife: 0.0
    }
    
    this.time = 0
    this.mousePosition = new THREE.Vector2()
    
    // Debug controls and UI
    this.debugControls = null
    this.debugUI = null
  }

  async init() {
    console.log('🌊 Initializing OmniHarmonic Unified Scene System')
    
    try {
      // Test cube removed - rendering verification no longer needed
      console.log('🧪 Skipping test cube - using clean scene for production')
      
      // Initialize all sub-scenes
      await this.initializeSubScenes()
      
      // Setup unified lighting system
      this.setupUnifiedLighting()
      
      // Setup smooth camera controls
      this.setupCameraSystem()
      
      // Force camera to top-down immediately
      this.forceCameraTopDown()
      
      // Initialize at topographical phase
      this.updateProgression(0.01)
      
      // Initialize debug controls (available but inactive)
      this.setupDebugControls()
      
      console.log('✨ OmniHarmonic Unified Scene initialized - Digital Ecological Harmony ready')
      
    } catch (error) {
      console.error('❌ Critical error during OmniHarmonic init:', error)
      console.error('❌ Full error stack:', error.stack)
      
      // Emergency cube removed - let proper error handling take over
      if (this.scene.children.length === 0) {
        console.log('🆘 No objects in scene - allowing natural fallback system to handle')
      }
      
      throw error
    }
  }

  async initializeSubScenes() {
    try {
      // Initialize topographical scene (2D to 3D transformation)
      console.log('🏔️ Initializing topographical landscape...')
      try {
        this.topographicalScene = new OmniHarmonicHomePage(this.sceneManager)
        await this.topographicalScene.init()
        console.log('✅ Topographical scene initialized')
      } catch (topoError) {
        console.error('❌ Failed to initialize topographical scene:', topoError)
        throw topoError
      }
      
      // Initialize Indra's Net scene (holographic network)
      console.log('🕸️ Initializing Indra\'s Net holographic interface...')
      try {
        this.indrasNetScene = new IndrasNetScene(this.sceneManager)
        await this.indrasNetScene.init()
        console.log('✅ Indra\'s Net scene initialized')
      } catch (indraError) {
        console.error('❌ Failed to initialize Indra\'s Net scene:', indraError)
        throw indraError
      }
      
      // Initialize flower of life scene (sacred geometry sphere formation)
      console.log('🌸 Initializing Flower of Life sacred formation...')
      try {
        this.flowerOfLifeScene = new FlowerOfLifeScene(this.sceneManager)
        await this.flowerOfLifeScene.init()
        console.log('✅ Flower of Life scene initialized')
      } catch (flowerError) {
        console.error('❌ Failed to initialize Flower of Life scene:', flowerError)
        throw flowerError
      }
      
      // Add all scenes to the unified scene with proper layering
      console.log('🔗 Adding sub-scenes to unified scene...')
      this.scene.add(this.topographicalScene.getScene())
      this.scene.add(this.indrasNetScene.getScene())
      this.scene.add(this.flowerOfLifeScene.getScene())
      console.log('✅ All sub-scenes added to unified scene')
      
      // Set initial visibility states
      this.indrasNetScene.getScene().visible = false
      this.flowerOfLifeScene.getScene().visible = false
      console.log('✅ Initial visibility states set')
      
    } catch (error) {
      console.error('❌ Error initializing sub-scenes:', error)
      console.error('❌ Full error stack:', error.stack)
      this.createFallbackSystem()
    }
  }

  setupUnifiedLighting() {
    // Create bright ambient lighting to eliminate shadows
    this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8) // Bright white ambient
    this.scene.add(this.ambientLight)
    
    // Create sun-like directional light that follows camera
    this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.2) // Bright white sun
    this.directionalLight.position.set(0, 100, 0) // Start directly overhead
    this.directionalLight.castShadow = false // Disable shadows for better terrain visibility
    this.scene.add(this.directionalLight)
    
    // Additional hemisphere lighting for realistic sky illumination
    this.atmosphericLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.6) // Sky blue to forest green
    this.scene.add(this.atmosphericLight)
    
    // Track sun movement
    this.sunMovementTime = 0
  }

  setupCameraSystem() {
    // Initialize camera position for first phase - pure top-down
    console.log('📷 Setting up camera system...')
  }
  
  forceCameraTopDown() {
    // Set up camera with user-tested starting coordinates
    if (this.sceneManager.camera) {
      // Apply user-tested starting position and rotation
      this.sceneManager.camera.position.set(-470, 250, 490) // User-tested starting position
      this.sceneManager.camera.rotation.set(-0.258, -1.464, 0.000) // User-tested starting rotation
      this.sceneManager.camera.fov = 75 // Good FOV for mountain view
      this.sceneManager.camera.updateProjectionMatrix()
      
      console.log('📷 Camera set to user-tested starting coordinates')
      console.log('📍 Position:', this.sceneManager.camera.position)
      console.log('🔄 Rotation:', this.sceneManager.camera.rotation)
      
      // Mark camera as properly initialized
      this.cameraInitialized = true
      this.firstScrollPassed = false
      
      // Also override the scene's camera settings
      if (this.sceneManager.scene) {
        this.sceneManager.scene.camera = this.sceneManager.camera
      }
    }
  }

  updateProgression(globalProgress) {
    this.globalProgress = Math.max(0, Math.min(1, globalProgress))
    
    // Pure scroll-driven camera interpolation - no conflicts, completely smooth
    this.updateUnifiedCamera(this.globalProgress)
    
    // Update phases based on current position
    this.updateCurrentPhase()
    
    // Update scene visibilities with smooth cross-fading
    this.updateSceneVisibility()
    
    // Update lighting for current phase
    this.updateLighting()
  }

  updateUnifiedCamera(scrollProgress) {
    if (!this.sceneManager.camera) {
      console.warn('⚠️ Camera not available for updateUnifiedCamera')
      return
    }
    
    const camera = this.sceneManager.camera
    
    // Safety check for keyframes
    if (!this.cameraKeyframes || this.cameraKeyframes.length < 2) {
      console.warn('⚠️ Camera keyframes not properly initialized')
      return
    }
    
    // Find the two keyframes to interpolate between
    let keyframe1 = this.cameraKeyframes[0]
    let keyframe2 = this.cameraKeyframes[1]
    
    for (let i = 0; i < this.cameraKeyframes.length - 1; i++) {
      if (scrollProgress >= this.cameraKeyframes[i].scrollPercent && 
          scrollProgress <= this.cameraKeyframes[i + 1].scrollPercent) {
        keyframe1 = this.cameraKeyframes[i]
        keyframe2 = this.cameraKeyframes[i + 1]
        break
      }
    }
    
    // Safety check for valid keyframes
    if (!keyframe1 || !keyframe2 || !keyframe1.position || !keyframe2.position) {
      console.warn('⚠️ Invalid keyframes detected')
      return
    }
    
    try {
      // Calculate interpolation factor between the two keyframes
      const range = keyframe2.scrollPercent - keyframe1.scrollPercent
      const localProgress = range > 0 ? (scrollProgress - keyframe1.scrollPercent) / range : 0
      const smoothProgress = this.cinematicEase(localProgress)
      
      // Interpolate position
      const pos1 = new THREE.Vector3(...keyframe1.position)
      const pos2 = new THREE.Vector3(...keyframe2.position)
      const targetPosition = pos1.lerp(pos2, smoothProgress)
      
      // Interpolate rotation
      const rot1 = new THREE.Euler(...keyframe1.rotation)
      const rot2 = new THREE.Euler(...keyframe2.rotation)
      const targetRotation = new THREE.Euler(
        rot1.x + (rot2.x - rot1.x) * smoothProgress,
        rot1.y + (rot2.y - rot1.y) * smoothProgress,
        rot1.z + (rot2.z - rot1.z) * smoothProgress
      )
      
      // Interpolate FOV
      const targetFov = keyframe1.fov + (keyframe2.fov - keyframe1.fov) * smoothProgress
      
      // Apply smooth camera movement
      camera.position.copy(targetPosition)
      camera.rotation.copy(targetRotation)
      camera.fov = targetFov
      camera.updateProjectionMatrix()
      
      // Debug log for first few updates
      if (Math.random() < 0.001) {
        console.log('📷 Camera updated:', {
          position: camera.position.toArray(),
          rotation: camera.rotation.toArray(),
          fov: camera.fov
        })
      }
      
    } catch (error) {
      console.error('❌ Error updating camera:', error)
    }
  }

  resetToStartingState() {
    console.log('🔄 Enhanced smooth reset to starting state for reverse scroll')
    
    // Enhanced smooth camera reset with easing
    if (this.sceneManager.camera) {
      const startConfig = this.phases.topographical.camera
      const targetPos = new THREE.Vector3(...startConfig.position)
      const targetLookAt = new THREE.Vector3(...startConfig.target)
      
      // More responsive smooth transition back to starting position
      const resetSpeed = 0.15 // Faster reset for better UX
      this.sceneManager.camera.position.lerp(targetPos, resetSpeed)
      this.sceneManager.camera.lookAt(targetLookAt)
      this.sceneManager.camera.fov = THREE.MathUtils.lerp(this.sceneManager.camera.fov, startConfig.fov, resetSpeed)
      this.sceneManager.camera.updateProjectionMatrix()
    }
    
    // Smooth scene opacity reset with enhanced blending
    const resetLerpSpeed = 0.08 // Gentle but responsive reset
    this.sceneOpacity.topographical = THREE.MathUtils.lerp(this.sceneOpacity.topographical, 1.0, resetLerpSpeed)
    this.sceneOpacity.indrasNet = THREE.MathUtils.lerp(this.sceneOpacity.indrasNet, 0.0, resetLerpSpeed)
    this.sceneOpacity.flowerOfLife = THREE.MathUtils.lerp(this.sceneOpacity.flowerOfLife, 0.0, resetLerpSpeed)
    
    // Reset phase when opacity values are close to target
    if (this.sceneOpacity.topographical > 0.9 && this.sceneOpacity.indrasNet < 0.1 && this.sceneOpacity.flowerOfLife < 0.1) {
      this.currentPhase = 'topographical'
    }
    
    // Update scene visibility with smooth transitions
    this.updateSceneVisibility()
    
    // Reset animation flags for potential re-trigger
    if (this.globalProgress < 0.001) {
      this.firstScrollPassed = false
    }
  }

  updatePhaseProgression(globalProgress) {
    
    // Determine current phase and transition state
    const newPhase = this.determinePhase(this.globalProgress)
    
    if (newPhase !== this.currentPhase) {
      this.initiatePhaseTransition(newPhase)
    }
    
    // Update the current phase based on progress
    this.updateCurrentPhase()
    
    // Update camera position smoothly
    this.updateCameraTransition()
    
    // Update lighting for current phase
    this.updateLighting()
    
    // Update sub-scene visibilities and cross-fading
    this.updateSceneVisibility()
  }

  determinePhase(progress) {
    if (progress < this.phases.indrasNet.range[0]) {
      return 'topographical'
    } else if (progress < this.phases.flowerOfLife.range[0]) {
      return 'indrasNet'
    } else {
      return 'flowerOfLife'
    }
  }

  initiatePhaseTransition(newPhase) {
    if (this.isTransitioning) return
    
    console.log(`🔄 Phase transition: ${this.currentPhase} → ${newPhase}`)
    
    // Stop independent camera animation when leaving topographical phase
    if (this.currentPhase === 'topographical' && newPhase !== 'topographical') {
      this.cameraAnimation.isRunning = false
      if (this.cameraAnimation.rafId) {
        cancelAnimationFrame(this.cameraAnimation.rafId)
      }
      console.log('📷 Stopped independent camera animation for phase transition')
    }
    
    this.isTransitioning = true
    this.transitionProgress = 0
    
    // Setup camera transition
    this.setupCameraTransition(this.currentPhase, newPhase)
    
    // Trigger scene-specific transition animations
    this.triggerSceneTransitions(this.currentPhase, newPhase)
    
    // Update current phase
    this.currentPhase = newPhase
  }

  setupCameraTransition(fromPhase, toPhase) {
    const fromConfig = this.phases[fromPhase].camera
    const toConfig = this.phases[toPhase].camera
    
    // Enhanced smooth transition with cinematic easing
    let startPos = new THREE.Vector3(...fromConfig.position)
    if (this.sceneManager.camera) {
      startPos = this.sceneManager.camera.position.clone()
    }
    
    this.cameraTransition = {
      isActive: true,
      startPosition: startPos,
      endPosition: new THREE.Vector3(...toConfig.position),
      startTarget: new THREE.Vector3(...fromConfig.target),
      endTarget: new THREE.Vector3(...toConfig.target),
      startFov: fromConfig.fov,
      endFov: toConfig.fov,
      progress: 0,
      duration: 4.5, // Longer duration for ultra-smooth cinematic feel
      easing: this.cinematicEase // Ultra-smooth bezier-inspired easing
    }
    
    console.log(`📷 Enhanced smooth camera transition: ${fromPhase} → ${toPhase}`)
  }

  // Enhanced cinematic easing functions for ultra-smooth transitions
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // Even smoother quartic easing for ultimate smoothness
  easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
  }

  // Bezier-inspired easing for cinematic quality
  cinematicEase(t) {
    // Custom bezier curve: (0.25, 0.46, 0.45, 0.94) - ultra-smooth
    const c1 = 0.25, c2 = 0.46, c3 = 0.45, c4 = 0.94
    if (t === 0) return 0
    if (t === 1) return 1
    
    // Approximation of cubic bezier easing
    return 3 * (1 - t) * (1 - t) * t * c2 + 3 * (1 - t) * t * t * c4 + t * t * t
  }

  triggerSceneTransitions(fromPhase, toPhase) {
    // Enhanced transition animations with smooth morphing effects
    console.log(`🔄 Triggering transition animations: ${fromPhase} → ${toPhase}`)
    
    // Trigger exit animations for leaving scene with morphing
    switch (fromPhase) {
      case 'topographical':
        // Topographical scene smoothly fades wireframe and prepares for network
        if (this.topographicalScene) {
          this.topographicalScene.animateTransition('exit')
          // Start fading wireframe for smoother transition to network
          if (this.topographicalScene.wireframeMesh?.material.uniforms) {
            this.topographicalScene.wireframeMesh.material.uniforms.wireframeIntensity.value = 0.2
          }
        }
        break
      case 'indrasNet':
        if (this.indrasNetScene) {
          this.indrasNetScene.animateExit()
        }
        break
      case 'flowerOfLife':
        if (this.flowerOfLifeScene) {
          this.flowerOfLifeScene.animateExit?.()
        }
        break
    }
    
    // Trigger entry animations for entering scene with morphing
    switch (toPhase) {
      case 'topographical':
        if (this.topographicalScene) {
          this.topographicalScene.animateTransition('enter')
        }
        break
      case 'indrasNet':
        if (this.indrasNetScene) {
          // Pre-fade the network to start invisible, then fade in
          this.indrasNetScene.getScene().traverse(child => {
            if (child.material && child.material.uniforms && child.material.uniforms.opacity) {
              child.material.uniforms.opacity.value = 0.0
            }
          })
          
          this.indrasNetScene.animateEntry()
          
          // Smooth fade-in animation for network
          setTimeout(() => {
            this.fadeInNetworkScene()
          }, 500)
        }
        break
      case 'flowerOfLife':
        if (this.flowerOfLifeScene) {
          this.flowerOfLifeScene.animateEntry?.()
          console.log('🌸 Flower of Life scene should now be active and forming sacred geometry')
        }
        break
    }
  }

  updateCurrentPhase() {
    const phaseConfig = this.phases[this.currentPhase]
    const phaseStart = phaseConfig.range[0]
    const phaseEnd = phaseConfig.range[1]
    const phaseProgress = (this.globalProgress - phaseStart) / (phaseEnd - phaseStart)
    const normalizedProgress = Math.max(0, Math.min(1, phaseProgress))
    
    // Update the active scene with its progress and camera movement
    switch (this.currentPhase) {
      case 'topographical':
        if (this.topographicalScene) {
          // Use time-based progress for terrain transformation
          this.updateTopographicalTerrain()
        }
        break
      case 'indrasNet':
        if (this.indrasNetScene) {
          // Indra's Net doesn't need scroll progress updates, it's interaction-based
        }
        break
      case 'flowerOfLife':
        if (this.flowerOfLifeScene) {
          // Flower of Life scene evolves over time, not directly from scroll
          this.flowerOfLifeScene.updateEvolution?.(normalizedProgress)
        }
        break
    }
  }

  updateCameraTransition() {
    if (!this.cameraTransition.isActive) return
    
    // Don't override camera when debug controls are active
    if (this.topographicalScene?.debugControls?.isActive) {
      return
    }
    
    const deltaTime = 0.016 // Assume 60fps for smooth transition
    this.cameraTransition.progress += (deltaTime / this.cameraTransition.duration) * 0.5 // Even slower progression
    
    if (this.cameraTransition.progress >= 1.0) {
      this.cameraTransition.progress = 1.0
      this.cameraTransition.isActive = false
      this.isTransitioning = false
      console.log('📷 Enhanced smooth phase transition completed')
    }
    
    // Use ultra-smooth bezier-inspired easing for cinematic camera transitions
    const smoothProgress = this.cinematicEase(this.cameraTransition.progress)
    
    // Direct camera positioning for smoothest results
    const camera = this.sceneManager.camera
    if (camera) {
      {
        // Standard transition
        const targetPosition = new THREE.Vector3().lerpVectors(
          this.cameraTransition.startPosition,
          this.cameraTransition.endPosition,
          smoothProgress
        )
        
        const targetLookAt = new THREE.Vector3().lerpVectors(
          this.cameraTransition.startTarget,
          this.cameraTransition.endTarget,
          smoothProgress
        )
        
        // Set position directly for maximum smoothness
        camera.position.copy(targetPosition)
        camera.lookAt(targetLookAt)
        
        // Smooth field of view transition
        const targetFov = THREE.MathUtils.lerp(
          this.cameraTransition.startFov,
          this.cameraTransition.endFov,
          smoothProgress
        )
        
        camera.fov = targetFov
        camera.updateProjectionMatrix()
      }
    }
  }


  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  smootherstep(t) {
    // Smootherstep function for ultra-smooth interpolation
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  cinematicEasing(t) {
    // Ultra-smooth cinematic easing for buttery camera movement
    // Combination of ease-in-out-cubic with smootherstep for cinema-quality motion
    const cubic = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const smooth = this.smootherstep(cubic)
    return smooth
  }

  fadeInNetworkScene() {
    // Smooth fade-in animation for Indra's Net
    if (!this.indrasNetScene) return
    
    const targetOpacity = 0.6
    let currentOpacity = 0.0
    
    const fadeIn = () => {
      currentOpacity += 0.02
      
      this.indrasNetScene.getScene().traverse(child => {
        if (child.material && child.material.uniforms && child.material.uniforms.opacity) {
          child.material.uniforms.opacity.value = Math.min(currentOpacity, targetOpacity)
        }
      })
      
      if (currentOpacity < targetOpacity) {
        requestAnimationFrame(fadeIn)
      }
    }
    
    fadeIn()
  }

  updateTopographicalTerrain() {
    // Time-based terrain transformation
    if (this.topographicalScene && this.firstScrollPassed) {
      const currentTime = performance.now()
      const phaseTime = currentTime - this.animationClock.currentPhaseStartTime
      const terrainTransitionDuration = 180000 // Match camera duration for coherent flow
      const timeProgress = Math.min(phaseTime / terrainTransitionDuration, 1.0)
      
      this.topographicalScene.animateTransformation(timeProgress)
    }
  }

  updateTopographicalCamera() {
    // Completely time-based camera movement independent of scroll AND phase
    if (this.sceneManager.camera && this.firstScrollPassed && this.animationClock.startTime) {
      const camera = this.sceneManager.camera
      
      const currentTime = performance.now()
      const phaseTime = currentTime - this.animationClock.startTime // Use main start time, not phase time
      const cameraTransitionDuration = 25000 // 25 seconds for buttery smooth cinematic sweep
      const timeProgress = Math.min(phaseTime / cameraTransitionDuration, 1.0)
      
      // Minimal debug logging
      if (Math.floor(phaseTime / 2000) !== Math.floor((phaseTime - 16) / 2000)) {
        console.log(`📷 Camera: ${(timeProgress * 100).toFixed(0)}% complete`)
      }
      
      // Define smooth camera rotation from top-down to oblique view
      const aspect = window.innerWidth / window.innerHeight
      const cameraHeight = aspect > 1 ? 200 : 250 // Consistent height throughout
      
      // Cinematic sweep that ends almost perpendicular to ground, gliding forward
      const waypoints = [
        { progress: 0.0, position: [0, cameraHeight, 0], target: [0, 0, 0] }, // High overhead start
        { progress: 0.2, position: [0, cameraHeight * 0.8, 40], target: [0, 0, 30] }, // Begin descent
        { progress: 0.4, position: [0, cameraHeight * 0.6, 80], target: [0, 0, 70] }, // Descending
        { progress: 0.6, position: [0, cameraHeight * 0.4, 120], target: [0, 0, 110] }, // Getting lower
        { progress: 0.8, position: [0, cameraHeight * 0.2, 160], target: [0, 0, 150] }, // Very low
        { progress: 1.0, position: [0, 40, 200], target: [0, 0, 250] } // Almost perpendicular, gliding forward
      ]
      
      // Find the current segment based on time progress
      let currentWaypoint = waypoints[0]
      let nextWaypoint = waypoints[1]
      
      for (let i = 0; i < waypoints.length - 1; i++) {
        if (timeProgress >= waypoints[i].progress && timeProgress <= waypoints[i + 1].progress) {
          currentWaypoint = waypoints[i]
          nextWaypoint = waypoints[i + 1]
          break
        }
      }
      
      // Calculate ultra-smooth cinematic interpolation between waypoints
      const segmentProgress = (timeProgress - currentWaypoint.progress) / (nextWaypoint.progress - currentWaypoint.progress)
      const cinematicProgress = this.cinematicEasing(segmentProgress)
      
      // Interpolate position with cinematic smoothness
      const currentPos = new THREE.Vector3(...currentWaypoint.position)
      const nextPos = new THREE.Vector3(...nextWaypoint.position)
      const targetPosition = currentPos.lerp(nextPos, cinematicProgress)
      
      // Ultra-smooth camera position update with very gentle momentum
      const oldPosition = camera.position.clone()
      // Ultra-smooth camera movement with gentle lerp
      camera.position.lerp(targetPosition, 0.05) // Gentle lerp for smoothness
      
      // Debug movement amount
      const movement = oldPosition.distanceTo(camera.position)
      console.log(`📷 Movement: ${movement.toFixed(4)} units - Target: [${targetPosition.x.toFixed(1)},${targetPosition.y.toFixed(1)},${targetPosition.z.toFixed(1)}]`)
      
      // Interpolate look-at target with cinematic smoothness
      const currentTarget = new THREE.Vector3(...currentWaypoint.target)
      const nextTarget = new THREE.Vector3(...nextWaypoint.target)
      const lookAtTarget = currentTarget.lerp(nextTarget, cinematicProgress)
      
      camera.lookAt(lookAtTarget)
      camera.updateProjectionMatrix()
    }
  }

  updateLighting() {
    // Update sun movement time
    this.sunMovementTime += 0.016
    
    // Move sun in a slow arc overhead to provide consistent illumination
    const sunRadius = 80
    const sunHeight = 100
    const sunX = Math.sin(this.sunMovementTime * 0.1) * sunRadius
    const sunZ = Math.cos(this.sunMovementTime * 0.1) * sunRadius
    
    if (this.directionalLight) {
      // Keep sun always overhead relative to camera position
      const camera = this.sceneManager.camera
      if (camera) {
        this.directionalLight.position.set(
          camera.position.x + sunX,
          sunHeight,
          camera.position.z + sunZ
        )
        
        // Make light always point down toward terrain
        this.directionalLight.target.position.set(camera.position.x, 0, camera.position.z)
        this.directionalLight.target.updateMatrixWorld()
      }
    }
    
    // Keep ambient light bright and consistent
    if (this.ambientLight) {
      this.ambientLight.intensity = 0.8 // Always bright
    }
    
    // Keep hemisphere light consistent for sky illumination
    if (this.atmosphericLight) {
      this.atmosphericLight.intensity = 0.6
    }
  }

  updateSceneVisibility() {
    // Ultra-smooth cross-fade between scenes with extended transitions
    const fadeMargin = 0.25 // Longer overlap for more gradual terrain fade-out
    
    // Calculate target opacities with enhanced cinematic easing
    let targetOpacities = {
      topographical: 0,
      indrasNet: 0,
      flowerOfLife: 0
    }
    
    if (this.globalProgress < this.phases.indrasNet.range[0] - fadeMargin) {
      targetOpacities.topographical = 1
    } else if (this.globalProgress < this.phases.indrasNet.range[0] + fadeMargin) {
      const fadeProgress = (this.globalProgress - (this.phases.indrasNet.range[0] - fadeMargin)) / (2 * fadeMargin)
      const easedFade = this.cinematicEase(fadeProgress) // Ultra-smooth cinematic easing
      targetOpacities.topographical = 1 - easedFade
      targetOpacities.indrasNet = easedFade
    } else if (this.globalProgress < this.phases.flowerOfLife.range[0] - fadeMargin) {
      targetOpacities.indrasNet = 1
    } else if (this.globalProgress < this.phases.flowerOfLife.range[0] + fadeMargin) {
      const fadeProgress = (this.globalProgress - (this.phases.flowerOfLife.range[0] - fadeMargin)) / (2 * fadeMargin)
      const easedFade = this.cinematicEase(fadeProgress) // Ultra-smooth cinematic easing
      targetOpacities.indrasNet = 1 - easedFade
      targetOpacities.flowerOfLife = easedFade
    } else {
      targetOpacities.flowerOfLife = 1
    }
    
    // Apply opacity changes with enhanced ultra-smooth blending
    Object.keys(targetOpacities).forEach(sceneName => {
      const lerpSpeed = 0.008 // Much gentler lerp for extremely gradual terrain fade-out
      this.sceneOpacity[sceneName] = THREE.MathUtils.lerp(
        this.sceneOpacity[sceneName],
        targetOpacities[sceneName],
        lerpSpeed
      )
    })
    
    // Update scene visibility and opacity
    if (this.topographicalScene) {
      const scene = this.topographicalScene.getScene()
      scene.visible = this.sceneOpacity.topographical > 0.01
      this.applySceneOpacity(scene, this.sceneOpacity.topographical)
    }
    
    if (this.indrasNetScene) {
      const scene = this.indrasNetScene.getScene()
      scene.visible = this.sceneOpacity.indrasNet > 0.01
      this.applySceneOpacity(scene, this.sceneOpacity.indrasNet)
    }
    
    if (this.flowerOfLifeScene) {
      const scene = this.flowerOfLifeScene.getScene()
      scene.visible = this.sceneOpacity.flowerOfLife > 0.01
      this.applySceneOpacity(scene, this.sceneOpacity.flowerOfLife)
    }
  }

  applySceneOpacity(scene, opacity) {
    // Apply opacity to all materials with enhanced morphing effects
    scene.traverse(child => {
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => {
            if (material.uniforms) {
              if (material.uniforms.opacity) {
                material.uniforms.opacity.value = opacity
              }
              if (material.uniforms.transformProgress) {
                material.uniforms.transformProgress.value = opacity
              }
              if (material.uniforms.morphFactor) {
                material.uniforms.morphFactor.value = opacity
              }
            } else if (material.opacity !== undefined) {
              material.opacity = opacity
              material.transparent = opacity < 1
            }
          })
        } else {
          if (child.material.uniforms) {
            if (child.material.uniforms.opacity) {
              child.material.uniforms.opacity.value = opacity
            }
            if (child.material.uniforms.transformProgress) {
              child.material.uniforms.transformProgress.value = opacity
            }
            if (child.material.uniforms.morphFactor) {
              child.material.uniforms.morphFactor.value = opacity
            }
          } else if (child.material.opacity !== undefined) {
            child.material.opacity = opacity
            child.material.transparent = opacity < 1
          }
        }
      }
    })
  }

  onMouseMove(event) {
    // Update normalized mouse position
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Pass mouse events to active sub-scenes
    if (this.sceneOpacity.topographical > 0.1 && this.topographicalScene) {
      this.topographicalScene.onMouseMove(event)
    }
    
    if (this.sceneOpacity.indrasNet > 0.1 && this.indrasNetScene) {
      this.indrasNetScene.onMouseMove(event)
    }
  }

  onMouseClick(event) {
    // Pass click events to active sub-scenes
    if (this.sceneOpacity.topographical > 0.1 && this.topographicalScene) {
      this.topographicalScene.onMouseClick(event)
    }
    
    if (this.sceneOpacity.indrasNet > 0.1 && this.indrasNetScene) {
      this.indrasNetScene.onMouseClick(event)
    }
  }

  // Old camera animation system removed - using unified scroll-driven system

  updateSmoothCameraPosition(progress) {
    if (!this.sceneManager.camera) return
    
    const camera = this.sceneManager.camera
    
    // Camera animation using user-tested waypoints for perfect mountain showcase
    let targetPosition, targetRotation
    
    if (progress < 0.33) {
      // Phase 1: Starting position to middle position (0-33%)
      const phase1Progress = progress / 0.33
      const easedProgress = this.cinematicEasing(phase1Progress)
      
      const startPos = new THREE.Vector3(-470, 250, 490) // Starting position
      const endPos = new THREE.Vector3(-260, 210, 510) // Middle position
      
      const startRot = new THREE.Euler(-0.258, -1.464, 0.000) // Starting rotation
      const endRot = new THREE.Euler(-0.318, -1.476, 0.000) // Middle rotation
      
      targetPosition = startPos.clone().lerp(endPos, easedProgress)
      targetRotation = new THREE.Euler(
        startRot.x + (endRot.x - startRot.x) * easedProgress,
        startRot.y + (endRot.y - startRot.y) * easedProgress,
        startRot.z + (endRot.z - startRot.z) * easedProgress
      )
      
    } else if (progress < 0.66) {
      // Phase 2: Middle position to end position pt 1 (33-66%)
      const phase2Progress = (progress - 0.33) / 0.33
      const easedProgress = this.cinematicEasing(phase2Progress)
      
      const startPos = new THREE.Vector3(-260, 210, 510) // Middle position
      const endPos = new THREE.Vector3(-170, 210, 430) // End position pt 1
      
      const startRot = new THREE.Euler(-0.318, -1.476, 0.000) // Middle rotation
      const endRot = new THREE.Euler(-0.390, -0.576, 0.000) // End rotation pt 1
      
      targetPosition = startPos.clone().lerp(endPos, easedProgress)
      targetRotation = new THREE.Euler(
        startRot.x + (endRot.x - startRot.x) * easedProgress,
        startRot.y + (endRot.y - startRot.y) * easedProgress,
        startRot.z + (endRot.z - startRot.z) * easedProgress
      )
      
    } else {
      // Phase 3: End position pt 1 to final position pt 2 (66-100%)
      const phase3Progress = (progress - 0.66) / 0.34
      const easedProgress = this.cinematicEasing(phase3Progress)
      
      const startPos = new THREE.Vector3(-170, 210, 430) // End position pt 1
      const endPos = new THREE.Vector3(70, 190, -40) // Final position pt 2
      
      const startRot = new THREE.Euler(-0.390, -0.576, 0.000) // End rotation pt 1
      const endRot = new THREE.Euler(-0.306, -0.402, 0.000) // Final rotation pt 2
      
      targetPosition = startPos.clone().lerp(endPos, easedProgress)
      targetRotation = new THREE.Euler(
        startRot.x + (endRot.x - startRot.x) * easedProgress,
        startRot.y + (endRot.y - startRot.y) * easedProgress,
        startRot.z + (endRot.z - startRot.z) * easedProgress
      )
    }
    
    // Apply smooth camera movement with direct positioning
    camera.position.copy(targetPosition)
    camera.rotation.copy(targetRotation)
    
    // Debug every 20%
    if (Math.floor(progress * 100) % 20 === 0 && Math.floor(progress * 100) !== this.lastLoggedProgress) {
      console.log(`📷 USER WAYPOINTS: ${Math.floor(progress * 100)}% pos=[${camera.position.x.toFixed(0)},${camera.position.y.toFixed(0)},${camera.position.z.toFixed(0)}]`)
      this.lastLoggedProgress = Math.floor(progress * 100)
    }
  }

  update(deltaTime) {
    this.time += deltaTime
    
    // Update debug controls
    if (this.debugControls) {
      this.debugControls.update()
    }
    
    // 3D cards removed - using 2D UI cards instead
    
    // Camera now runs on completely independent system
    // No camera updates here to avoid conflicts
    
    // Update camera transitions
    this.updateCameraTransition()
    
    // Update all sub-scenes that are visible
    if (this.sceneOpacity.topographical > 0.01 && this.topographicalScene) {
      this.topographicalScene.update(deltaTime)
    }
    
    if (this.sceneOpacity.indrasNet > 0.01 && this.indrasNetScene) {
      this.indrasNetScene.update(deltaTime)
    }
    
    if (this.sceneOpacity.flowerOfLife > 0.01 && this.flowerOfLifeScene) {
      this.flowerOfLifeScene.update(deltaTime)
    }
    
    // Update unified lighting
    this.updateLighting()
    
    // Update scene visibility
    this.updateSceneVisibility()
  }

  updateScroll(progress, direction) {
    // This is the main entry point for scroll-based progression
    console.log(`🌊 Scroll progress: ${(progress * 100).toFixed(1)}% direction: ${direction}`)
    
    // Store direction for reverse scroll handling
    this.scrollDirection = direction
    
    // Apply much more gradual camera motion with heavy smoothing
    // Use exponential smoothing to make camera movement very gradual
    const smoothingFactor = 0.02 // Very slow smoothing (0.02 = 2% per frame)
    const targetProgress = progress
    
    // Initialize smoothed progress if not set
    if (this.smoothedProgress === undefined) {
      this.smoothedProgress = targetProgress
    }
    
    // Apply exponential smoothing for ultra-gradual camera motion
    this.smoothedProgress += (targetProgress - this.smoothedProgress) * smoothingFactor
    
    // Update progression with smoothed value for camera
    this.updateProgression(this.smoothedProgress)
    
    // Force update of individual scenes with original progress for other effects
    if (this.topographicalScene) {
      this.topographicalScene.updateScroll(progress, direction)
    }
  }

  setupDebugControls() {
    // Delay setup to ensure terrain is loaded
    setTimeout(() => {
      // Get terrain mesh from topographical scene
      let terrainMesh = null
      let wireframeMesh = null
      
      if (this.topographicalScene && this.topographicalScene.topographyMesh) {
        terrainMesh = this.topographicalScene.topographyMesh
        wireframeMesh = this.topographicalScene.fatWireframeLines
      }
      
      this.debugControls = new DebugControls(
        this.sceneManager.camera,
        terrainMesh,
        wireframeMesh
      )
      
      // Create on-screen debug UI
      this.createDebugUI()
      
      console.log('🎮 Debug controls initialized for unified scene')
      console.log('🎮 Press ` (backtick) to toggle debug mode!')
    }, 1000) // Give terrain time to load
  }
  
  createDebugUI() {
    // Create debug info overlay
    this.debugUI = document.createElement('div')
    this.debugUI.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      display: none;
      max-width: 400px;
      line-height: 1.4;
    `
    
    document.body.appendChild(this.debugUI)
    
    // Update debug info periodically
    setInterval(() => {
      if (this.debugControls && this.debugControls.isActive) {
        this.updateDebugUI()
      }
    }, 100)
  }
  
  updateDebugUI() {
    if (!this.debugUI || !this.sceneManager.camera) return
    
    const camera = this.sceneManager.camera
    let terrainInfo = ''
    
    if (this.topographicalScene && this.topographicalScene.topographyMesh) {
      const terrain = this.topographicalScene.topographyMesh
      terrainInfo = `
        <strong>Terrain Rotation:</strong><br>
        X: ${terrain.rotation.x.toFixed(3)}<br>
        Y: ${terrain.rotation.y.toFixed(3)}<br>
        Z: ${terrain.rotation.z.toFixed(3)}<br><br>
      `
    }
    
    this.debugUI.innerHTML = `
      <strong>🎮 DEBUG CONTROLS ACTIVE</strong><br>
      Press backtick key to toggle<br><br>
      
      <strong>Camera Position:</strong><br>
      X: ${camera.position.x.toFixed(2)}<br>
      Y: ${camera.position.y.toFixed(2)}<br>
      Z: ${camera.position.z.toFixed(2)}<br><br>
      
      <strong>Camera Rotation:</strong><br>
      X: ${camera.rotation.x.toFixed(3)}<br>
      Y: ${camera.rotation.y.toFixed(3)}<br>
      Z: ${camera.rotation.z.toFixed(3)}<br><br>
      
      ${terrainInfo}
      
      <strong>Controls:</strong><br>
      WASD: Move camera<br>
      QE: Up/Down<br>
      Arrows: Rotate camera<br>
      IJKL: Rotate terrain<br>
      P: Print to console
    `
    
    this.debugUI.style.display = this.debugControls.isActive ? 'block' : 'none'
  }
  
  // 3D frosted cards removed - now using 2D UI cards

  createFallbackSystem() {
    // Fallback system removed - using proper scene management instead
    console.log('🔄 Fallback cube system disabled - relying on proper scene initialization')
  }

  onEnter() {
    console.log('✨ Entering OmniHarmonic Unified Experience')
    
    // Force camera to top-down again on entry
    this.forceCameraTopDown()
    
    // Set mouse event listeners
    document.addEventListener('mousemove', this.onMouseMove.bind(this))
    document.addEventListener('click', this.onMouseClick.bind(this))
    
    // Initialize audio for the experience
  }

  onExit() {
    console.log('✨ Exiting OmniHarmonic Unified Experience')
    
    // Stop camera animation
    if (this.cameraAnimation.rafId) {
      cancelAnimationFrame(this.cameraAnimation.rafId)
      this.cameraAnimation.isRunning = false
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.onMouseMove.bind(this))
    document.removeEventListener('click', this.onMouseClick.bind(this))
  }

  getDescription() {
    return 'Unified progression through topographical landscapes, holographic networks, and cellular genesis'
  }

  getScene() {
    return this.scene
  }

  dispose() {
    // Dispose debug controls and UI
    if (this.debugControls) {
      this.debugControls.dispose()
    }
    
    if (this.debugUI) {
      document.body.removeChild(this.debugUI)
    }
    
    // 3D cards removed - no disposal needed
    
    // Dispose all sub-scenes
    if (this.topographicalScene) {
      this.topographicalScene.dispose()
    }
    
    if (this.indrasNetScene) {
      this.indrasNetScene.dispose()
    }
    
    if (this.flowerOfLifeScene) {
      this.flowerOfLifeScene.dispose()
    }
    
    // Dispose unified scene elements
    this.scene.traverse(child => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    
    console.log('✨ OmniHarmonic Unified Scene disposed')
  }
}