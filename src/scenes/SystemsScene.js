import * as THREE from 'three'

export class SystemsScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    this.nodes = []
    this.connections = []
    this.selectedNode = null
    this.nodeData = []
    
    // Configuration
    this.config = {
      nodeCount: 50,
      sphereRadius: 30,
      connectionProbability: 0.15
    }
  }

  async init() {
    // Get performance settings
    this.performanceSettings = this.sceneManager.performanceMonitor.getQualitySettings()
    
    // Adjust for performance
    this.adjustForPerformance()
    
    // Load project data
    await this.loadProjectData()
    
    // Create network visualization
    this.createNetworkNodes()
    this.createConnections()
    
    console.log('🕸️ Systems scene initialized')
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.config.nodeCount = 25
        this.config.connectionProbability = 0.1
        break
      case 'medium':
        this.config.nodeCount = 40
        this.config.connectionProbability = 0.12
        break
      case 'high':
        this.config.nodeCount = 50
        this.config.connectionProbability = 0.15
        break
    }
  }

  async loadProjectData() {
    try {
      const { ContentLoader } = await import('../data/portfolio.js')
      const data = await ContentLoader.loadPortfolioData()
      
      // Use real systems projects and pad with generated ones if needed
      this.nodeData = [...data.systems]
      
      // Add some cultural projects to show interconnections
      data.culture.forEach(project => {
        this.nodeData.push({
          ...project,
          type: 'culture'
        })
      })
      
      // Pad with generated projects if we need more nodes
      const needed = this.config.nodeCount - this.nodeData.length
      for (let i = 0; i < needed; i++) {
        this.nodeData.push({
          id: `generated-${i}`,
          title: `Future Project ${i + 1}`,
          description: 'An emerging systems thinking initiative',
          tags: ['systems-thinking', 'innovation', 'future'],
          connections: [],
          impact: Math.random(),
          complexity: Math.random()
        })
      }
      
    } catch (error) {
      console.warn('Failed to load portfolio data, using generated data:', error)
      // Fallback to generated data
      this.nodeData = Array.from({ length: this.config.nodeCount }, (_, i) => ({
        id: `project-${i}`,
        title: `Systems Project ${i + 1}`,
        description: 'A transformative systems thinking initiative',
        tags: ['systems-thinking', 'innovation', 'collaboration'],
        connections: [],
        impact: Math.random(),
        complexity: Math.random()
      }))
    }
  }

  createNetworkNodes() {
    for (let i = 0; i < this.config.nodeCount; i++) {
      const node = this.createNode(i)
      
      // Position nodes using spherical distribution
      const phi = Math.acos(-1 + (2 * i) / this.config.nodeCount)
      const theta = Math.sqrt(this.config.nodeCount * Math.PI) * phi
      
      node.position.setFromSphericalCoords(
        this.config.sphereRadius,
        phi,
        theta
      )
      
      // Add gentle floating motion
      node.userData.originalPosition = node.position.clone()
      node.userData.floatOffset = Math.random() * Math.PI * 2
      
      this.nodes.push(node)
      this.scene.add(node)
    }
  }

  createNode(index) {
    const projectData = this.nodeData[index]
    
    // Create node geometry - octahedron for geometric beauty
    const geometry = new THREE.OctahedronGeometry(0.5 + projectData.impact * 0.3)
    
    // Create holographic material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        selected: { value: 0.0 },
        impact: { value: projectData.impact },
        complexity: { value: projectData.complexity },
        primaryColor: { value: new THREE.Color(0x0D4F5C) },
        accentColor: { value: new THREE.Color(0x1B4F72) },
        glowColor: { value: new THREE.Color(0xF8F9FA) }
      },
      vertexShader: `
        uniform float time;
        uniform float selected;
        uniform float impact;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDistance;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          // Holographic distortion
          vec3 pos = position;
          pos += normal * sin(time * 2.0 + position.x * 10.0) * 0.02 * impact;
          
          // Selected node expansion
          pos *= 1.0 + selected * 0.3;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vDistance = length(mvPosition.xyz);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float selected;
        uniform float impact;
        uniform float complexity;
        uniform vec3 primaryColor;
        uniform vec3 accentColor;
        uniform vec3 glowColor;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDistance;
        
        void main() {
          // Holographic interference patterns
          float pattern = sin(vPosition.y * 20.0 + time) * 0.5 + 0.5;
          
          // Color mixing based on project properties
          vec3 color = mix(primaryColor, accentColor, complexity);
          color = mix(color, glowColor, pattern * 0.3);
          
          // Selected highlight
          color = mix(color, glowColor, selected * 0.5);
          
          // Fresnel effect for holographic appearance
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          float alpha = 0.6 + fresnel * 0.4 + selected * 0.3;
          
          // Distance-based opacity
          alpha *= smoothstep(50.0, 20.0, vDistance);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
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

  createConnections() {
    // Create connections between related nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        if (this.shouldConnect(i, j)) {
          const connection = this.createConnection(
            this.nodes[i].position,
            this.nodes[j].position
          )
          this.connections.push(connection)
          this.scene.add(connection)
          
          // Update node data with connections
          this.nodeData[i].connections.push(j)
          this.nodeData[j].connections.push(i)
        }
      }
    }
  }

  shouldConnect(nodeA, nodeB) {
    // In real implementation, this would be based on actual project relationships
    return Math.random() < this.config.connectionProbability
  }

  createConnection(posA, posB) {
    // Create curved line between nodes
    const curve = new THREE.QuadraticBezierCurve3(
      posA.clone(),
      posA.clone().add(posB).multiplyScalar(0.5).add(new THREE.Vector3(0, 5, 0)),
      posB.clone()
    )
    
    const points = curve.getPoints(20)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        strength: { value: 0.3 },
        color: { value: new THREE.Color(0x0D4F5C) }
      },
      vertexShader: `
        uniform float time;
        
        void main() {
          vec3 pos = position;
          pos += normal * sin(time * 2.0 + position.x * 5.0) * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float strength;
        uniform vec3 color;
        
        void main() {
          float alpha = strength * (sin(time * 3.0) * 0.2 + 0.8);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    return new THREE.Line(geometry, material)
  }

  update(deltaTime) {
    const time = performance.now() * 0.001
    
    // Update node animations
    this.nodes.forEach((node, index) => {
      // Update material time uniform
      if (node.material.uniforms) {
        node.material.uniforms.time.value = time
      }
      
      // Gentle floating motion
      const floatOffset = node.userData.floatOffset
      const originalPos = node.userData.originalPosition
      
      node.position.x = originalPos.x + Math.sin(time + floatOffset) * 0.5
      node.position.y = originalPos.y + Math.cos(time * 0.7 + floatOffset) * 0.3
      node.position.z = originalPos.z + Math.sin(time * 0.5 + floatOffset) * 0.4
    })
    
    // Update connection animations
    this.connections.forEach(connection => {
      if (connection.material.uniforms) {
        connection.material.uniforms.time.value = time
      }
    })
    
    // Rotate entire network slowly
    this.scene.rotation.y += 0.001
  }

  onNodeHover(node) {
    if (node.material.uniforms) {
      // Highlight hovered node
      node.material.uniforms.selected.value = 1.0
      
      // Strengthen connected relationships
      const nodeIndex = node.userData.index
      const connections = this.nodeData[nodeIndex].connections
      
      connections.forEach(connectedIndex => {
        const connectedNode = this.nodes[connectedIndex]
        if (connectedNode.material.uniforms) {
          connectedNode.material.uniforms.selected.value = 0.5
        }
      })
    }
    
    // Audio feedback
  }

  onNodeUnhover() {
    // Reset all node selections
    this.nodes.forEach(node => {
      if (node.material.uniforms) {
        node.material.uniforms.selected.value = 0.0
      }
    })
  }

  onClick(event) {
    // Raycast to detect node clicks
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    raycaster.setFromCamera(mouse, this.sceneManager.camera)
    const intersects = raycaster.intersectObjects(this.nodes)
    
    if (intersects.length > 0) {
      const clickedNode = intersects[0].object
      this.selectNode(clickedNode)
    }
  }

  selectNode(node) {
    // Deselect previous node
    if (this.selectedNode) {
      this.selectedNode.material.uniforms.selected.value = 0.0
    }
    
    // Select new node
    this.selectedNode = node
    node.material.uniforms.selected.value = 1.0
    
    // Show project details
    this.showProjectDetails(node.userData.project)
    
    // Audio feedback
  }

  showProjectDetails(projectData) {
    const detailsPanel = document.getElementById('project-details')
    if (detailsPanel) {
      detailsPanel.innerHTML = `
        <h3>${projectData.title}</h3>
        <p>${projectData.description}</p>
        <div class="tags">
          ${projectData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="metrics">
          <div>Impact: ${Math.round(projectData.impact * 100)}%</div>
          <div>Complexity: ${Math.round(projectData.complexity * 100)}%</div>
        </div>
      `
      detailsPanel.style.display = 'block'
    }
  }

  onEnter() {
    console.log('🕸️ Entering systems scene')
    
    // Start systems ambient audio
  }

  onExit() {
    console.log('🕸️ Exiting systems scene')
    
    // Hide project details
    const detailsPanel = document.getElementById('project-details')
    if (detailsPanel) {
      detailsPanel.style.display = 'none'
    }
  }

  getLightingConfig() {
    return {
      ambientIntensity: 0.2,
      directionalIntensity: 0.8,
      directionalPosition: [20, 30, 40]
    }
  }

  getCameraConfig() {
    return {
      position: [0, 0, 60],
      target: [0, 0, 0],
      fov: 75
    }
  }

  getDescription() {
    return 'Network of interconnected project nodes showing systems thinking relationships'
  }

  getInteractiveElementCount() {
    return this.nodes.length
  }

  getScene() {
    return this.scene
  }

  dispose() {
    // Clean up nodes
    this.nodes.forEach(node => {
      node.geometry.dispose()
      node.material.dispose()
    })
    
    // Clean up connections
    this.connections.forEach(connection => {
      connection.geometry.dispose()
      connection.material.dispose()
    })
    
    console.log('🕸️ Systems scene disposed')
  }
}