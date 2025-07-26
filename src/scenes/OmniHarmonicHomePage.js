import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { DebugControls } from '../utils/DebugControls.js'

export class OmniHarmonicHomePage {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    
    // Core mesh components
    this.topographyMesh = null
    this.fatWireframeLines = null
    this.contourLinesMesh = null
    this.digitalSun = null
    this.atmosphereParticles = null
    
    // Interactive systems
    this.soundWaves = []
    this.mouseTrail = []
    this.transformationProgress = 0
    this.mousePosition = new THREE.Vector2()
    this.lastMousePosition = null
    this.lastMouseTime = null
    this.mouseAmplitude = 0
    this.time = 0
    
    // PRD-specified configuration with adaptive sizing
    this.config = {
      terrainSize: 400, // Much larger terrain for continuous variety
      terrainSegments: 150, // Denser for more detail
      breathingCycle: 7,
      maxSoundWaves: 25,
      mouseTrailLength: 30,
      elevation: {
        min: -15,
        max: 45,
        contourSpacing: 3.0
      },
      colors: {
        deepOcean: 0x0B1426,
        tealLuminescence: 0x0D4F5C,
        electricBlue: 0x1B4F72,
        cosmicBlack: 0x0B0B0F,
        bioluminescentWhite: 0xF8F9FA
      },
      phases: {
        flatTopo: { start: 0, end: 0.25 },
        lifting: { start: 0.25, end: 0.5 },
        oblique: { start: 0.5, end: 0.75 },
        full3D: { start: 0.75, end: 1.0 }
      }
    }
    
