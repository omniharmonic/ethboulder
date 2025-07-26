import * as THREE from 'three'

export class HomePage {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    this.topographyMesh = null
    this.contourLinesMesh = null
    this.soundWaveSystem = null
    this.transformationProgress = 0
    this.mousePosition = new THREE.Vector2()
    this.time = 0
    this.soundWaves = []
    this.digitalSun = null
    this.atmosphereParticles = null
    
    // Configuration based on PRD specifications
    this.config = {
      terrainSize: 150,
      terrainSegments: 200,
      maxWaves: 30,
      breathingCycle: 7, // 7-second breathing cycle as per PRD
      elevation: {
        min: -8,
        max: 12,
        contourSpacing: 1.2
      },
      colors: {
        deepOcean: 0x0B1426,
        tealLuminescence: 0x0D4F5C,
        electricBlue: 0x1B4F72,
        cosmicBlack: 0x0B0B0F,
        bioluminescentWhite: 0xF8F9FA
      }
    }
    
    // Performance settings
    this.performanceSettings = null
  }

  async init() {
    // Get performance settings
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    
    // Adjust configuration based on performance
    this.adjustForPerformance()
    
    // Initialize scene components according to PRD phases
    await this.create2DTopographicalBase()
    this.createContourLines()
    this.setupSoundWaveSystem()
    this.createDigitalSun()
    this.createAtmosphereParticles()
    
    // Setup interactions
    this.setupMouseTracking()
    this.setupGestureRecognition()
    
    console.log('🏔️ OmniHarmonic Homepage scene initialized - Digital Ecological Harmony')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.config.terrainSegments = 64
        this.config.maxWaves = 20
        break
      case 'medium':
        this.config.terrainSegments = 96
        this.config.maxWaves = 35
        break
      case 'high':
        this.config.terrainSegments = 128
        this.config.maxWaves = 50
        break
    }
  }

  createTopography() {
    // Create terrain geometry
    const geometry = new THREE.PlaneGeometry(
      this.config.terrainSize,
      this.config.terrainSize,
      this.config.terrainSegments,
      this.config.terrainSegments
    )
    
    // Generate height map using noise function
    this.generateHeightMap(geometry)
    
    // Create material with custom shader for topographical lines
    const material = this.createTopographyMaterial()
    
    // Create mesh
    this.topographyMesh = new THREE.Mesh(geometry, material)
    this.topographyMesh.rotation.x = -Math.PI / 2 // Lay flat initially
    this.scene.add(this.topographyMesh)
    
    // Create wireframe overlay for contour lines
    this.createContourLines(geometry)
  }

  generateHeightMap(geometry) {
    const vertices = geometry.attributes.position.array
    const size = this.config.terrainSize
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      
      // Generate height using multiple octaves of noise
      let height = 0
      
      // Primary terrain features
      height += this.noise(x * 0.02, y * 0.02) * 8
      
      // Secondary details
      height += this.noise(x * 0.05, y * 0.05) * 4
      
      // Fine details
      height += this.noise(x * 0.1, y * 0.1) * 2
      
      // Sound wave influence areas
      height += Math.sin(x * 0.3) * Math.cos(y * 0.3) * 1.5
      
      // Set the z-coordinate (height)
      vertices[i + 2] = height * this.transformationProgress
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  }

  // Simple noise function (Perlin noise would be better)
  noise(x, y) {
    return Math.sin(x * 1.1) * Math.cos(y * 0.9) * 0.5 +
           Math.sin(x * 2.3) * Math.cos(y * 1.7) * 0.25 +
           Math.sin(x * 4.1) * Math.cos(y * 3.3) * 0.125
  }

  createTopographyMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        transformProgress: { value: 0 },
        mousePosition: { value: new THREE.Vector2() },
        primaryColor: { value: new THREE.Color(0x0D4F5C) },
        secondaryColor: { value: new THREE.Color(0x1B4F72) },
        backgroundShade: { value: new THREE.Color(0x0B1426) }
      },
      vertexShader: `
        uniform float time;
        uniform float transformProgress;
        uniform vec2 mousePosition;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vMouseDistance;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vElevation = position.z;
          
          // Calculate distance to mouse for interactive effects
          vec2 worldPos = vec2(position.x, position.y);
          vMouseDistance = distance(worldPos, mousePosition * 50.0);
          
          // Breathing animation
          vec3 pos = position;
          pos.z += sin(time * 0.5 + position.x * 0.1) * 0.2 * transformProgress;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float transformProgress;
        uniform vec3 primaryColor;
        uniform vec3 secondaryColor;
        uniform vec3 backgroundShade;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vMouseDistance;
        
        void main() {
          // Elevation-based coloring
          float elevationFactor = (vElevation + 10.0) / 20.0;
          vec3 color = mix(backgroundShade, primaryColor, elevationFactor);
          
          // Add contour lines
          float contour = sin(vElevation * 3.0) * 0.5 + 0.5;
          color = mix(color, secondaryColor, contour * 0.3);
          
          // Mouse proximity effect
          float mouseEffect = 1.0 - smoothstep(0.0, 20.0, vMouseDistance);
          color = mix(color, secondaryColor, mouseEffect * 0.4);
          
          // Breathing glow
          float breathe = sin(time * 0.8) * 0.1 + 0.9;
          color *= breathe;
          
          // Fade based on transformation progress
          float alpha = 0.8 + transformProgress * 0.2;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })
  }

  createContourLines(geometry) {
    // Create wireframe for contour lines
    const wireframeGeometry = new THREE.WireframeGeometry(geometry)
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x0D4F5C,
      transparent: true,
      opacity: 0.3
    })
    
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
    wireframe.rotation.x = -Math.PI / 2
    this.scene.add(wireframe)
    
    this.contourLines = wireframe
  }

  setupMouseTracking() {
    // Track mouse for terrain interaction
    document.addEventListener('mousemove', (event) => {
      this.onMouseMove(event)
    })
  }

  onMouseMove(event) {
    // Update mouse position
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Update shader uniform
    if (this.topographyMesh && this.topographyMesh.material.uniforms) {
      this.topographyMesh.material.uniforms.mousePosition.value.copy(this.mousePosition)
    }
    
    // Create sound waves occasionally
    this.createSoundWave()
    
    // Audio feedback
  }

  createSoundWave() {
    // Limit wave creation rate
    if (this.soundWaves.length >= this.config.maxWaves || Math.random() > 0.1) {
      return
    }
    
    // Create wave at mouse position
    const waveGeometry = new THREE.RingGeometry(0, 0.1, 16)
    const waveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 1.0 },
        color: { value: new THREE.Color(0x0D4F5C) }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(time * 3.0) * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          float dist = length(vUv - 0.5);
          float wave = sin(dist * 20.0 - time * 5.0) * 0.5 + 0.5;
          float alpha = (1.0 - dist * 2.0) * wave * opacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    const wave = new THREE.Mesh(waveGeometry, waveMaterial)
    
    // Position wave at mouse location in world space
    const worldPosition = new THREE.Vector3(
      this.mousePosition.x * 50,
      this.mousePosition.y * 50,
      this.transformationProgress * 5
    )
    wave.position.copy(worldPosition)
    
    this.scene.add(wave)
    
    // Add to waves array with metadata
    this.soundWaves.push({
      mesh: wave,
      material: waveMaterial,
      createdAt: performance.now(),
      maxAge: 2000 // 2 seconds
    })
  }

  animateTransformation(progress) {
    this.transformationProgress = progress
    
    // Update terrain height
    if (this.topographyMesh) {
      const geometry = this.topographyMesh.geometry
      this.generateHeightMap(geometry)
      
      // Update material uniform
      if (this.topographyMesh.material.uniforms) {
        this.topographyMesh.material.uniforms.transformProgress.value = progress
      }
      
      // Rotate terrain from flat to angled view
      const targetRotationX = -Math.PI / 2 + (progress * Math.PI / 6) // 30 degrees max
      this.topographyMesh.rotation.x = targetRotationX
      
      if (this.contourLines) {
        this.contourLines.rotation.x = targetRotationX
        this.contourLines.material.opacity = 0.3 + progress * 0.2
      }
    }
  }

  update(deltaTime) {
    const time = performance.now() * 0.001
    
    // Update material time uniform
    if (this.topographyMesh && this.topographyMesh.material.uniforms) {
      this.topographyMesh.material.uniforms.time.value = time
    }
    
    // Update sound waves
    this.updateSoundWaves(time)
    
    // Subtle terrain breathing
    this.updateTerrainBreathing(time)
  }

  updateSoundWaves(time) {
    const currentTime = performance.now()
    
    // Update and cleanup waves
    this.soundWaves = this.soundWaves.filter(waveData => {
      const age = currentTime - waveData.createdAt
      
      if (age > waveData.maxAge) {
        // Remove expired wave
        this.scene.remove(waveData.mesh)
        waveData.material.dispose()
        waveData.mesh.geometry.dispose()
        return false
      }
      
      // Update wave animation
      waveData.material.uniforms.time.value = age * 0.001
      waveData.material.uniforms.opacity.value = 1 - (age / waveData.maxAge)
      
      // Scale wave over time
      const scale = 1 + (age / waveData.maxAge) * 10
      waveData.mesh.scale.setScalar(scale)
      
      return true
    })
  }

  updateTerrainBreathing(time) {
    if (this.topographyMesh) {
      // Subtle vertical breathing motion
      const breathe = Math.sin(time * 0.5) * 0.5
      this.topographyMesh.position.y = breathe
    }
  }

  updateScroll(progress, direction) {
    // Update transformation based on scroll
    this.animateTransformation(progress)
  }

  onEnter() {
    console.log('🏔️ Entering homepage scene')
    
    // Start ambient audio for homepage
  }

  onExit() {
    console.log('🏔️ Exiting homepage scene')
  }

  onPerformanceChange(settings) {
    // Adjust quality based on performance
    this.performanceSettings = settings
    this.adjustForPerformance()
    
    // Recreate geometry with new settings if needed
    if (this.topographyMesh) {
      const newGeometry = new THREE.PlaneGeometry(
        this.config.terrainSize,
        this.config.terrainSize,
        this.config.terrainSegments,
        this.config.terrainSegments
      )
      
      this.generateHeightMap(newGeometry)
      
      // Dispose old geometry and update
      this.topographyMesh.geometry.dispose()
      this.topographyMesh.geometry = newGeometry
    }
  }

  onMotionPreference(reducedMotion) {
    // Disable animations if user prefers reduced motion
    if (reducedMotion) {
      this.soundWaves.forEach(waveData => {
        waveData.maxAge = 100 // Quickly fade out waves
      })
    }
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.4,
      directionalIntensity: 0.6,
      directionalPosition: [30, 40, 30]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 20, 50],
      target: [0, 0, 0],
      fov: 75
    }
  }

  getDescription() {
    return 'Interactive topographical landscape that transforms from 2D contour map to 3D terrain as you scroll'
  }

  getInteractiveElementCount() {
    return this.soundWaves.length + 1 // waves + terrain
  }

  getScene() {
    return this.scene
  }

  onResize(width, height) {
    // Handle any resize-specific logic
  }

  dispose() {
    // Clean up sound waves
    this.soundWaves.forEach(waveData => {
      this.scene.remove(waveData.mesh)
      waveData.material.dispose()
      waveData.mesh.geometry.dispose()
    })
    
    // Clean up main geometry and materials
    if (this.topographyMesh) {
      this.topographyMesh.geometry.dispose()
      this.topographyMesh.material.dispose()
    }
    
    if (this.contourLines) {
      this.contourLines.geometry.dispose()
      this.contourLines.material.dispose()
    }
    
    console.log('🏔️ Homepage scene disposed')
  }
}