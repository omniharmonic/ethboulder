import * as THREE from 'three'

export class FrostedGlassCard {
  constructor(config = {}) {
    // Card configuration
    this.config = {
      width: config.width || 300,
      height: config.height || 200,
      borderRadius: config.borderRadius || 20,
      opacity: config.opacity || 0.15,
      blurAmount: config.blurAmount || 10,
      position: config.position || { x: 0, y: 0, z: 0 },
      content: config.content || {},
      ...config
    }
    
    this.mesh = null
    this.textElements = []
    this.isVisible = false
    this.targetOpacity = this.config.opacity
    this.currentOpacity = 0
    
    this.createCard()
  }
  
  createCard() {
    // Create rounded rectangle geometry
    const shape = new THREE.Shape()
    const { width, height, borderRadius } = this.config
    const w = width / 2
    const h = height / 2
    const r = borderRadius
    
    // Create rounded rectangle path
    shape.moveTo(-w + r, -h)
    shape.lineTo(w - r, -h)
    shape.quadraticCurveTo(w, -h, w, -h + r)
    shape.lineTo(w, h - r)
    shape.quadraticCurveTo(w, h, w - r, h)
    shape.lineTo(-w + r, h)
    shape.quadraticCurveTo(-w, h, -w, h - r)
    shape.lineTo(-w, -h + r)
    shape.quadraticCurveTo(-w, -h, -w + r, -h)
    
    const geometry = new THREE.ShapeGeometry(shape)
    
    // Create frosted glass material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: this.currentOpacity },
        baseOpacity: { value: this.config.opacity },
        glassColor: { value: new THREE.Color(0xffffff) },
        rimLight: { value: new THREE.Color(0xffffff) },
        mousePosition: { value: new THREE.Vector2() },
        cardPosition: { value: new THREE.Vector3(...Object.values(this.config.position)) }
      },
      vertexShader: `
        uniform float time;
        uniform vec2 mousePosition;
        uniform vec3 cardPosition;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying float vMouseDistance;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          // Calculate distance to mouse for interactive effects
          vec2 screenPos = vec2(vWorldPosition.x, vWorldPosition.y);
          vMouseDistance = distance(screenPos, mousePosition * 200.0);
          
          // Subtle floating animation
          vec3 pos = position;
          pos.y += sin(time * 0.5 + cardPosition.x * 0.01) * 2.0;
          pos.x += cos(time * 0.3 + cardPosition.z * 0.01) * 1.0;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform float baseOpacity;
        uniform vec3 glassColor;
        uniform vec3 rimLight;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vMouseDistance;
        
        void main() {
          // Base frosted glass effect
          vec3 color = glassColor;
          
          // Add subtle gradient
          float gradient = smoothstep(0.0, 1.0, vUv.y);
          color = mix(color, vec3(0.9, 0.95, 1.0), gradient * 0.3);
          
          // Rim lighting effect
          float rim = 1.0 - smoothstep(0.0, 0.8, length(vUv - 0.5) * 2.0);
          color = mix(color, rimLight, rim * 0.2);
          
          // Mouse proximity glow
          float mouseGlow = 1.0 - smoothstep(0.0, 100.0, vMouseDistance);
          color = mix(color, vec3(1.0, 1.0, 1.0), mouseGlow * 0.3);
          
          // Subtle animated shimmer
          float shimmer = sin(time * 2.0 + vUv.x * 10.0 + vUv.y * 8.0) * 0.05 + 0.95;
          color *= shimmer;
          
          // Dynamic opacity based on mouse distance
          float dynamicOpacity = baseOpacity + mouseGlow * 0.15;
          
          gl_FragColor = vec4(color, dynamicOpacity * opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false
    })
    
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    )
    
    // Add subtle border glow
    this.createBorderGlow()
  }
  
  createBorderGlow() {
    // Create a slightly larger version for the border glow
    const shape = new THREE.Shape()
    const { width, height, borderRadius } = this.config
    const w = (width + 4) / 2  // Slightly larger
    const h = (height + 4) / 2
    const r = borderRadius + 2
    
    // Create rounded rectangle path
    shape.moveTo(-w + r, -h)
    shape.lineTo(w - r, -h)
    shape.quadraticCurveTo(w, -h, w, -h + r)
    shape.lineTo(w, h - r)
    shape.quadraticCurveTo(w, h, w - r, h)
    shape.lineTo(-w + r, h)
    shape.quadraticCurveTo(-w, h, -w, h - r)
    shape.lineTo(-w, -h + r)
    shape.quadraticCurveTo(-w, -h, -w + r, -h)
    
    const borderGeometry = new THREE.ShapeGeometry(shape)
    const borderMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    
    this.borderMesh = new THREE.Mesh(borderGeometry, borderMaterial)
    this.borderMesh.position.copy(this.mesh.position)
    this.borderMesh.position.z -= 0.1 // Slightly behind main card
  }
  
  updateContent(content) {
    this.config.content = { ...this.config.content, ...content }
  }
  
  setVisibility(visible, duration = 1000) {
    this.isVisible = visible
    this.targetOpacity = visible ? this.config.opacity : 0
    
    // Animate opacity change
    const startOpacity = this.currentOpacity
    const startTime = performance.now()
    
    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = this.easeInOutCubic(progress)
      
      this.currentOpacity = startOpacity + (this.targetOpacity - startOpacity) * easedProgress
      
      if (this.mesh && this.mesh.material.uniforms) {
        this.mesh.material.uniforms.opacity.value = this.currentOpacity
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  
  onMouseMove(mousePosition) {
    if (this.mesh && this.mesh.material.uniforms) {
      this.mesh.material.uniforms.mousePosition.value.copy(mousePosition)
    }
  }
  
  update(deltaTime) {
    const time = performance.now() * 0.001
    
    if (this.mesh && this.mesh.material.uniforms) {
      this.mesh.material.uniforms.time.value = time
    }
  }
  
  getMesh() {
    return this.mesh
  }
  
  getBorderMesh() {
    return this.borderMesh
  }
  
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
    }
    if (this.borderMesh) {
      this.borderMesh.geometry.dispose()
      this.borderMesh.material.dispose()
    }
  }
}