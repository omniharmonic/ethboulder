import * as THREE from 'three'

export class EnhancedSystemsScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    this.nodes = []
    this.connections = []
    this.selectedNode = null
    this.nodeData = []
    this.sphereRadius = 40
    this.time = 0
    
    // Configuration
    this.config = {
      nodeCount: 30,
      connectionProbability: 0.2,
      flowingConnections: true,
      holographicNodes: true
    }
  }

  async init() {
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    this.adjustForPerformance()
    
    await this.loadProjectData()
    this.createSphereNetwork()
    this.createFlowingConnections()
    this.setupInteractions()
    
    console.log('🕸️ Enhanced Systems scene initialized')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.config.nodeCount = 20
        this.config.flowingConnections = false
        break
      case 'medium':
        this.config.nodeCount = 25
        this.config.flowingConnections = true
        break
      case 'high':
        this.config.nodeCount = 30
        this.config.flowingConnections = true
        break
    }
  }

  async loadProjectData() {
    try {
      const { ContentLoader } = await import('../data/portfolio.js')
      const data = await ContentLoader.loadPortfolioData()
      
      this.nodeData = [...data.systems, ...data.culture]
      
      // Pad with generated projects if needed
      const needed = this.config.nodeCount - this.nodeData.length
      for (let i = 0; i < needed; i++) {
        this.nodeData.push({
          id: `future-${i}`,
          title: `Emerging Project ${i + 1}`,
          description: 'An emerging systems initiative',
          tags: ['future', 'systems', 'innovation'],
          impact: Math.random(),
          complexity: Math.random()
        })
      }
    } catch (error) {
      console.warn('Failed to load portfolio data:', error)
      this.nodeData = Array.from({ length: this.config.nodeCount }, (_, i) => ({
        id: `project-${i}`,
        title: `Project ${i + 1}`,
        description: 'A systems thinking initiative',
        impact: Math.random(),
        complexity: Math.random()
      }))
    }
  }

  createSphereNetwork() {
    // Create nodes positioned on a sphere using Fibonacci spiral
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    
    for (let i = 0; i < this.config.nodeCount; i++) {
      const node = this.createHolographicNode(i)
      
      // Fibonacci sphere distribution for even spacing
      const y = 1 - (i / (this.config.nodeCount - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i
      
      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius
      
      node.position.set(
        x * this.sphereRadius,
        y * this.sphereRadius,
        z * this.sphereRadius
      )
      
      // Store original position for floating animation
      node.userData.originalPosition = node.position.clone()
      node.userData.floatOffset = i * 0.1
      
      this.nodes.push(node)
      this.scene.add(node)
    }
  }

  createHolographicNode(index) {
    const projectData = this.nodeData[index]
    
    // Create complex geometry based on project complexity
    const complexity = projectData.complexity || 0.5
    const impact = projectData.impact || 0.5
    
    // Use icosahedron for more sophisticated look
    const geometry = new THREE.IcosahedronGeometry(0.8 + impact * 0.6, 2)
    
    // Advanced holographic material with flowing energy
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        selected: { value: 0.0 },
        hovered: { value: 0.0 },
        impact: { value: impact },
        complexity: { value: complexity },
        coreColor: { value: new THREE.Color(0x0D4F5C) },
        energyColor: { value: new THREE.Color(0x1B4F72) },
        glowColor: { value: new THREE.Color(0xF8F9FA) },
        pulseSpeed: { value: 1.0 + complexity },
        hologramStrength: { value: 0.8 }
      },
      vertexShader: `
        uniform float time;
        uniform float selected;
        uniform float hovered;
        uniform float impact;
        uniform float complexity;
        uniform float pulseSpeed;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDistance;
        varying float vFresnel;
        varying float vPulse;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          // Holographic distortion
          vec3 pos = position;
          
          // Energy pulsing
          float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
          vPulse = pulse;
          
          // Surface displacement based on complexity
          pos += normal * sin(time * 3.0 + position.x * 10.0) * complexity * 0.05;
          
          // Expansion for interaction
          float expansion = selected * 0.3 + hovered * 0.15;
          pos *= 1.0 + expansion;
          
          // Transform to world space
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          vec4 mvPosition = viewMatrix * worldPosition;
          vDistance = -mvPosition.z;
          
          // Fresnel effect for holographic appearance
          vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
          vec3 viewDirection = normalize(cameraPosition - worldPosition.xyz);
          vFresnel = 1.0 - max(0.0, dot(worldNormal, viewDirection));
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float selected;
        uniform float hovered;
        uniform float impact;
        uniform float complexity;
        uniform vec3 coreColor;
        uniform vec3 energyColor;
        uniform vec3 glowColor;
        uniform float hologramStrength;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vDistance;
        varying float vFresnel;
        varying float vPulse;
        
        void main() {
          // Holographic interference patterns
          float pattern1 = sin(vPosition.y * 20.0 + time * 2.0) * 0.5 + 0.5;
          float pattern2 = sin(vPosition.x * 15.0 + time * 1.5) * 0.5 + 0.5;
          float interference = pattern1 * pattern2;
          
          // Base color mixing
          vec3 color = mix(coreColor, energyColor, complexity);
          
          // Add holographic shimmer
          color = mix(color, glowColor, interference * hologramStrength * 0.3);
          
          // Energy core based on impact
          float core = pow(1.0 - length(vPosition) / 2.0, 2.0);
          color += glowColor * core * impact * 0.5;
          
          // Pulse effect
          color += energyColor * vPulse * 0.2;
          
          // Selection and hover highlights
          color = mix(color, glowColor, selected * 0.4);
          color = mix(color, energyColor, hovered * 0.2);
          
          // Fresnel glow for holographic edge
          float fresnelGlow = pow(vFresnel, 2.0);
          color += glowColor * fresnelGlow * 0.3;
          
          // Distance-based fade
          float distanceFade = 1.0 - smoothstep(60.0, 120.0, vDistance);
          
          // Final alpha with holographic transparency
          float alpha = (0.7 + interference * 0.3 + fresnelGlow * 0.4) * distanceFade;
          alpha += selected * 0.3 + hovered * 0.2;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = {
      index,
      type: 'node',
      project: projectData,
      originalPosition: new THREE.Vector3(),
      floatOffset: 0
    }
    
    return mesh
  }

  createFlowingConnections() {
    // Create elegant flowing connections between related nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        if (this.shouldConnect(i, j)) {
          const connection = this.createFlowingConnection(this.nodes[i], this.nodes[j])
          this.connections.push(connection)
          this.scene.add(connection)
        }
      }
    }
  }

  shouldConnect(nodeA, nodeB) {
    const projectA = this.nodeData[nodeA]
    const projectB = this.nodeData[nodeB]
    
    // Check for tag overlaps or connection data
    const tagOverlap = projectA.tags?.some(tag => projectB.tags?.includes(tag))
    const hasConnection = projectA.connections?.includes(projectB.id) || 
                         projectB.connections?.includes(projectA.id)
    
    return hasConnection || tagOverlap || Math.random() < this.config.connectionProbability
  }

  createFlowingConnection(nodeA, nodeB) {
    // Create curved line with control point for organic flow
    const start = nodeA.position
    const end = nodeB.position
    
    // Calculate control point for smooth curve
    const midpoint = start.clone().add(end).multiplyScalar(0.5)
    const controlPoint = midpoint.clone().add(
      midpoint.clone().normalize().multiplyScalar(this.sphereRadius * 0.3)
    )
    
    // Create quadratic bezier curve
    const curve = new THREE.QuadraticBezierCurve3(start, controlPoint, end)
    const points = curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    
    // Add flow direction attribute
    const flowDirection = new Float32Array(points.length)
    for (let i = 0; i < points.length; i++) {
      flowDirection[i] = i / (points.length - 1)
    }
    geometry.setAttribute('flowDirection', new THREE.BufferAttribute(flowDirection, 1))
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        flowSpeed: { value: 2.0 },
        strength: { value: 0.3 },
        connectionColor: { value: new THREE.Color(0x0D4F5C) },
        energyColor: { value: new THREE.Color(0x1B4F72) },
        glowColor: { value: new THREE.Color(0xF8F9FA) }
      },
      vertexShader: `
        attribute float flowDirection;
        uniform float time;
        uniform float flowSpeed;
        
        varying float vFlow;
        varying float vDistance;
        
        void main() {
          vFlow = flowDirection;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDistance = -mvPosition.z;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float flowSpeed;
        uniform float strength;
        uniform vec3 connectionColor;
        uniform vec3 energyColor;
        uniform vec3 glowColor;
        
        varying float vFlow;
        varying float vDistance;
        
        void main() {
          // Flowing energy pattern
          float flow = sin(vFlow * 6.28 - time * flowSpeed) * 0.5 + 0.5;
          
          // Pulse along the connection
          float pulse = sin(time * 3.0) * 0.2 + 0.8;
          
          // Color mixing
          vec3 color = mix(connectionColor, energyColor, flow);
          color = mix(color, glowColor, flow * 0.3);
          
          // Distance fade
          float distanceFade = 1.0 - smoothstep(40.0, 100.0, vDistance);
          
          // Final alpha
          float alpha = strength * pulse * flow * distanceFade;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    const line = new THREE.Line(geometry, material)
    line.userData = { nodeA, nodeB }
    
    return line
  }

  setupInteractions() {
    // Setup raycasting for node interactions
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.hoveredNode = null
  }

  update(deltaTime) {
    this.time = performance.now() * 0.001
    
    // Update node animations
    this.nodes.forEach((node, index) => {
      // Update material uniforms
      if (node.material.uniforms) {
        node.material.uniforms.time.value = this.time
      }
      
      // Gentle floating motion
      const floatOffset = node.userData.floatOffset
      const originalPos = node.userData.originalPosition
      
      node.position.x = originalPos.x + Math.sin(this.time * 0.8 + floatOffset) * 1.5
      node.position.y = originalPos.y + Math.cos(this.time * 0.6 + floatOffset) * 1.0
      node.position.z = originalPos.z + Math.sin(this.time * 0.4 + floatOffset) * 2.0
    })
    
    // Update connection flows
    this.connections.forEach(connection => {
      if (connection.material.uniforms) {
        connection.material.uniforms.time.value = this.time
      }
    })
    
    // Slowly rotate the entire network
    this.scene.rotation.y += 0.002
    this.scene.rotation.x = Math.sin(this.time * 0.3) * 0.1
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Raycast to detect hovered nodes
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera)
    const intersects = this.raycaster.intersectObjects(this.nodes)
    
    // Reset previous hover
    if (this.hoveredNode && this.hoveredNode.material.uniforms) {
      this.hoveredNode.material.uniforms.hovered.value = 0.0
    }
    
    if (intersects.length > 0) {
      const newHovered = intersects[0].object
      if (newHovered !== this.hoveredNode) {
        this.hoveredNode = newHovered
        if (newHovered.material.uniforms) {
          newHovered.material.uniforms.hovered.value = 1.0
        }
        
        // Audio feedback
      }
    } else {
      this.hoveredNode = null
    }
  }

  onClick(event) {
    if (this.hoveredNode) {
      // Deselect previous
      if (this.selectedNode && this.selectedNode.material.uniforms) {
        this.selectedNode.material.uniforms.selected.value = 0.0
      }
      
      // Select new node
      this.selectedNode = this.hoveredNode
      if (this.selectedNode.material.uniforms) {
        this.selectedNode.material.uniforms.selected.value = 1.0
      }
      
      // Show project details
      this.showProjectDetails(this.selectedNode.userData.project)
    }
  }

  showProjectDetails(projectData) {
    const detailsPanel = document.getElementById('project-details')
    if (detailsPanel) {
      detailsPanel.innerHTML = `
        <div class="project-detail-card">
          <h3>${projectData.title}</h3>
          <p class="project-description">${projectData.description}</p>
          <div class="project-tags">
            ${projectData.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
          </div>
          <div class="project-metrics">
            <div class="metric">
              <span class="metric-label">Impact</span>
              <div class="metric-bar">
                <div class="metric-fill" style="width: ${Math.round((projectData.impact || 0) * 100)}%"></div>
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">Complexity</span>
              <div class="metric-bar">
                <div class="metric-fill" style="width: ${Math.round((projectData.complexity || 0) * 100)}%"></div>
              </div>
            </div>
          </div>
        </div>
      `
      detailsPanel.style.display = 'block'
    }
  }

  onEnter() {
    console.log('🕸️ Entering enhanced systems scene')
    
  }

  onExit() {
    console.log('🕸️ Exiting enhanced systems scene')
    
    const detailsPanel = document.getElementById('project-details')
    if (detailsPanel) {
      detailsPanel.style.display = 'none'
    }
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.1,
      directionalIntensity: 0.9,
      directionalPosition: [30, 50, 40]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 0, 100],
      target: [0, 0, 0],
      fov: 75
    }
  }

  getDescription() {
    return 'Elegant spherical network of interconnected projects with flowing energy connections'
  }

  getScene() {
    return this.scene
  }

  dispose() {
    this.nodes.forEach(node => {
      node.geometry.dispose()
      node.material.dispose()
    })
    
    this.connections.forEach(connection => {
      connection.geometry.dispose()
      connection.material.dispose()
    })
    
    console.log('🕸️ Enhanced systems scene disposed')
  }
}