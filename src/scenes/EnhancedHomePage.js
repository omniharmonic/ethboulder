import * as THREE from 'three'

export class EnhancedHomePage {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    this.wireframeMesh = null
    this.flowingLines = []
    this.particleSystem = null
    this.transformationProgress = 0
    this.mousePosition = new THREE.Vector2()
    this.time = 0
    
    // Configuration
    this.config = {
      terrainSize: 200,
      terrainSegments: 256,
      wireframeIntensity: 1.0,
      flowLineCount: 50,
      particleCount: 2000
    }
    
    // Performance settings
    this.performanceSettings = null
  }

  async init() {
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    this.adjustForPerformance()
    
    // Create the enhanced wireframe terrain
    this.createWireframeTerrain()
    
    // Create flowing contour lines
    this.createFlowingContours()
    
    // Create reactive particle field
    this.createParticleField()
    
    // Setup mouse tracking
    this.setupMouseTracking()
    
    console.log('🌊 Enhanced Homepage scene initialized')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.config.terrainSegments = 128
        this.config.flowLineCount = 20
        this.config.particleCount = 500
        break
      case 'medium':
        this.config.terrainSegments = 192
        this.config.flowLineCount = 35
        this.config.particleCount = 1000
        break
      case 'high':
        this.config.terrainSegments = 256
        this.config.flowLineCount = 50
        this.config.particleCount = 2000
        break
    }
  }

  createWireframeTerrain() {
    // Create high-resolution terrain geometry
    const geometry = new THREE.PlaneGeometry(
      this.config.terrainSize,
      this.config.terrainSize,
      this.config.terrainSegments,
      this.config.terrainSegments
    )
    
    // Generate sophisticated height map
    this.generateAdvancedHeightMap(geometry)
    
    // Create wireframe material with advanced shaders
    const wireframeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        transformProgress: { value: 0 },
        mousePosition: { value: new THREE.Vector2() },
        terrainHeight: { value: 10.0 },
        lineWidth: { value: 0.8 },
        gridColor: { value: new THREE.Color(0x0D4F5C) },
        glowColor: { value: new THREE.Color(0x1B4F72) },
        backgroundFade: { value: new THREE.Color(0x0B1426) },
        opacity: { value: 0.8 }
      },
      vertexShader: `
        uniform float time;
        uniform float transformProgress;
        uniform vec2 mousePosition;
        uniform float terrainHeight;
        
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying float vElevation;
        varying float vMouseDistance;
        varying float vLineGlow;
        
        // Advanced noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vPosition = position;
          
          // Generate complex terrain using multiple octaves of noise
          float elevation = 0.0;
          vec3 noisePos = vec3(position.x * 0.02, position.y * 0.02, time * 0.1);
          
          // Primary terrain features
          elevation += snoise(noisePos) * 8.0;
          
          // Secondary details  
          elevation += snoise(noisePos * 2.0) * 4.0;
          
          // Fine surface details
          elevation += snoise(noisePos * 4.0) * 2.0;
          
          // Flowing wave patterns
          elevation += sin(position.x * 0.1 + time) * cos(position.y * 0.1 + time * 0.7) * 3.0;
          
          // Apply transformation progress
          vec3 pos = position;
          pos.z = elevation * transformProgress;
          vElevation = pos.z;
          
          // Calculate mouse influence
          vec2 worldPos = vec2(pos.x, pos.y);
          vMouseDistance = distance(worldPos, mousePosition * 100.0);
          
          // Line glow effect based on position
          vLineGlow = sin(pos.x * 0.3) * cos(pos.y * 0.3) * 0.5 + 0.5;
          
          // Transform to world space
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float transformProgress;
        uniform float lineWidth;
        uniform vec3 gridColor;
        uniform vec3 glowColor;
        uniform vec3 backgroundFade;
        uniform float opacity;
        
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying float vElevation;
        varying float vMouseDistance;
        varying float vLineGlow;
        
        void main() {
          // Create grid pattern
          vec2 grid = abs(fract(vPosition.xy * 0.5) - 0.5) / fwidth(vPosition.xy * 0.5);
          float gridLine = min(grid.x, grid.y);
          
          // Elevation-based coloring
          float elevationFactor = (vElevation + 10.0) / 20.0;
          vec3 color = mix(backgroundFade, gridColor, elevationFactor);
          
          // Add flowing energy lines
          float energyFlow = sin(vElevation * 2.0 + time * 2.0) * 0.5 + 0.5;
          color = mix(color, glowColor, energyFlow * 0.4);
          
          // Mouse proximity effect
          float mouseEffect = 1.0 - smoothstep(0.0, 30.0, vMouseDistance);
          color = mix(color, glowColor, mouseEffect * 0.6);
          
          // Grid line intensity
          float lineIntensity = 1.0 - smoothstep(0.0, lineWidth, gridLine);
          
          // Breathing effect
          float breathe = sin(time * 0.8) * 0.2 + 0.8;
          color *= breathe;
          
          // Height-based glow
          float heightGlow = smoothstep(0.0, 15.0, vElevation) * 0.5;
          color += glowColor * heightGlow;
          
          // Final alpha with grid lines
          float alpha = (lineIntensity * opacity + energyFlow * 0.3) * transformProgress;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: false
    })
    
    this.wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial)
    this.wireframeMesh.rotation.x = -Math.PI / 2
    this.scene.add(this.wireframeMesh)
  }

  generateAdvancedHeightMap(geometry) {
    const vertices = geometry.attributes.position.array
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      
      // Complex multi-octave noise for realistic terrain
      let height = 0
      
      // Large scale features
      height += this.fbm(x * 0.01, y * 0.01, 4) * 15
      
      // Medium scale features  
      height += this.fbm(x * 0.03, y * 0.03, 3) * 8
      
      // Fine detail
      height += this.fbm(x * 0.08, y * 0.08, 2) * 3
      
      // Flowing patterns
      height += Math.sin(x * 0.05) * Math.cos(y * 0.05) * 5
      height += Math.sin(x * 0.1 + y * 0.1) * 2
      
      vertices[i + 2] = height * this.transformationProgress
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  }

  // Fractal Brownian Motion for natural-looking noise
  fbm(x, y, octaves) {
    let value = 0
    let amplitude = 0.5
    let frequency = 1
    
    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise(x * frequency, y * frequency)
      amplitude *= 0.5
      frequency *= 2
    }
    
    return value
  }

  // Improved noise function
  noise(x, y) {
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
      const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]
      for (let i = 0; i < 256; i++) {
        this._perm[i] = this._perm[i + 256] = permutation[i]
      }
    }
    return this._perm
  }

  createFlowingContours() {
    // Create animated contour lines that flow across the terrain
    const contourMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        flowSpeed: { value: 2.0 },
        lineColor: { value: new THREE.Color(0x1B4F72) },
        opacity: { value: 0.6 }
      },
      vertexShader: `
        uniform float time;
        uniform float flowSpeed;
        
        varying vec2 vUv;
        varying float vFlow;
        
        void main() {
          vUv = uv;
          vFlow = sin(position.x * 0.1 + time * flowSpeed) * 0.5 + 0.5;
          
          vec3 pos = position;
          pos.z += vFlow * 2.0;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 lineColor;
        uniform float opacity;
        
        varying vec2 vUv;
        varying float vFlow;
        
        void main() {
          float pattern = sin(vUv.x * 50.0 + time * 3.0) * 0.5 + 0.5;
          float alpha = pattern * vFlow * opacity;
          
          gl_FragColor = vec4(lineColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })

    // Create multiple flowing contour lines
    for (let i = 0; i < this.config.flowLineCount; i++) {
      const curve = new THREE.EllipseCurve(
        0, 0,
        50 + Math.random() * 100,
        30 + Math.random() * 70,
        0, 2 * Math.PI,
        false,
        Math.random() * Math.PI * 2
      )
      
      const points = curve.getPoints(100)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      
      const line = new THREE.Line(geometry, contourMaterial.clone())
      line.position.y = i * 0.5 + Math.random() * 5
      line.rotation.x = -Math.PI / 2
      
      this.flowingLines.push(line)
      this.scene.add(line)
    }
  }

  createParticleField() {
    // Create a reactive particle field that responds to mouse movement
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = this.config.particleCount
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400
      positions[i * 3 + 2] = Math.random() * 50
      
      const color = new THREE.Color()
      color.setHSL(0.5 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      sizes[i] = Math.random() * 3 + 1
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mousePosition: { value: new THREE.Vector2() },
        pointTexture: { value: this.createParticleTexture() }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        uniform vec2 mousePosition;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Floating motion
          pos.z += sin(time * 2.0 + position.x * 0.01) * 5.0;
          pos.x += cos(time * 1.5 + position.z * 0.01) * 2.0;
          
          // Mouse attraction
          vec2 mouseWorld = mousePosition * 200.0;
          vec2 direction = mouseWorld - pos.xy;
          float distance = length(direction);
          float attraction = 1.0 / (1.0 + distance * 0.01);
          pos.xy += normalize(direction) * attraction * 10.0;
          
          vAlpha = attraction * 0.5 + 0.5;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, texColor.a * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.particleSystem)
  }

  createParticleTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(13, 79, 92, 0.8)')
    gradient.addColorStop(0.6, 'rgba(13, 79, 92, 0.3)')
    gradient.addColorStop(1, 'rgba(13, 79, 92, 0)')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, 64, 64)
    
    return new THREE.CanvasTexture(canvas)
  }

  setupMouseTracking() {
    document.addEventListener('mousemove', (event) => {
      this.onMouseMove(event)
    })
  }

  onMouseMove(event) {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Update all shader uniforms
    if (this.wireframeMesh?.material.uniforms) {
      this.wireframeMesh.material.uniforms.mousePosition.value.copy(this.mousePosition)
    }
    
    if (this.particleSystem?.material.uniforms) {
      this.particleSystem.material.uniforms.mousePosition.value.copy(this.mousePosition)
    }
    
    // Audio feedback
  }

  animateTransformation(progress) {
    this.transformationProgress = progress
    
    if (this.wireframeMesh) {
      // Update terrain height
      this.generateAdvancedHeightMap(this.wireframeMesh.geometry)
      
      // Update material uniforms
      this.wireframeMesh.material.uniforms.transformProgress.value = progress
      
      // Camera rotation for dramatic effect
      const rotation = -Math.PI / 2 + (progress * Math.PI / 4)
      this.wireframeMesh.rotation.x = rotation
    }
  }

  update(deltaTime) {
    this.time = performance.now() * 0.001
    
    // Update wireframe material
    if (this.wireframeMesh?.material.uniforms) {
      this.wireframeMesh.material.uniforms.time.value = this.time
    }
    
    // Update flowing contours
    this.flowingLines.forEach((line, index) => {
      if (line.material.uniforms) {
        line.material.uniforms.time.value = this.time
      }
      
      // Rotate contour lines
      line.rotation.z += 0.001 * (index % 2 === 0 ? 1 : -1)
    })
    
    // Update particle system
    if (this.particleSystem?.material.uniforms) {
      this.particleSystem.material.uniforms.time.value = this.time
    }
  }

  updateScroll(progress, direction) {
    this.animateTransformation(progress)
  }

  onEnter() {
    console.log('🌊 Entering enhanced homepage scene')
    
  }

  onExit() {
    console.log('🌊 Exiting enhanced homepage scene')
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.3,
      directionalIntensity: 0.7,
      directionalPosition: [50, 80, 50]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 40, 80],
      target: [0, 0, 0],
      fov: 75
    }
  }

  getDescription() {
    return 'Enhanced wireframe topographical landscape with flowing energy patterns'
  }

  getScene() {
    return this.scene
  }

  dispose() {
    // Clean up geometries and materials
    if (this.wireframeMesh) {
      this.wireframeMesh.geometry.dispose()
      this.wireframeMesh.material.dispose()
    }
    
    this.flowingLines.forEach(line => {
      line.geometry.dispose()
      line.material.dispose()
    })
    
    if (this.particleSystem) {
      this.particleSystem.geometry.dispose()
      this.particleSystem.material.dispose()
      this.particleSystem.material.uniforms.pointTexture.value.dispose()
    }
    
    console.log('🌊 Enhanced homepage scene disposed')
  }
}