    this.performanceSettings = null
    this.debugControls = null
  }

  async init() {
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    this.adjustForPerformance()
    
    // Create the foundational 2D topographical map
    await this.create2DTopographicalBase()
    
    // Add elegant contour lines in dark teal
    this.createContourLines()
    
    // Add proper directional lighting for terrain
    this.setupTerrainLighting()
    
    // Create digital sun (initially hidden behind terrain)
    this.createDigitalSun()
    
    // Add atmospheric particle effects
    this.createAtmosphereParticles()
    
    // 3D logo moved to UI layer for proper front-layer positioning
    
    // Setup PRD-specified interactions
    this.setupMouseTracking()
    this.setupGestureRecognition()
    
    console.log('🌊 OmniHarmonic Homepage - Digital Ecological Harmony Initialized')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.config.terrainSegments = 40 // Less dense wireframe
        break
      case 'medium':
        this.config.terrainSegments = 60
        break
      case 'high':
        this.config.terrainSegments = 80 // Still reasonable density
        break
    }
  }

  async create2DTopographicalBase() {
    // Load the Flatirons STL file for real terrain data
    const loader = new STLLoader()
    
    try {
      console.log('🏔️ Loading Flatirons terrain STL file from /models/flatirons.stl...')
      const geometry = await this.loadSTLFile(loader, '/models/flatirons.stl')
      
      // Scale and position the terrain for our scene
      this.scaleAndPositionTerrain(geometry)
      
      // Use completely invisible material - wireframe only
      const material = this.createTopographicalMaterial()
      
      // Create the main topography mesh
      this.topographyMesh = new THREE.Mesh(geometry, material)
      this.topographyMesh.renderOrder = -1
      
      // Apply updated user-tested terrain rotation coordinates
      this.topographyMesh.rotation.x = -2.011 // Updated X rotation
      this.topographyMesh.rotation.y = 0.140  // Updated Y rotation  
      this.topographyMesh.rotation.z = 3.142  // Updated Z rotation
      
      this.scene.add(this.topographyMesh)
      console.log('🔄 STL terrain rotated with user-tested coordinates for mountain view')
      
      // Create wireframe overlay for the terrain visualization as child of terrain
      this.createWireframeOverlay(geometry)
      
      console.log('🔄 Wireframes created as children of terrain mesh for perfect alignment')
      
      // Add atmospheric fog for immersion
      this.setupAtmosphericFog()
      
      console.log('✅ Flatirons terrain loaded successfully')
      
      // Initialize debug controls for positioning
      this.debugControls = new DebugControls(
        this.sceneManager.camera,
        this.topographyMesh,
        this.fatWireframeLines
      )
      
    } catch (error) {
      console.error('❌ Failed to load STL terrain:', error)
      // Fallback to simple plane if STL fails
      this.createFallbackTerrain()
      
      // Initialize debug controls for fallback too
      this.debugControls = new DebugControls(
        this.sceneManager.camera,
        this.topographyMesh,
        this.fatWireframeLines
      )
    }
  }
  
  loadSTLFile(loader, path) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (geometry) => {
          console.log('🏔️ STL geometry loaded, vertices:', geometry.attributes.position.count)
          
          // Ensure geometry has normals for proper lighting
          if (!geometry.attributes.normal) {
            geometry.computeVertexNormals()
          }
          
          // Center the geometry for consistent positioning
          geometry.center()
          
          resolve(geometry)
        },
        (progress) => {
          if (progress.total > 0) {
            console.log('⏳ Loading progress:', (progress.loaded / progress.total * 100).toFixed(1) + '%')
          }
        },
        (error) => {
          console.error('❌ STL loading error:', error)
          console.error('  - Check that the file exists at:', path)
          console.error('  - Verify the STL file is not corrupted')
          reject(error)
        }
      )
    })
  }
  
  scaleAndPositionTerrain(geometry) {
    // Geometry is already centered, just need to scale and position for ground
    geometry.computeBoundingBox()
    const box = geometry.boundingBox
    
    console.log('📏 Centered STL bounds:', {
      x: (box.max.x - box.min.x).toFixed(2),
      y: (box.max.y - box.min.y).toFixed(2), 
      z: (box.max.z - box.min.z).toFixed(2),
      min: { x: box.min.x.toFixed(2), y: box.min.y.toFixed(2), z: box.min.z.toFixed(2) },
      max: { x: box.max.x.toFixed(2), y: box.max.y.toFixed(2), z: box.max.z.toFixed(2) }
    })
    
    // Scale based on largest dimension to fit in scene
    const maxDimension = Math.max(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    )
    
    // Scale to larger size to fill field of view and hide model edges
    const targetSize = 800 // Much larger to fill view and create immersion
    const scale = targetSize / maxDimension
    
    // Apply uniform scaling to preserve terrain shape
    geometry.scale(scale, scale, scale)
    
    // Recalculate bounds after scaling
    geometry.computeBoundingBox()
    const scaledBox = geometry.boundingBox
    
    // Move terrain so its bottom is at Y=0 (ground level)
    const groundOffset = -scaledBox.min.y
    geometry.translate(0, groundOffset, 0)
    
    // Final bounds check
    geometry.computeBoundingBox()
    const finalBox = geometry.boundingBox
    
    console.log('✅ STL terrain processed:')
    console.log('  - Scale factor:', scale.toFixed(3))
    console.log('  - Final dimensions:', {
      width: (finalBox.max.x - finalBox.min.x).toFixed(1),
      height: (finalBox.max.y - finalBox.min.y).toFixed(1),
      depth: (finalBox.max.z - finalBox.min.z).toFixed(1)
    })
    console.log('  - Ground offset applied:', groundOffset.toFixed(1))
  }
  
  setupAtmosphericFog() {
    // Add fog for atmospheric depth and immersion - adjusted for larger terrain
    this.scene.fog = new THREE.Fog(
      0x0B1426, // Deep ocean color from config
      200,  // Start distance - further out for larger terrain
      1200  // End distance - much further for larger scale
    )
    
    console.log('🌫️ Atmospheric fog added for larger terrain immersion')
  }
  
  createFallbackTerrain() {
    console.log('🔄 Creating fallback flat terrain')
    const geometry = new THREE.PlaneGeometry(800, 800, 50, 50) // Match larger STL scale
    geometry.rotateX(-Math.PI / 2)
    
    // Create proper material following Three.js conventions
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x0D4F5C, // Teal color from config
      shininess: 10,
      transparent: true,
      opacity: 0.1, // Very low opacity so wireframe shows
      side: THREE.DoubleSide
    })
    
    this.topographyMesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.topographyMesh)
    
    this.createWireframeOverlay(geometry)
    this.setupAtmosphericFog()
  }

  generateTopographicalHeightMap(geometry) {
    const vertices = geometry.attributes.position.array
    const { min, max } = this.config.elevation
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      
      // Generate valley surrounded by mountains terrain
      let height = 0
      
      // Create the main valley/mountain structure
      const valleyMountains = this.createValleySurroundedByMountains(x, y)
      height += valleyMountains // Already properly scaled in the method
      
      // Minimal additional noise to not interfere with mountain formation
      const surfaceDetails = this.fbmNoise(x * 0.02, y * 0.02, 200) * 1
      height += surfaceDetails
      
      // Clamp to reasonable range
      height = Math.max(min, Math.min(max, height))
      
      // Store the base height for mountain growing animation
      const baseHeight = height
      
      // Apply transformation progress for the growing effect - start with 50% visible terrain
      const minVisibility = 0.5 // Always show at least 50% of terrain height
      const growthProgress = minVisibility + (this.transformationProgress * (1.0 - minVisibility))
      vertices[i + 2] = baseHeight * growthProgress
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  }

  createValleySurroundedByMountains(x, y) {
    // Advanced procedural terrain generation inspired by reference code
    // Dynamic noiseIterations matching the example's range
    const noiseIterations = Math.max(1, Math.floor(this.transformationProgress * 6)) // 1-6 iterations like example
    const centerX = 0
    const centerY = 0
    
    // Terrain generation using multiple noise octaves like reference
    let elevation = 0
    
    // Base terrain parameters for varied landscape like screenshot
    const positionFrequency = 0.08 // Lower for broader features
    const warpFrequency = 4 // Moderate for organic variation
    const warpStrength = 2 // Stronger for more variety
    const strength = 15 // Higher for more dramatic variation
    
    // Domain warping exactly like the Three.js example
    const warpedX = x + this.fbmNoise(x * positionFrequency * warpFrequency, y * positionFrequency * warpFrequency, 300) * warpStrength
    const warpedY = y + this.fbmNoise(x * positionFrequency * warpFrequency, y * positionFrequency * warpFrequency, 400) * warpStrength
    
    // Multi-scale noise for varied terrain features like screenshot
    for (let i = 1; i <= noiseIterations; i++) {
      const frequency = positionFrequency * Math.pow(2, i - 1)
      const amplitude = 1.0 / Math.pow(2, i - 1)
      
      const noiseInput = this.fbmNoise(
        warpedX * frequency + i * 987,
        warpedY * frequency + i * 987,
        i * 987
      )
      elevation += noiseInput * amplitude
    }
    
    // Add multiple landscape features for variety like screenshot
    
    // Large-scale valleys and ridges
    const valleyNoise = this.fbmNoise(x * 0.02, y * 0.02, 1000) * 8
    elevation += valleyNoise
    
    // Medium-scale hills and depressions  
    const hillNoise = this.fbmNoise(x * 0.05, y * 0.05, 2000) * 4
    elevation += hillNoise
    
    // Small-scale surface details
    const detailNoise = this.fbmNoise(x * 0.15, y * 0.15, 3000) * 1.5
    elevation += detailNoise
    
    // Create natural water bodies (low areas)
    const waterNoise = this.fbmNoise(x * 0.03, y * 0.03, 4000)
    if (waterNoise < -0.3) {
      elevation = Math.min(elevation, -8 + waterNoise * 5) // Natural lake beds
    }
    
    // Create highland plateaus
    const plateauNoise = this.fbmNoise(x * 0.025, y * 0.025, 5000)
    if (plateauNoise > 0.4) {
      elevation += (plateauNoise - 0.4) * 12 // Elevated plateaus
    }
    
    // Apply power function and strength exactly like example: elevation.assign( elevation.abs().pow( 2 ).mul( elevationSign ).mul( strength ) )
    const elevationSign = elevation >= 0 ? 1 : -1
    elevation = Math.pow(Math.abs(elevation), 2) * elevationSign * strength
    
    // Create mountain ranges using radial distance (only when sufficient iterations)
    if (noiseIterations >= 2) {
      const distanceFromCenter = Math.sqrt(x * x + y * y)
      const angle = Math.atan2(y, x)
      
      // Add mountain peaks in ring formation
      if (distanceFromCenter > 20 && distanceFromCenter < 80) {
        const mountainMask = Math.sin(angle * 6) * 0.5 + 0.5 // 6 mountain peaks
        const ringFactor = 1.0 - Math.abs(distanceFromCenter - 50) / 30 // Ring of mountains
        elevation += mountainMask * ringFactor * 8.0
      }
      
      // Create mountain clusters - some areas have mountains, others are valleys
      const clusterNoise = this.fbmNoise(x * 0.003, y * 0.003, 999) // Very low frequency for clusters
      if (clusterNoise > 0.0) {
        elevation = Math.max(15.0, elevation + 20.0) // Mountain areas - more visible
      } else {
        elevation = Math.max(-8.0, elevation * 0.4) // Valley areas
      }
    } else if (noiseIterations <= 4) {
      // Moderate elevation with valley consideration
      const clusterNoise = this.fbmNoise(x * 0.003, y * 0.003, 999)
      if (clusterNoise > 0.0) {
        elevation = Math.max(6.0, elevation + 8.0) // Moderate mountains
      } else {
        elevation = Math.max(-3.0, elevation * 0.5) // Gentle valleys
      }
    }
    
    // Clamp to natural elevation range for varied landscape
    const finalElevation = Math.max(-15, Math.min(45, elevation))
    if (Math.random() < 0.001) console.log(`🏔️ Varied elevation: ${finalElevation.toFixed(1)}`)
    return finalElevation
  }

  // Advanced ridge noise for mountain generation
  createRidgeNoise(x, y, seed) {
    let noise = this.fbmNoise(x, y, seed)
    return Math.abs(noise * 2 - 1) // Create sharp ridges
  }

  // Erosion pattern simulation for realistic mountain wear
  createErosionPattern(x, y) {
    const erosionScale = 0.02
    const erosionSeed = 2000
    
    // Simulate water flow patterns
    const flowNoise1 = this.fbmNoise(x * erosionScale, y * erosionScale, erosionSeed)
    const flowNoise2 = this.fbmNoise(x * erosionScale * 2, y * erosionScale * 2, erosionSeed + 100)
    
    // Create valley-like erosion channels
    const erosionStrength = Math.abs(flowNoise1) + Math.abs(flowNoise2 * 0.5)
    return Math.pow(erosionStrength, 1.5)
  }

  // Smoothstep interpolation for natural transitions
  smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
  }

  // Improved fractional Brownian motion noise
  fbmNoise(x, y, seed) {
    let value = 0
    let amplitude = 0.5
    let frequency = 1
    
    for (let i = 0; i < 6; i++) {
      value += amplitude * this.simplexNoise(x * frequency + seed, y * frequency + seed)
      amplitude *= 0.5
      frequency *= 2.1
    }
    
    return value
  }

  // Simplex-like noise approximation
  simplexNoise(x, y) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    
    x -= Math.floor(x)
    y -= Math.floor(y)
    
    const u = this.fade(x)
    const v = this.fade(y)
    
    const A = this.perm[X] + Y
    const B = this.perm[X + 1] + Y
    
    return this.lerp(v, 
      this.lerp(u, this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y)),
      this.lerp(u, this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1))
    )
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
  lerp(t, a, b) { return a + t * (b - a) }
  grad(hash, x, y) {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  get perm() {
    if (!this._perm) {
      this._perm = new Array(512)
      const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]
      for (let i = 0; i < 256; i++) {
        this._perm[i] = this._perm[i + 256] = permutation[i]
      }
    }
    return this._perm
  }

  createWireframeOverlay(geometry) {
    // Create single clean wireframe with teal accents
    this.createFatWireframeLines(geometry)
    
    // Add subtle light ray animation to wireframe
    this.wireframeAnimation = {
      time: 0,
      originalColor: 0x0D4F5C, // Teal color
      pulseIntensity: 0,
      lightRayIntensity: 0
    }
  }
  
  createFatWireframeLines(geometry) {
    // NEW APPROACH: Clone the exact same geometry and apply wireframe material
    const clonedGeometry = geometry.clone()
    
    // Create darker wireframe material with teal accents for elegant terrain visualization
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0D4F5C, // Dark teal for subtle, elegant appearance
      transparent: true,
      opacity: 0.4, // Lower opacity for darker, more subtle wireframe
      wireframe: true, // Use wireframe mode on the mesh itself
      depthTest: true,
      depthWrite: false,
      fog: false // Don't let fog obscure terrain detail
    })
    
    // Create mesh with exactly the same geometry as terrain
    this.fatWireframeLines = new THREE.Mesh(clonedGeometry, wireframeMaterial)
    
    // Apply IDENTICAL transformation to guarantee perfect alignment
    this.fatWireframeLines.rotation.copy(this.topographyMesh.rotation)
    this.fatWireframeLines.position.copy(this.topographyMesh.position)
    this.fatWireframeLines.scale.copy(this.topographyMesh.scale)
    
    // Small Y offset to avoid z-fighting
    this.fatWireframeLines.position.y += 0.5
    
    this.fatWireframeLines.renderOrder = 10 // Render above terrain
    
    // Add directly to scene with identical transforms
    this.scene.add(this.fatWireframeLines)
    
    console.log('🔷 NEW APPROACH: Wireframe mesh with cloned geometry and identical transforms')
    console.log('  - Wireframe positioned with Y offset:', this.fatWireframeLines.position.y)
  }
  

  createTopographicalMaterial() {
    // Restore minimal dark themed shading for terrain depth
    return new THREE.MeshPhongMaterial({
      color: 0x0B1426, // Deep ocean color from config
      transparent: true,
      opacity: 0.3,
      shininess: 10,
      specular: 0x0D4F5C, // Teal highlights
      flatShading: false
    })
  }
  
  setupTerrainLighting() {
    // Add directional light for terrain illumination
    this.terrainLight = new THREE.DirectionalLight(0xFFFFFF, 1.5)
    this.terrainLight.position.set(0, 50, 50)
    this.terrainLight.target.position.set(0, 0, 0)
    this.terrainLight.castShadow = false
    this.scene.add(this.terrainLight)
    this.scene.add(this.terrainLight.target)
    
    // Add ambient light for overall illumination
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(this.ambientLight)
    
    console.log('🌞 Terrain lighting setup complete')
  }
  

  createContourLines() {
    // Disable complex contour lines that were causing ghost patterns
    // The wireframe and minimal terrain shading provide sufficient detail
    console.log('🔇 Complex contour lines disabled to prevent ghost patterns')
    this.contourLinesMesh = null
  }

  calculateAdaptiveTerrainSize() {
    // Calculate terrain size to completely fill screen viewport with extra margin
    const aspect = window.innerWidth / window.innerHeight
    const baseSize = 400 // Much larger base size to ensure complete coverage
    
    // Scale terrain based on aspect ratio with generous margins
    if (aspect > 2.0) {
      return baseSize * 2.2 // Ultra-wide screens need much more coverage
    } else if (aspect > 1.8) {
      return baseSize * 2.0 // Wide screens
    } else if (aspect > 1.5) {
      return baseSize * 1.8 // Normal wide screens
    } else if (aspect > 1.2) {
      return baseSize * 1.5 // Standard screens
    } else {
      return baseSize * 1.3 // Square/tall screens
    }
  }
  
  setupSoundWaveSystem() {
    // Sound wave system removed to eliminate raindrop effects
    console.log('🔇 Sound wave system disabled')
  }

  createSoundWaveRipple(mouseX, mouseY) {
    // Sound wave ripple system disabled
    console.log('🔇 Sound wave ripple disabled')
  }

  createDigitalSun() {
    // Create the digital sun that emerges from behind the mountains
    const sunGeometry = new THREE.SphereGeometry(12, 32, 32)
    const sunMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunProgress: { value: 0 },
        sunColor: { value: new THREE.Color(0xFFEE00) }, // More yellow sun
        coronaColor: { value: new THREE.Color(this.config.colors.electricBlue) }
      },
      vertexShader: `
        uniform float time;
        uniform float sunProgress;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vIntensity;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          // Calculate intensity based on viewing angle
          vIntensity = pow(dot(normal, vec3(0.0, 0.0, 1.0)), 2.0);
          
          vec3 pos = position;
          // Subtle pulsing
          pos += normal * sin(time * 1.5) * 0.2 * sunProgress;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float sunProgress;
        uniform vec3 sunColor;
        uniform vec3 coronaColor;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vIntensity;
        
        void main() {
          // Create radial gradient from center
          float distanceFromCenter = length(vPosition.xy);
          float radialFade = 1.0 - smoothstep(0.3, 1.0, distanceFromCenter);
          
          // Core sun color
          vec3 color = sunColor * radialFade;
          
          // Add corona effect
          float corona = pow(vIntensity, 0.5);
          color = mix(color, coronaColor, corona * 0.3);
          
          // Pulsing intensity
          float pulse = sin(time * 2.0) * 0.2 + 0.8;
          color *= pulse;
          
          // Bright center with atmospheric glow
          float centerGlow = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
          color += sunColor * centerGlow * 2.0;
          
          float alpha = sunProgress * (0.8 + radialFade * 0.4);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })

    this.digitalSun = new THREE.Mesh(sunGeometry, sunMaterial)
    // Position behind the central mountain peak for dramatic sunrise
    this.digitalSun.position.set(0, -20, -60) // Start lower and further behind mountains
    
    this.scene.add(this.digitalSun)
    
    // Add directional light to simulate realistic sun lighting
    this.sunLight = new THREE.DirectionalLight(0xFFD700, 0) // Warmer gold color
    this.sunLight.position.set(0, -20, -60) // Match sun position initially
    this.sunLight.target.position.set(0, 0, 0)
    this.sunLight.castShadow = true
    this.sunLight.shadow.mapSize.width = 4096 // Higher quality shadows
    this.sunLight.shadow.mapSize.height = 4096
    this.sunLight.shadow.camera.near = 10
    this.sunLight.shadow.camera.far = 300
    this.sunLight.shadow.camera.left = -150
    this.sunLight.shadow.camera.right = 150
    this.sunLight.shadow.camera.top = 150
    this.sunLight.shadow.camera.bottom = -150
    this.sunLight.shadow.bias = -0.0001 // Reduce shadow acne
    
    this.scene.add(this.sunLight)
    this.scene.add(this.sunLight.target)
    
    // Add atmospheric halo around sun for better visibility
    const haloGeometry = new THREE.SphereGeometry(18, 32, 32)
    const haloMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunProgress: { value: 0 },
        haloColor: { value: new THREE.Color(0xFFAA00) }
      },
      vertexShader: `
        uniform float time;
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          vec3 pos = position;
          pos += normal * sin(time * 0.8) * 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float sunProgress;
        uniform vec3 haloColor;
        varying vec3 vPosition;
        
        void main() {
          float dist = length(vPosition) / 18.0;
          float haloIntensity = pow(1.0 - dist, 2.0) * 0.3;
          float alpha = haloIntensity * sunProgress * 0.6;
          gl_FragColor = vec4(haloColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    this.sunHalo = new THREE.Mesh(haloGeometry, haloMaterial)
    this.sunHalo.position.copy(this.digitalSun.position)
    this.scene.add(this.sunHalo)
  }

  createAtmosphereParticles() {
    // Create atmospheric particle effects for full 3D phase
    const particleCount = 800
    const particleGeometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300
      positions[i * 3 + 1] = Math.random() * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300
      
      const color = new THREE.Color()
      const hue = 0.5 + Math.random() * 0.1 // Blue-green range
      color.setHSL(hue, 0.7, 0.3 + Math.random() * 0.4)
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      sizes[i] = Math.random() * 2 + 0.5
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        atmosphereProgress: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        uniform float atmosphereProgress;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          vAlpha = atmosphereProgress;
          
          vec3 pos = position;
          pos.y += sin(time * 0.5 + position.x * 0.01) * 3.0;
          pos.x += cos(time * 0.3 + position.z * 0.01) * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * atmosphereProgress;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          float dist = length(gl_PointCoord - 0.5);
          float alpha = (1.0 - dist * 2.0) * 0.6 * vAlpha;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    
    this.atmosphereParticles = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.atmosphereParticles)
  }

  // 3D logo method removed - moved to UI layer for proper positioning

  setupMouseTracking() {
    document.addEventListener('mousemove', (event) => {
      this.onMouseMove(event)
    })
    
    document.addEventListener('click', (event) => {
      this.onMouseClick(event)
    })
  }

  setupGestureRecognition() {
    // Touch gesture support for mobile devices
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0]
        this.onMouseMove(touch)
      }
    })
  }

  onMouseMove(event) {
    // Update normalized mouse position (removed raindrop effects)
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Terrain now uses simple invisible material - no uniforms to update
    
    // Mouse interaction removed - using simple material for wireframe
    
    // Contour lines disabled - no uniforms to update
  }

  onMouseClick(event) {
    // Create larger sound wave on click
    // Raindrop effects removed
    
    // Audio feedback for click
  }

  animateTransformation(progress) {
    this.transformationProgress = progress
    const { phases } = this.config
    
    // Phase 1 (0-25%): Flat 2D topographical map
    if (progress <= phases.flatTopo.end) {
      const phaseProgress = progress / phases.flatTopo.end
      this.animatePhase1(phaseProgress)
    }
    
    // Phase 2 (25-50%): Contour lines lift and extrude
    else if (progress <= phases.lifting.end) {
      const phaseProgress = (progress - phases.lifting.start) / (phases.lifting.end - phases.lifting.start)
      this.animatePhase2(phaseProgress)
    }
    
    // Phase 3 (50-75%): Camera shifts to oblique, sun emerges
    else if (progress <= phases.oblique.end) {
      const phaseProgress = (progress - phases.oblique.start) / (phases.oblique.end - phases.oblique.start)
      this.animatePhase3(phaseProgress)
    }
    
    // Phase 4 (75-100%): Full 3D with particles and atmosphere
    else {
      const phaseProgress = (progress - phases.full3D.start) / (phases.full3D.end - phases.full3D.start)
      this.animatePhase4(phaseProgress)
    }
  }

  animateTransition(type) {
    // Handle transition animations (required by UnifiedScene)
    console.log(`🌊 Topographical scene transition: ${type}`)
    
    if (type === 'enter') {
      // Update terrain geometry when entering scene
      if (this.topographyMesh) {
        this.generateTopographicalHeightMap(this.topographyMesh.geometry)
      }
    } else if (type === 'exit') {
      // Prepare for morphing to next scene
      console.log('🌊 Preparing topographical scene for transition to next phase')
    }
  }

  animatePhase1(progress) {
    // Keep terrain flat, fade in contours
    this.transformationProgress = progress * 0.3
    
    // Update terrain geometry with new transform progress
    if (this.topographyMesh) {
      this.generateTopographicalHeightMap(this.topographyMesh.geometry)
    }
    
    // Update contour lines if they exist
    // Contour lines disabled
  }

  animatePhase2(progress) {
    // Begin lifting terrain into 3D with mountain size increase
    this.transformationProgress = 0.3 + progress * 0.4
    
    if (this.topographyMesh) {
      // Increase mountain scale as we scroll (mountains get bigger)
      const mountainScale = 1.0 + progress * 1.5 // Scale up to 2.5x original size
      this.topographyMesh.scale.setScalar(mountainScale)
      
      // Regenerate height map with increasing elevation
      this.generateTopographicalHeightMap(this.topographyMesh.geometry)
    }
    
    // Wireframe automatically follows terrain transformations with cloned geometry approach
    if (this.fatWireframeLines) {
      // No manual scaling needed - wireframe uses identical transforms from terrain
    }
    
    if (this.contourLinesMesh) {
      const mountainScale = 1.0 + progress * 1.5
      this.contourLinesMesh.scale.setScalar(mountainScale)
    }
  }

  animatePhase4(progress) {
    // Full 3D ecosystem activation with maximum mountain scale
    if (this.topographyMesh) {
      // Terrain now uses invisible material - no uniforms to update
      
      // Final mountain scaling - massive dramatic mountains
      const mountainScale = 3.5 + progress * 0.5 // Final scale up to 4x
      this.topographyMesh.scale.setScalar(mountainScale)
      
      // Final rotation to full oblique view
      const rotation = -Math.PI / 2 + (Math.PI / 12) + progress * (Math.PI / 16)
      this.topographyMesh.rotation.x = rotation
      
      if (this.fatWireframeLines) {
        this.fatWireframeLines.material.opacity = 0.3 // Keep dark teal wireframe visible at lower opacity
      }
      
      // Wireframes automatically follow terrain since they are children
      
      if (this.contourLinesMesh) {
        this.contourLinesMesh.scale.setScalar(mountainScale)
        this.contourLinesMesh.rotation.x = rotation
      }
    }
    
    // Activate atmospheric particles
    if (this.atmosphereParticles) {
      this.atmosphereParticles.material.uniforms.atmosphereProgress.value = progress
    }
    
    // Full sun presence - completely overhead with maximum atmospheric effect
    if (this.digitalSun) {
      this.digitalSun.material.uniforms.sunProgress.value = 1.0
      
      // Final sun position - high overhead like noon sun
      this.digitalSun.position.y = 80
      this.digitalSun.position.z = 10
    }
    
    if (this.sunHalo) {
      this.sunHalo.material.uniforms.sunProgress.value = 1.0
      this.sunHalo.position.copy(this.digitalSun.position)
    }
    
    if (this.sunLight) {
      this.sunLight.intensity = 2.0 // Maximum brightness for noon sun
      this.sunLight.position.y = 100 // High overhead position
      this.sunLight.position.z = 10
    }
  }

  animatePhase3(progress) {
    // Continue terrain transformation and bring in sun with mountain scaling
    if (this.topographyMesh) {
      // Terrain now uses invisible material - no uniforms to update
      
      // Continue mountain size increase
      const mountainScale = 2.5 + progress * 1.0 // Scale from 2.5x to 3.5x
      this.topographyMesh.scale.setScalar(mountainScale)
      
      // Slight rotation toward oblique view
      const rotation = -Math.PI / 2 + progress * (Math.PI / 12)
      this.topographyMesh.rotation.x = rotation
      
      if (this.contourLinesMesh) {
        this.contourLinesMesh.scale.setScalar(mountainScale)
        this.contourLinesMesh.rotation.x = rotation
      }
    }
    
    // Digital sun emergence - comprehensive sunrise animation
    if (this.digitalSun) {
      this.digitalSun.material.uniforms.sunProgress.value = progress
      
      // Complex sun movement: behind mountains → above mountains → overhead
      if (progress < 0.3) {
        // Phase 1: Rising behind mountains (barely visible)
        const phase1Progress = progress / 0.3
        this.digitalSun.position.y = -20 + phase1Progress * 15 // Rise slowly behind mountains
        this.digitalSun.position.z = -60 // Stay behind mountains
      } else if (progress < 0.7) {
        // Phase 2: Emerging from behind mountains
        const phase2Progress = (progress - 0.3) / 0.4
        const emergenceArc = Math.sin(phase2Progress * Math.PI * 0.5)
        this.digitalSun.position.y = -5 + phase2Progress * 35 + emergenceArc * 15
        this.digitalSun.position.z = -60 + phase2Progress * 40 // Move forward as it clears mountains
      } else {
        // Phase 3: Moving overhead
        const phase3Progress = (progress - 0.7) / 0.3
        const overheadArc = Math.sin(phase3Progress * Math.PI * 0.5)
        this.digitalSun.position.y = 30 + phase3Progress * 50 + overheadArc * 20
        this.digitalSun.position.z = -20 + phase3Progress * 30 // Continue moving forward and up
      }
      
      // Update sun halo position and intensity
      if (this.sunHalo) {
        this.sunHalo.position.copy(this.digitalSun.position)
        this.sunHalo.material.uniforms.sunProgress.value = progress
        this.sunHalo.material.uniforms.time.value = this.time
      }
      
      // Enhanced sun lighting that follows the sun's path
      if (this.sunLight) {
        // Light intensity increases as sun becomes more visible
        this.sunLight.intensity = Math.min(progress * 2.0, 1.8)
        
        // Light position follows sun but offset for better terrain lighting
        this.sunLight.position.copy(this.digitalSun.position)
        this.sunLight.position.y += 20 // Offset above sun for better shadows
        
        // Color temperature changes with sun height
        const warmth = Math.min(progress * 0.4, 0.3)
        this.sunLight.color.setRGB(1.0, 0.95 - warmth, 0.7 - warmth)
      }
    }
  }

  animatePhase3(progress) {
    // Continue mountain growth and bring in sun
    if (this.topographyMesh) {
      // Mountains continue growing to full height
      const heightMultiplier = 1.0 + progress * 0.5 // Grow beyond base height
      
      // Update terrain with new height
      this.transformationProgress = heightMultiplier
      this.generateTopographicalHeightMap(this.topographyMesh.geometry)
      
      // Slight rotation toward oblique view
      const rotation = -Math.PI / 2 + progress * (Math.PI / 12)
      this.topographyMesh.rotation.x = rotation
    }
    
    if (this.fatWireframeLines) {
      // Wireframe automatically synchronized via cloned geometry approach
      // Adjust teal wireframe opacity for phase transition
      this.fatWireframeLines.material.opacity = 0.4 - progress * 0.1 // Subtle fade with dark teal
    }
    
    // Wireframes automatically follow terrain rotation since they are children
    
    if (this.contourLinesMesh) {
      this.contourLinesMesh.rotation.x = -Math.PI / 2 + progress * (Math.PI / 12)
    }
    
    // Digital sun emergence - comprehensive sunrise animation
    if (this.digitalSun) {
      this.digitalSun.material.uniforms.sunProgress.value = progress
      
      // Complex sun movement: behind mountains → above mountains → overhead
      if (progress < 0.3) {
        // Phase 1: Rising behind mountains (barely visible)
        const phase1Progress = progress / 0.3
        this.digitalSun.position.y = -20 + phase1Progress * 15
        this.digitalSun.position.z = -60
      } else if (progress < 0.7) {
        // Phase 2: Emerging from behind mountains
        const phase2Progress = (progress - 0.3) / 0.4
        const emergenceArc = Math.sin(phase2Progress * Math.PI * 0.5)
        this.digitalSun.position.y = -5 + phase2Progress * 35 + emergenceArc * 15
        this.digitalSun.position.z = -60 + phase2Progress * 40
      } else {
        // Phase 3: Moving overhead
        const phase3Progress = (progress - 0.7) / 0.3
        const overheadArc = Math.sin(phase3Progress * Math.PI * 0.5)
        this.digitalSun.position.y = 30 + phase3Progress * 50 + overheadArc * 20
        this.digitalSun.position.z = -20 + phase3Progress * 30
      }
      
      // Update sun halo and lighting
      if (this.sunHalo) {
        this.sunHalo.position.copy(this.digitalSun.position)
        this.sunHalo.material.uniforms.sunProgress.value = progress
        this.sunHalo.material.uniforms.time.value = this.time
      }
      
      if (this.sunLight) {
        this.sunLight.intensity = Math.min(progress * 2.0, 1.8)
        this.sunLight.position.copy(this.digitalSun.position)
        this.sunLight.position.y += 20
        this.sunLight.castShadow = true // Enable shadows
        
        const warmth = Math.min(progress * 0.4, 0.3)
        this.sunLight.color.setRGB(1.0, 0.95 - warmth, 0.7 - warmth)
      }
    }
  }

  animatePhase4(progress) {
    // Full 3D ecosystem activation with final mountain state
    if (this.topographyMesh) {
      // Final mountain height
      const heightMultiplier = 1.5 + progress * 0.5 // Maximum mountain height
      
      this.transformationProgress = heightMultiplier
      this.generateTopographicalHeightMap(this.topographyMesh.geometry)
      
      // Final rotation to full oblique view
      const rotation = -Math.PI / 2 + (Math.PI / 12) + progress * (Math.PI / 16)
      this.topographyMesh.rotation.x = rotation
    }
    
    if (this.fatWireframeLines) {
      // Wireframe automatically synchronized with final terrain state via cloned geometry
      // Set final teal wireframe opacity for full 3D view
      this.fatWireframeLines.material.opacity = 0.35 // Subtle dark teal for elegant final state
    }
    
    // Wireframes automatically follow terrain rotation since they are children
    
    if (this.contourLinesMesh) {
      const rotation = -Math.PI / 2 + (Math.PI / 12) + progress * (Math.PI / 16)
      this.contourLinesMesh.rotation.x = rotation
    }
    
    // Activate atmospheric particles
    if (this.atmosphereParticles) {
      this.atmosphereParticles.material.uniforms.atmosphereProgress.value = progress
    }
    
    // Full sun presence - completely overhead with maximum atmospheric effect
    if (this.digitalSun) {
      this.digitalSun.material.uniforms.sunProgress.value = 1.0
      
      // Final sun position - high overhead like noon sun
      this.digitalSun.position.y = 80
      this.digitalSun.position.z = 10
    }
    
    if (this.sunHalo) {
      this.sunHalo.material.uniforms.sunProgress.value = 1.0
      this.sunHalo.position.copy(this.digitalSun.position)
    }
    
    if (this.sunLight) {
      this.sunLight.intensity = 2.0 // Maximum brightness for noon sun
      this.sunLight.position.y = 100 // High overhead position
      this.sunLight.position.z = 10
    }
  }

  update(deltaTime) {
    this.time = performance.now() * 0.001
    
    // 3D logo moved to UI layer
    
    // Update debug controls
    if (this.debugControls) {
      this.debugControls.update()
    }
    
    // Update breathing cycle (7-second cycle as per PRD)
    const breathingPhase = Math.sin(this.time * (2 * Math.PI / this.config.breathingCycle))
    
    // Terrain now uses simple invisible material - no time uniforms to update
    
    // Update dark teal wireframe with subtle breathing effect
    if (this.fatWireframeLines?.material) {
      this.wireframeAnimation.time += deltaTime
      
      // Subtle breathing opacity effect for the dark teal wireframe
      const breathingIntensity = Math.sin(this.wireframeAnimation.time * 0.3) * 0.05 + 0.95
      
      // Keep the dark teal color consistent with subtle breathing
      const baseColor = new THREE.Color(this.wireframeAnimation.originalColor) // Dark teal
      this.fatWireframeLines.material.color.copy(baseColor)
      
      // Apply gentle breathing to the base opacity without dramatic changes
      const baseOpacity = 0.4 // Base dark teal opacity
      this.fatWireframeLines.material.opacity = baseOpacity * breathingIntensity
    }
    
    // Contour lines disabled
    
    if (this.digitalSun?.material.uniforms) {
      this.digitalSun.material.uniforms.time.value = this.time
    }
    
    if (this.sunHalo?.material.uniforms) {
      this.sunHalo.material.uniforms.time.value = this.time
    }
    
    if (this.atmosphereParticles?.material.uniforms) {
      this.atmosphereParticles.material.uniforms.time.value = this.time
    }
    
    // Sound waves disabled
    
    // Subtle terrain breathing
    if (this.topographyMesh) {
      this.topographyMesh.position.y = breathingPhase * 0.3
    }
  }

  updateSoundWaves() {
    // Sound waves disabled
  }

  updateScroll(progress, direction) {
    this.animateTransformation(progress)
  }

  onEnter() {
    console.log('🌊 Entering OmniHarmonic topographical landscape')
    
  }

  onExit() {
    console.log('🌊 Exiting OmniHarmonic topographical landscape')
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.3,
      directionalIntensity: 0.8,
      directionalPosition: [40, 60, 40]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 30, 60],
      target: [0, 0, 0],
      fov: 75
    }
  }

  getDescription() {
    return 'Interactive topographical sound wave ecosystem transforming from 2D contours to living 3D landscape'
  }

  getScene() {
    return this.scene
  }

  onResize(width, height) {
    // Handle resize-specific logic if needed
  }

  animateTransformation(progress) {
    // STL terrain doesn't need transformation - it's already complete
    this.transformationProgress = progress
    console.log(`🏔️ Real terrain: ${(progress*100).toFixed(1)}% - Flatirons landscape`)
    
    // Optionally animate fog density or wireframe opacity based on progress
    if (this.scene.fog) {
      this.scene.fog.density = 0.001 + (progress * 0.002) // Subtle fog animation
    }
    
    if (this.fatWireframeLines) {
      this.fatWireframeLines.material.opacity = 0.3 + (progress * 0.1) // Subtle fade in for dark teal wireframe
    }
  }

  dispose() {
    // Clean up debug controls
    if (this.debugControls) {
      this.debugControls.dispose()
    }
    
    // Clean up all geometries and materials
    if (this.topographyMesh) {
      this.topographyMesh.geometry.dispose()
      this.topographyMesh.material.dispose()
    }
    
    if (this.fatWireframeLines) {
      this.fatWireframeLines.geometry.dispose()
      this.fatWireframeLines.material.dispose()
    }
    
    // Contour lines disabled - nothing to dispose
    
    if (this.digitalSun) {
      this.digitalSun.geometry.dispose()
      this.digitalSun.material.dispose()
    }
    
    if (this.atmosphereParticles) {
      this.atmosphereParticles.geometry.dispose()
      this.atmosphereParticles.material.dispose()
    }
    
    // Sound waves disabled
    
    // 3D logo moved to UI layer
    
    console.log('🌊 OmniHarmonic Homepage scene disposed')
  }
}