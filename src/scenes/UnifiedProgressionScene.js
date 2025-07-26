import * as THREE from 'three'

export class UnifiedProgressionScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scene = new THREE.Scene()
    
    // Progression states (0-1 for each phase)
    this.phase1Progress = 0 // 2D topographical soundwaves
    this.phase2Progress = 0 // 3D mountain range with sun/shadows
    this.phase3Progress = 0 // Indra's Net transformation
    this.phase4Progress = 0 // Cell division
    
    // Scene elements
    this.topographicalLines = []
    this.mountainTerrain = null
    this.indrasNet = null
    this.cellSystem = null
    this.sun = null
    this.sunLight = null
    
    // Mouse interaction
    this.mousePosition = new THREE.Vector2()
    this.lastMousePosition = new THREE.Vector2()
    this.mouseInfluence = 0
    this.lastMouseMoveTime = null
    this.lastUniformUpdate = null
    this.time = 0
    
    // Configuration
    this.config = {
      mapSize: 200,
      lineCount: 50,
      mountainSegments: 128,
      netNodeCount: 100,
      cellCount: 50
    }
  }

  async init() {
    this.adjustForPerformance()
    
    console.log('🌊 Starting UnifiedProgressionScene initialization...')
    console.log('🧹 CLEARING SCENE COMPLETELY')
    
    // Clear any existing scene objects
    while(this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0])
    }
    
    console.log('✅ Scene cleared, children count:', this.scene.children.length)
    
    // Test cube removed - system working with basic materials
    
    // Create the unified morphing line system
    try {
      console.log('🔧 Attempting to create NEW CLEAN morphing system...')
      this.createUnifiedMorphingSystem()
      this.createLowPolyMountains() // Low poly mountain terrain
      this.createSunSystem() // For mountain phase
      
      // Setup mouse tracking for wave interactions
      this.setupMouseTracking()
      
      // Initialize with phase 1 (topographical)
      this.updateProgression(0.1) // Start with slight progress to trigger phase 1
      
      console.log('🌊 Unified morphing progression scene initialized')
      console.log('Morphing system created with', this.morphingSystem?.lines?.length || 0, 'lines')
      console.log('Vertex count:', this.morphingSystem?.vertices?.length || 0)
      console.log('Scene children count:', this.scene.children.length)
      
    } catch (error) {
      console.error('❌ Error initializing unified morphing system:', error)
      console.error('Error stack:', error.stack)
      // Fallback to basic system
      console.log('🔄 Creating fallback system...')
      this.createFallbackSystem()
    }
  }

  adjustForPerformance() {
    const level = this.sceneManager.performanceMonitor.performanceLevel
    
    switch (level) {
      case 'low':
        this.config.lineCount = 25
        this.config.mountainSegments = 64
        this.config.netNodeCount = 50
        this.config.cellCount = 20
        break
      case 'medium':
        this.config.lineCount = 40
        this.config.mountainSegments = 96
        this.config.netNodeCount = 75
        this.config.cellCount = 35
        break
      case 'high':
        this.config.lineCount = 50
        this.config.mountainSegments = 128
        this.config.netNodeCount = 100
        this.config.cellCount = 50
        break
    }
  }

  createSimpleTestLines() {
    console.log('🟢 Creating simple test lines for visibility check...')
    // Create simple test lines to verify line rendering works
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(6)
      
      // Create horizontal lines at different heights and positions
      positions[0] = -80 + i * 20; positions[1] = -40 + i * 20; positions[2] = 0
      positions[3] = 80 - i * 20; positions[4] = 40 - i * 20; positions[5] = 0
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      
      const material = new THREE.LineBasicMaterial({
        color: 0xFF0000, // Red for maximum visibility
        transparent: false,
        linewidth: 3
      })
      
      const line = new THREE.Line(geometry, material)
      this.scene.add(line)
      console.log(`✅ Added simple test line ${i + 1} from (${positions[0]}, ${positions[1]}) to (${positions[3]}, ${positions[4]})`)
    }
    console.log('🟢 Simple test lines created, total scene children:', this.scene.children.length)
  }

  createTestLines() {
    // Create simple test lines to verify line rendering works
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(6)
      
      // Create horizontal lines at different heights
      positions[0] = -50; positions[1] = i * 20 - 20; positions[2] = 0
      positions[3] = 50; positions[4] = i * 20 - 20; positions[5] = 0
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      
      const material = new THREE.LineBasicMaterial({
        color: 0x00FF00, // Green for visibility
        transparent: false
      })
      
      const line = new THREE.Line(geometry, material)
      this.scene.add(line)
      console.log(`✅ Added test line ${i + 1} at y=${i * 20 - 20}`)
    }
  }

  createTestCube() {
    console.log('🔲 Creating test cube for 3D rendering verification...')
    // Create a simple test cube to verify rendering is working
    const geometry = new THREE.BoxGeometry(40, 40, 40)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00FFFF, // Cyan for better visibility  
      wireframe: false,
      transparent: false
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(0, 0, 0)
    this.scene.add(cube)
    console.log('✅ Test cube added:', cube.position, 'color:', cube.material.color.getHex().toString(16))
    console.log('✅ Scene children after cube:', this.scene.children.length)
  }

  createUnifiedMorphingSystem() {
    console.log('Creating unified morphing system...')
    
    // Create the unified line system that morphs through all phases
    this.morphingSystem = {
      lines: [],
      vertices: [],
      targetPositions: {
        topographical: [],
        mountain: [],
        network: [],
        cellular: []
      }
    }
    
    // Create base organic grid (more organic, less uniform)
    this.createOrganicBaseGrid()
    console.log('Created', this.morphingSystem.vertices.length, 'vertices')
    
    // Pre-calculate target positions for each phase
    this.calculateAllTargetPositions()
    console.log('Calculated target positions for all phases')
    
    // Create the visual line system
    this.createMorphingLines()
    console.log('Created', this.morphingSystem.lines.length, 'morphing lines')
  }
  
  createFallbackSystem() {
    console.log('Creating fallback basic line system...')
    
    // Create multiple visible lines for better testing
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(6) // One line
      positions[0] = -50 + i * 10; positions[1] = -20 + i * 10; positions[2] = 0
      positions[3] = 50 - i * 10; positions[4] = 20 - i * 10; positions[5] = 0
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      
      const material = new THREE.LineBasicMaterial({ 
        color: 0x0D4F5C,
        transparent: false,
        opacity: 1.0
      })
      
      const line = new THREE.Line(geometry, material)
      this.scene.add(line)
      console.log(`✅ Added fallback line ${i + 1} to scene`)
    }
    
    console.log('✅ Fallback system created with', this.scene.children.length, 'total children')
    
    // Debug: List all children in the scene
    this.scene.children.forEach((child, index) => {
      console.log(`  Child ${index}: ${child.constructor.name} at position:`, child.position)
    })
  }

  createOrganicBaseGrid() {
    // Create a screen-filling grid
    this.morphingSystem.vertices = []
    const gridSize = 150 // Much larger to fill screen
    const pointsPerSide = 12 // More points for richer detail
    
    console.log(`🌱 Creating clean organic grid with ${pointsPerSide}x${pointsPerSide} points`)
    console.log('🚀 NEW CLEAN GRID CODE IS RUNNING!')
    
    for (let x = 0; x < pointsPerSide; x++) {
      for (let y = 0; y < pointsPerSide; y++) {
        // Create regular grid positions
        const gridX = (x / (pointsPerSide - 1) - 0.5) * gridSize
        const gridY = (y / (pointsPerSide - 1) - 0.5) * gridSize
        
        // Add small organic displacement
        const finalX = gridX + (Math.random() - 0.5) * 5
        const finalY = gridY + (Math.random() - 0.5) * 5
        
        // Calculate organic elevation
        const elevation = this.getOrganicElevation(finalX, finalY)
        
        this.morphingSystem.vertices.push({
          basePosition: new THREE.Vector3(finalX, finalY, 0),
          currentPosition: new THREE.Vector3(finalX, finalY, elevation * 0.1),
          id: x * pointsPerSide + y,
          gridX: x,
          gridY: y,
          connections: []
        })
      }
    }
    
    // Create clean grid-based connections
    this.createGridConnections()
  }

  getOrganicElevation(x, y) {
    // Highly organic elevation calculation (non-uniform)
    let elevation = 0
    
    // Multiple overlapping noise layers for organic terrain
    elevation += Math.sin(x * 0.0089 + y * 0.0067 + 1.23) * 12.0
    elevation += Math.cos(x * 0.0156 - y * 0.0234 + 2.45) * 8.0
    elevation += Math.sin(x * 0.0234 + y * 0.0345 + 3.67) * 6.0
    elevation += Math.cos(x * 0.0345 - y * 0.0123 + 4.89) * 4.0
    
    // Add fractal-like details
    elevation += Math.sin(x * 0.0567 + y * 0.0789 + 5.12) * 3.0
    elevation += Math.cos(x * 0.0789 - y * 0.0456 + 6.34) * 2.0
    
    // Organic irregularities
    elevation += Math.sin(x * 0.1234 + y * 0.0876 + Math.sin(x * 0.01)) * 1.5
    
    return elevation
  }

  createGridConnections() {
    // Create clean, organized connections based on grid structure
    const vertices = this.morphingSystem.vertices
    const pointsPerSide = 12 // Match the grid size
    let totalConnections = 0
    
    vertices.forEach((vertex, i) => {
      vertex.connections = []
      const { gridX, gridY } = vertex
      
      // Connect to right neighbor
      if (gridX < pointsPerSide - 1) {
        const rightNeighbor = gridY * pointsPerSide + (gridX + 1)
        vertex.connections.push(rightNeighbor)
        totalConnections++
      }
      
      // Connect to bottom neighbor  
      if (gridY < pointsPerSide - 1) {
        const bottomNeighbor = (gridY + 1) * pointsPerSide + gridX
        vertex.connections.push(bottomNeighbor)
        totalConnections++
      }
      
      // Occasionally connect diagonally for organic feel (but controlled)
      if (gridX < pointsPerSide - 1 && gridY < pointsPerSide - 1 && Math.random() < 0.3) {
        const diagNeighbor = (gridY + 1) * pointsPerSide + (gridX + 1)
        vertex.connections.push(diagNeighbor)
        totalConnections++
      }
    })
    
    console.log(`🕸️ Created ${totalConnections} clean grid connections between ${vertices.length} vertices`)
  }

  createMorphingLines() {
    console.log('🔧 Creating morphing lines from connections...')
    // Create the visual line system
    this.morphingSystem.lines = []
    const vertices = this.morphingSystem.vertices
    
    console.log(`📊 Processing ${vertices.length} vertices for line creation`)
    
    let lineCount = 0
    // Create lines between connected vertices
    vertices.forEach((vertex, i) => {
      vertex.connections.forEach(connectionId => {
        // Only create line once per connection pair
        if (i < connectionId) {
          lineCount++
          const startVertex = vertices[i]
          const endVertex = vertices[connectionId]
          
          console.log(`🔧 Creating line ${lineCount} from vertex ${i} to vertex ${connectionId}`)
          console.log(`   Positions: (${startVertex.currentPosition.x.toFixed(1)}, ${startVertex.currentPosition.y.toFixed(1)}, ${startVertex.currentPosition.z.toFixed(1)}) to (${endVertex.currentPosition.x.toFixed(1)}, ${endVertex.currentPosition.y.toFixed(1)}, ${endVertex.currentPosition.z.toFixed(1)})`)
          
          const lineGeometry = new THREE.BufferGeometry()
          const positions = new Float32Array(6) // 2 vertices * 3 coordinates
          
          // Set initial positions (topographical phase)
          positions[0] = startVertex.currentPosition.x
          positions[1] = startVertex.currentPosition.y
          positions[2] = startVertex.currentPosition.z
          positions[3] = endVertex.currentPosition.x
          positions[4] = endVertex.currentPosition.y
          positions[5] = endVertex.currentPosition.z
          
          lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
          
          // Use shader material with sound wave undulation and mouse interaction
          const lineMaterial = new THREE.ShaderMaterial({
            uniforms: {
              time: { value: 0.0 },
              mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
              mouseInfluence: { value: 0.0 },
              waveAmplitude: { value: 2.0 },
              waveFrequency: { value: 0.02 },
              waveSpeed: { value: 1.5 },
              lineColor: { value: new THREE.Color(0x0D4F5C) },
              phaseProgress: { value: 0.0 },
              currentPhase: { value: 0.0 }
            },
            vertexShader: `
              uniform float time;
              uniform vec2 mousePosition;
              uniform float mouseInfluence;
              uniform float waveAmplitude;
              uniform float waveFrequency;
              uniform float waveSpeed;
              uniform float phaseProgress;
              uniform float currentPhase;
              
              varying vec3 vPosition;
              varying float vWaveIntensity;
              varying float vMouseDistance;
              
              void main() {
                vPosition = position;
                
                // Calculate distance from mouse position
                vec2 worldMouse = mousePosition * 100.0; // Scale to world coordinates
                float mouseDistance = distance(vec2(position.x, position.y), worldMouse);
                vMouseDistance = mouseDistance;
                
                // Smooth mouse influence that decreases with distance
                float mouseEffect = exp(-mouseDistance / 40.0) * mouseInfluence * 0.3; // Reduced intensity
                
                // Create multiple overlapping sound waves
                float wave1 = sin(position.x * waveFrequency + time * waveSpeed) * waveAmplitude;
                float wave2 = cos(position.y * waveFrequency * 0.8 + time * waveSpeed * 1.2) * waveAmplitude * 0.7;
                float wave3 = sin((position.x + position.y) * waveFrequency * 0.6 + time * waveSpeed * 0.9) * waveAmplitude * 0.5;
                
                // Combine waves with gentle mouse influence
                float combinedWave = (wave1 + wave2 + wave3) * (1.0 + mouseEffect);
                
                // Apply wave displacement primarily to Z axis for undulation
                vec3 pos = position;
                pos.z += combinedWave;
                
                // Add some XY movement for more organic feel
                pos.x += sin(position.y * waveFrequency * 2.0 + time * waveSpeed * 0.5) * waveAmplitude * 0.3;
                pos.y += cos(position.x * waveFrequency * 1.5 + time * waveSpeed * 0.7) * waveAmplitude * 0.2;
                
                vWaveIntensity = abs(combinedWave) / waveAmplitude;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 lineColor;
              uniform float currentPhase;
              uniform float time;
              
              varying vec3 vPosition;
              varying float vWaveIntensity;
              varying float vMouseDistance;
              
              void main() {
                vec3 color = lineColor;
                
                // Phase-based color variations
                if (currentPhase < 1.0) {
                  // Topographical phase - classic topo map colors (browns/greens)
                  vec3 topoBase = vec3(0.4, 0.3, 0.2); // Brown base like real topo maps
                  vec3 topoHighlight = vec3(0.2, 0.6, 0.3); // Green for elevation lines
                  
                  // Create contour line effect based on position
                  float contourPattern = sin(vPosition.x * 0.3 + vPosition.y * 0.2) * 0.5 + 0.5;
                  color = mix(topoBase, topoHighlight, contourPattern);
                  
                  // Add wave intensity for sound wave effect
                  color = mix(color, vec3(0.6, 0.5, 0.3), vWaveIntensity * 0.3);
                } else if (currentPhase < 2.0) {
                  // Mountain phase - electric blue
                  color = vec3(0.1, 0.3, 0.45);
                  color = mix(color, vec3(0.3, 0.6, 1.0), vWaveIntensity * 0.5);
                } else if (currentPhase < 3.0) {
                  // Network phase - glowing cyan
                  color = vec3(0.0, 1.0, 1.0);
                  color = mix(color, vec3(0.5, 1.0, 1.0), vWaveIntensity * 0.6);
                } else {
                  // Cellular phase - organic green
                  color = vec3(0.0, 1.0, 0.5);
                  color = mix(color, vec3(0.3, 1.0, 0.7), vWaveIntensity * 0.5);
                }
                
                // Add subtle mouse proximity glow
                float mouseGlow = exp(-vMouseDistance / 30.0) * 0.1; // Much more subtle
                color += mouseGlow * vec3(0.8, 0.9, 1.0); // Softer blue-white glow
                
                // Add wave-based brightness variation
                float brightness = 0.8 + vWaveIntensity * 0.4;
                color *= brightness;
                
                gl_FragColor = vec4(color, 1.0);
              }
            `,
            transparent: false
          })
          console.log('✅ Using shader material with sound wave undulation and mouse interaction')
          
          // Try creating shader material with error handling (disabled)
          /*let lineMaterial
          try {
            lineMaterial = new THREE.ShaderMaterial({
              uniforms: {
                time: { value: 0.0 },
                phaseProgress: { value: 0.0 },
                currentPhase: { value: 0.0 },
                lineColor: { value: new THREE.Color(0x0D4F5C) },
                glowColor: { value: new THREE.Color(0x1B4F72) }
              },
              vertexShader: `
                uniform float time;
                uniform float phaseProgress;
                uniform float currentPhase;
                
                void main() {
                  vec3 pos = position;
                  
                  // Simple vertex animation
                  pos.z += sin(pos.x * 0.1 + time * 2.0) * 0.5;
                  
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
              `,
              fragmentShader: `
                uniform vec3 lineColor;
                uniform vec3 glowColor;
                uniform float currentPhase;
                
                void main() {
                  vec3 color = lineColor;
                  
                  if (currentPhase < 1.0) {
                    color = mix(lineColor, glowColor, 0.3);
                  } else if (currentPhase < 2.0) {
                    color = lineColor;
                  } else if (currentPhase < 3.0) {
                    color = glowColor;
                  } else {
                    color = mix(lineColor, glowColor, 0.6);
                  }
                  
                  gl_FragColor = vec4(color, 0.8);
                }
              `,
              transparent: true
            })
            console.log('✅ Shader material created successfully')
          } catch (error) {
            console.error('❌ Shader creation failed:', error)
            // Fallback to basic material
            lineMaterial = new THREE.LineBasicMaterial({
              color: 0x1B4F72,
              transparent: false,
              opacity: 1.0
            })
            console.log('🔄 Using fallback basic material')
          }*/
          
          const line = new THREE.Line(lineGeometry, lineMaterial)
          
          // Check if shader compiled successfully (disabled for basic materials)
          /*if (lineMaterial.isShaderMaterial) {
            // Force compilation to check for errors
            const renderer = this.sceneManager.getRenderer()
            if (renderer) {
              try {
                renderer.compile(this.scene, this.sceneManager.getCamera())
              } catch (shaderError) {
                console.error('❌ Shader compilation error:', shaderError)
                // Replace with basic material if shader failed
                line.material = new THREE.LineBasicMaterial({
                  color: 0x1B4F72,
                  transparent: false,
                  opacity: 1.0
                })
                console.log('🔄 Replaced failed shader with basic material')
              }
            }
          }*/
          
          this.morphingSystem.lines.push({
            mesh: line,
            startVertexId: i,
            endVertexId: connectionId,
            geometry: lineGeometry
          })
          
          this.scene.add(line)
          
          // Debug: Log each line creation
          if (this.morphingSystem.lines.length <= 5) {
            console.log(`✅ Created line ${this.morphingSystem.lines.length}: from vertex ${i} to ${connectionId}`)
            console.log(`   Material type: ${lineMaterial.constructor.name}`)
            console.log(`   Start pos: (${positions[0].toFixed(1)}, ${positions[1].toFixed(1)}, ${positions[2].toFixed(1)})`)
            console.log(`   End pos: (${positions[3].toFixed(1)}, ${positions[4].toFixed(1)}, ${positions[5].toFixed(1)})`)
          }
        }
      })
    })
    
    console.log(`✅ Morphing lines creation complete:`)
    console.log(`   Total lines created: ${this.morphingSystem.lines.length}`)
    console.log(`   Total scene children after morphing lines: ${this.scene.children.length}`)
    console.log(`   Lines array length: ${this.morphingSystem.lines.length}`)
    
    // Debug: Verify some lines exist and are added to scene
    if (this.morphingSystem.lines.length > 0) {
      const firstLine = this.morphingSystem.lines[0]
      console.log(`   First line material: ${firstLine.mesh.material.constructor.name}`)
      
      // Check if material has color property (basic materials) or uniforms (shader materials)
      if (firstLine.mesh.material.color) {
        console.log(`   First line color: ${firstLine.mesh.material.color.getHex().toString(16)}`)
      } else if (firstLine.mesh.material.uniforms && firstLine.mesh.material.uniforms.lineColor) {
        console.log(`   First line shader color: teal from uniforms`)
      }
      
      console.log(`   First line in scene: ${this.scene.children.includes(firstLine.mesh)}`)
    } else {
      console.warn('⚠️ No morphing lines were created!')
    }
  }

  calculateAllTargetPositions() {
    const vertices = this.morphingSystem.vertices
    
    vertices.forEach((vertex, i) => {
      const base = vertex.basePosition
      const { gridX, gridY } = vertex
      const pointsPerSide = 12
      
      // Phase 1: True 2D topographical map (completely flat with contour line patterns)
      // Keep it completely flat like a real topographical map
      this.morphingSystem.targetPositions.topographical[i] = new THREE.Vector3(
        base.x, base.y, 0 // Completely flat for 2D map appearance
      )
      
      // Phase 2: Dramatic 3D Mountain peaks (realistic mountain range silhouette)
      let mountainHeight = this.getOrganicElevation(base.x, base.y) * 1.8
      
      // Create realistic mountain ridges and valleys
      const ridgePattern = Math.sin(base.x * 0.02) * Math.cos(base.y * 0.015) * 25
      const valleyPattern = -Math.abs(Math.sin(base.x * 0.018 + base.y * 0.022)) * 12
      mountainHeight += ridgePattern + valleyPattern
      
      // Add some dramatic peaks
      if (Math.abs(base.x) < 30 && Math.abs(base.y) < 20) {
        mountainHeight += Math.exp(-((base.x * base.x + base.y * base.y) / 800)) * 35
      }
      
      this.morphingSystem.targetPositions.mountain[i] = new THREE.Vector3(
        base.x, base.y, mountainHeight
      )
      
      // Phase 3: Indra's Net (true interconnected holographic web pattern)
      // Create multiple layered spheres for a more complex network
      const layerCount = 3
      const layer = Math.floor(i / (vertices.length / layerCount))
      const baseRadius = 45 + layer * 20
      
      // Use grid coordinates for more organized distribution
      const phi = (gridY / (pointsPerSide - 1)) * Math.PI // 0 to π
      const theta = (gridX / (pointsPerSide - 1)) * Math.PI * 2 // 0 to 2π
      
      // Add some variation to avoid perfect sphere
      const radiusVariation = 1 + Math.sin(phi * 3) * Math.cos(theta * 2) * 0.3
      const finalRadius = baseRadius * radiusVariation
      
      // Calculate spherical coordinates with flowing Z displacement
      const netX = Math.sin(phi) * Math.cos(theta) * finalRadius
      const netY = Math.sin(phi) * Math.sin(theta) * finalRadius
      const netZ = Math.cos(phi) * finalRadius + Math.sin(theta * 4 + phi * 3) * 8
      
      this.morphingSystem.targetPositions.network[i] = new THREE.Vector3(netX, netY, netZ)
      
      // Phase 4: Cellular division (realistic cellular clusters with mitosis)
      const clusterCount = 4
      const clusterId = Math.floor(i / (vertices.length / clusterCount))
      
      // Create realistic cell cluster positions
      const clusterAngle = (clusterId / clusterCount) * Math.PI * 2
      const clusterDistance = 30 + clusterId * 8
      
      // Main cluster center (parent cell location)
      const clusterCenterX = Math.cos(clusterAngle) * clusterDistance
      const clusterCenterY = Math.sin(clusterAngle) * clusterDistance
      const clusterCenterZ = Math.sin(clusterAngle * 2) * 10
      
      // Create realistic cellular structure within cluster
      const vertexInCluster = i % Math.floor(vertices.length / clusterCount)
      const cellRadius = 12 + Math.sin(vertexInCluster * 0.8) * 5
      
      // Organic distribution within cell cluster (like organelles)
      const cellAngle = (vertexInCluster * 2.4) % (Math.PI * 2)  // Varied angles
      const cellDistance = Math.random() * cellRadius
      
      // Add cellular division effect - split clusters as if undergoing mitosis
      const divisionOffset = clusterId % 2 === 0 ? -8 : 8
      
      this.morphingSystem.targetPositions.cellular[i] = new THREE.Vector3(
        clusterCenterX + Math.cos(cellAngle) * cellDistance + divisionOffset,
        clusterCenterY + Math.sin(cellAngle) * cellDistance,
        clusterCenterZ + (Math.random() - 0.5) * 8
      )
    })
  }

  createLowPolyMountains() {
    // Create low poly mountain terrain that appears during phase 2
    const geometry = new THREE.PlaneGeometry(160, 160, 24, 24) // Low poly with fewer vertices
    
    // Generate mountain landscape with low poly aesthetic
    this.generateLowPolyHeightMap(geometry)
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunPosition: { value: new THREE.Vector3(-150, 30, 50) },
        sunColor: { value: new THREE.Color(0xFFDD88) },
        mountainColor: { value: new THREE.Color(0x444444) }, // Monochrome gray
        shadowColor: { value: new THREE.Color(0x222222) },
        lightIntensity: { value: 0.0 },
        morphProgress: { value: 0.0 }
      },
      vertexShader: `
        uniform float time;
        uniform vec3 sunPosition;
        uniform float morphProgress;
        
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vShadow;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vElevation = position.z;
          
          // Scale mountains up during morph
          vec3 pos = position;
          pos.z *= morphProgress; // Mountains rise from flat
          
          // Calculate world position for lighting  
          vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          vWorldPosition = worldPos;
          
          // Calculate shadow from sun position
          vec3 sunDirection = normalize(sunPosition - worldPos);
          vShadow = max(0.2, dot(normal, sunDirection));
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunPosition;
        uniform vec3 sunColor;
        uniform vec3 mountainColor;
        uniform vec3 shadowColor;
        uniform float lightIntensity;
        uniform float time;
        
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vShadow;
        
        void main() {
          // Monochrome mountain color based on elevation
          float elevationFactor = smoothstep(-15.0, 25.0, vElevation);
          vec3 baseColor = mix(vec3(0.3, 0.3, 0.3), vec3(0.7, 0.7, 0.7), elevationFactor);
          
          // Apply shadows
          vec3 color = baseColor * vShadow;
          
          // Add sun lighting
          vec3 sunDirection = normalize(sunPosition - vWorldPosition);
          float sunDot = max(0.0, dot(vNormal, sunDirection));
          color += sunColor * sunDot * lightIntensity * 0.3;
          
          // Add atmospheric rim lighting  
          float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
          color += rim * sunColor * lightIntensity * 0.2;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    })
    
    this.mountainTerrain = new THREE.Mesh(geometry, material)
    this.mountainTerrain.rotation.x = -Math.PI / 2
    this.mountainTerrain.visible = false // Hidden initially
    this.scene.add(this.mountainTerrain)
  }
  
  generateLowPolyHeightMap(geometry) {
    const vertices = geometry.attributes.position.array
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      
      // Create dramatic mountain landscape with low poly aesthetic
      let height = 0
      
      // Main mountain ridges - fewer, more dramatic peaks for low poly look
      height += Math.sin(x * 0.015) * Math.cos(y * 0.02) * 20
      height += Math.sin(x * 0.008 + y * 0.012) * 15
      
      // Secondary peaks
      height += Math.sin(x * 0.03) * Math.cos(y * 0.025) * 12
      
      // Sharp valleys for low poly aesthetic
      height += Math.abs(Math.sin(x * 0.04)) * -8
      height += Math.abs(Math.cos(y * 0.035)) * -6
      
      // Add some random variation but keep it low poly
      height += (Math.round(Math.random() * 4) - 2) * 2
      
      vertices[i + 2] = height
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  }

  createTopographicalMap_OLD() {
    // Create 2D topographical lines that undulate like soundwaves
    this.topographicalLines = []
    
    // Create both horizontal and vertical contour lines for a proper topographical look
    for (let i = 0; i < this.config.lineCount; i++) {
      // Horizontal contour lines
      const hLineGeometry = new THREE.BufferGeometry()
      const hLinePoints = []
      const pointCount = 200
      
      // Create contour lines at different elevations
      const baseElevation = (i / this.config.lineCount) * 40 - 20
      
      for (let j = 0; j < pointCount; j++) {
        const x = (j / (pointCount - 1)) * this.config.mapSize - this.config.mapSize / 2
        // Create more realistic contour line shape with multiple frequencies
        const contourVariation = Math.sin(x * 0.02) * 3 + Math.sin(x * 0.05) * 1.5 + Math.sin(x * 0.1) * 0.8
        const y = baseElevation + contourVariation
        const z = 0 // Start flat (2D view)
        
        hLinePoints.push(new THREE.Vector3(x, y, z))
      }
      
      hLineGeometry.setFromPoints(hLinePoints)
      
      // Create material that will handle soundwave undulation
      const hLineMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mousePosition: { value: new THREE.Vector2() },
          soundwaveIntensity: { value: 1.0 },
          lineIndex: { value: i / this.config.lineCount },
          topographyColor: { value: new THREE.Color(0x0D4F5C) },
          glowColor: { value: new THREE.Color(0x1B4F72) },
          isVertical: { value: 0.0 }
        },
        vertexShader: `
          uniform float time;
          uniform vec2 mousePosition;
          uniform float soundwaveIntensity;
          uniform float lineIndex;
          uniform float isVertical;
          
          varying vec3 vPosition;
          varying float vWave;
          varying float vMouseDistance;
          varying float vIntensity;
          varying float vElevation;
          
          void main() {
            vPosition = position;
            
            // Create organic, asymmetrical mountainous topology (like reference image)
            // Use more complex, irregular patterns for natural look
            float noise1 = sin(position.x * 0.0123 + position.y * 0.0087) * 10.0;
            float noise2 = cos(position.x * 0.0234 - position.y * 0.0156) * 7.0;
            float noise3 = sin(position.x * 0.0345 + position.y * 0.0267 + 3.14159) * 5.0;
            
            // Irregular ridges and valleys (more organic)
            float ridgeX = sin(position.x * 0.0167 + 1.23) * cos(position.y * 0.0134 + 2.34) * 6.0;
            float ridgeY = cos(position.x * 0.0198 - 0.87) * sin(position.y * 0.0176 - 1.56) * 4.5;
            float valleys = sin(position.x * 0.0243 + position.y * 0.0187 + 4.67) * 3.5;
            
            // Small scale irregularities
            float detail1 = sin(position.x * 0.0456 + position.y * 0.0378 + time * 0.1) * 2.0;
            float detail2 = cos(position.x * 0.0567 - position.y * 0.0423 - time * 0.08) * 1.5;
            
            // Topographical contour elevation (highly irregular)
            float baseElevation = noise1 + noise2 + noise3 + ridgeX + ridgeY + valleys + detail1 + detail2;
            
            // Living soundwaves that flow organically across the topology
            float flow1 = sin(position.x * 0.08 + time * 1.8 + lineIndex * 1.234) * soundwaveIntensity * 1.2;
            float flow2 = cos(position.y * 0.06 + time * 1.3 - lineIndex * 0.789) * soundwaveIntensity * 0.9;
            float flow3 = sin((position.x * 0.7 + position.y * 1.3) * 0.05 + time * 2.1 + lineIndex * 0.456) * soundwaveIntensity * 0.7;
            
            // Organic breathing patterns
            float breathing = sin(time * 0.7 + baseElevation * 0.08 + position.x * 0.02) * soundwaveIntensity * 0.4;
            float pulse = cos(time * 1.1 + length(position.xy) * 0.03 + position.y * 0.015) * soundwaveIntensity * 0.25;
            
            // NO MOUSE INTERACTION - remove spotlight effect
            vMouseDistance = 0.0; // Set to 0 to disable mouse effects
            
            // Combine all living wave components (no mouse)
            float livingWaves = flow1 + flow2 + flow3 + breathing + pulse;
            
            vec3 pos = position;
            // Z displacement represents both topology and living soundwaves
            pos.z += (baseElevation * 0.25 + livingWaves * 1.2);
            
            vWave = livingWaves;
            vIntensity = abs(livingWaves) * 0.3 + 0.7;
            vElevation = baseElevation;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topographyColor;
          uniform vec3 glowColor;
          
          varying vec3 vPosition;
          varying float vWave;
          varying float vMouseDistance;
          varying float vIntensity;
          varying float vElevation;
          
          void main() {
            // Color based on elevation (like real topographical maps)
            float elevationRange = 30.0; // Increased range for more organic variation
            float elevationFactor = (vElevation + elevationRange * 0.5) / elevationRange;
            elevationFactor = clamp(elevationFactor, 0.0, 1.0);
            
            // More natural topographical colors with organic variation
            vec3 valleyColor = topographyColor * 0.6;      // Deep valleys
            vec3 lowColor = topographyColor * 0.8;         // Low areas
            vec3 midColor = topographyColor * 1.0;         // Mid elevation
            vec3 highColor = topographyColor * 1.2;        // High areas
            vec3 peakColor = glowColor * 0.8;              // Peaks
            
            // Multi-step elevation coloring for more realism
            vec3 elevationColor;
            if (elevationFactor < 0.2) {
              elevationColor = mix(valleyColor, lowColor, elevationFactor * 5.0);
            } else if (elevationFactor < 0.5) {
              elevationColor = mix(lowColor, midColor, (elevationFactor - 0.2) * 3.33);
            } else if (elevationFactor < 0.8) {
              elevationColor = mix(midColor, highColor, (elevationFactor - 0.5) * 3.33);
            } else {
              elevationColor = mix(highColor, peakColor, (elevationFactor - 0.8) * 5.0);
            }
            
            // Living soundwave intensity overlay
            float waveIntensity = vIntensity;
            vec3 waveGlow = glowColor * waveIntensity * 0.3;
            
            // Combine elevation and wave colors
            vec3 color = elevationColor + waveGlow;
            
            // Enhanced contour line emphasis with organic variation
            float contourFreq1 = abs(sin(vElevation * 1.8)) * 0.2;
            float contourFreq2 = abs(cos(vElevation * 2.3 + 1.57)) * 0.15;
            color += (contourFreq1 + contourFreq2) * glowColor;
            
            // NO MOUSE GLOW - completely removed spotlight effect
            
            // Alpha varies with elevation and wave intensity naturally
            float alpha = 0.75 + elevationFactor * 0.15 + waveIntensity * 0.1;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true
      })
      
      const hLine = new THREE.Line(hLineGeometry, hLineMaterial)
      this.topographicalLines.push(hLine)
      this.scene.add(hLine)
      
      // Add some vertical contour lines for cross-hatching effect
      if (i % 3 === 0) { // Only every 3rd line to avoid clutter
        const vLineGeometry = new THREE.BufferGeometry()
        const vLinePoints = []
        
        const baseX = (i / this.config.lineCount) * this.config.mapSize - this.config.mapSize / 2
        
        for (let k = 0; k < pointCount; k++) {
          const y = (k / (pointCount - 1)) * this.config.mapSize - this.config.mapSize / 2
          const contourVariation = Math.sin(y * 0.03) * 2 + Math.sin(y * 0.08) * 1
          const x = baseX + contourVariation
          const z = 0
          
          vLinePoints.push(new THREE.Vector3(x, y, z))
        }
        
        vLineGeometry.setFromPoints(vLinePoints)
        
        const vLineMaterial = hLineMaterial.clone()
        vLineMaterial.uniforms.isVertical.value = 1.0
        vLineMaterial.uniforms.lineIndex.value = (i / this.config.lineCount) + 0.5
        
        const vLine = new THREE.Line(vLineGeometry, vLineMaterial)
        this.topographicalLines.push(vLine)
        this.scene.add(vLine)
      }
    }
  }

  createMountainTerrain() {
    // Create 3D mountain terrain that the 2D lines will transform into
    const geometry = new THREE.PlaneGeometry(
      this.config.mapSize,
      this.config.mapSize,
      this.config.mountainSegments,
      this.config.mountainSegments
    )
    
    // Generate mountain landscape
    this.generateMountainHeightMap(geometry)
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunPosition: { value: new THREE.Vector3(-100, 20, 50) },
        sunColor: { value: new THREE.Color(0xFFAA44) },
        mountainColor: { value: new THREE.Color(0x0D4F5C) }, // Same as topographical lines
        shadowColor: { value: new THREE.Color(0x061018) },
        lightRays: { value: 0.0 },
        morphProgress: { value: 0.0 } // For smooth 2D to 3D transition
      },
      vertexShader: `
        uniform float time;
        uniform vec3 sunPosition;
        
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vShadow;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vElevation = position.z;
          
          // Calculate shadow from sun position
          vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vWorldPosition = worldPos;
          
          vec3 sunDirection = normalize(sunPosition - worldPos);
          vShadow = max(0.0, dot(normal, sunDirection));
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunPosition;
        uniform vec3 sunColor;
        uniform vec3 mountainColor;
        uniform vec3 shadowColor;
        uniform float lightRays;
        uniform float time;
        
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vShadow;
        
        void main() {
          // Enhanced mountain color with altitude-based variation
          float elevationFactor = smoothstep(-20.0, 20.0, vElevation);
          vec3 lowColor = vec3(0.1, 0.2, 0.3); // Dark blue for valleys
          vec3 midColor = mountainColor; // Main mountain color
          vec3 highColor = vec3(0.8, 0.9, 1.0); // Light blue-white for peaks
          
          vec3 baseColor;
          if (elevationFactor < 0.5) {
            baseColor = mix(lowColor, midColor, elevationFactor * 2.0);
          } else {
            baseColor = mix(midColor, highColor, (elevationFactor - 0.5) * 2.0);
          }
          
          // Enhanced sun lighting calculation
          vec3 sunDirection = normalize(sunPosition - vWorldPosition);
          float sunDot = max(0.0, dot(vNormal, sunDirection));
          
          // Create softer shadows with ambient occlusion
          float ambientOcclusion = 0.3 + vShadow * 0.7;
          vec3 color = baseColor * ambientOcclusion;
          
          // Add sun highlights with distance falloff
          float sunDistance = length(sunPosition - vWorldPosition);
          float sunIntensity = 1.0 / (1.0 + sunDistance * 0.001);
          color += sunColor * sunDot * sunIntensity * 0.4;
          
          // Enhanced volumetric light ray effects
          float rayPattern1 = sin(vWorldPosition.x * 0.05 + time * 0.5) * sin(vWorldPosition.y * 0.03 + time * 0.3);
          float rayPattern2 = cos(vWorldPosition.x * 0.08 - time * 0.4) * cos(vWorldPosition.y * 0.06 - time * 0.2);
          float combinedRays = (rayPattern1 + rayPattern2) * 0.5;
          
          // Only show rays where sun is visible and on elevated terrain
          float rayVisibility = smoothstep(-0.3, 0.3, combinedRays) * elevationFactor * sunDot;
          color += sunColor * rayVisibility * lightRays * 0.3;
          
          // Add atmospheric perspective (distance fog)
          float fogFactor = 1.0 - exp(-sunDistance * 0.002);
          vec3 fogColor = sunColor * 0.3;
          color = mix(color, fogColor, fogFactor * 0.4);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    })
    
    this.mountainTerrain = new THREE.Mesh(geometry, material)
    this.mountainTerrain.rotation.x = -Math.PI / 2
    this.mountainTerrain.visible = false // Hidden initially
    this.scene.add(this.mountainTerrain)
  }

  generateMountainHeightMap(geometry) {
    const vertices = geometry.attributes.position.array
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      
      // Create mountain landscape with multiple peaks and valleys
      let height = 0
      
      // Main mountain ridges
      height += Math.sin(x * 0.02) * Math.cos(y * 0.02) * 15
      height += Math.sin(x * 0.01 + y * 0.01) * 10
      
      // Secondary peaks
      height += Math.sin(x * 0.05) * Math.cos(y * 0.03) * 8
      
      // Fine details
      height += Math.sin(x * 0.1) * Math.cos(y * 0.1) * 3
      height += Math.random() * 2 - 1 // Roughness
      
      vertices[i + 2] = height
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  }

  createSunSystem() {
    // Create sun
    const sunGeometry = new THREE.SphereGeometry(5, 16, 16)
    const sunMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunIntensity: { value: 1.0 }
      },
      vertexShader: `
        uniform float time;
        
        void main() {
          vec3 pos = position * (1.0 + sin(time * 3.0) * 0.1);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float sunIntensity;
        
        void main() {
          vec3 sunColor = vec3(1.0, 0.7, 0.3) * sunIntensity;
          float pulse = sin(time * 2.0) * 0.2 + 0.8;
          gl_FragColor = vec4(sunColor * pulse, 1.0);
        }
      `
    })
    
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial)
    this.sun.position.set(-100, 20, 50)
    this.sun.visible = false
    this.scene.add(this.sun)
    
    // Create directional light for sun
    this.sunLight = new THREE.DirectionalLight(0xFFAA44, 0.8)
    this.sunLight.position.copy(this.sun.position)
    this.sunLight.castShadow = true
    this.sunLight.visible = false
    this.scene.add(this.sunLight)
  }

  createIndrasNet() {
    // Create holographic fractal network
    this.indrasNet = {
      nodes: [],
      connections: [],
      group: new THREE.Group()
    }
    
    // Generate nodes in 3D space
    for (let i = 0; i < this.config.netNodeCount; i++) {
      const node = this.createNetNode(i)
      this.indrasNet.nodes.push(node)
      this.indrasNet.group.add(node)
    }
    
    // Create connections between nodes
    this.createNetConnections()
    
    this.indrasNet.group.visible = false
    this.scene.add(this.indrasNet.group)
  }

  createNetNode(index) {
    const geometry = new THREE.IcosahedronGeometry(0.5, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        nodeIndex: { value: index },
        hologramIntensity: { value: 0.8 },
        coreColor: { value: new THREE.Color(0x0D4F5C) },
        glowColor: { value: new THREE.Color(0xF8F9FA) }
      },
      vertexShader: `
        uniform float time;
        uniform float nodeIndex;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vPulse;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          float pulse = sin(time * 2.0 + nodeIndex * 0.5) * 0.5 + 0.5;
          vPulse = pulse;
          
          vec3 pos = position;
          pos += normal * sin(time * 4.0 + nodeIndex) * 0.1;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 coreColor;
        uniform vec3 glowColor;
        uniform float hologramIntensity;
        uniform float time;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vPulse;
        
        void main() {
          // Multi-layered holographic interference patterns
          float pattern1 = sin(vPosition.y * 25.0 + time * 2.0) * sin(vPosition.x * 20.0 + time * 1.5);
          float pattern2 = cos(vPosition.z * 30.0 + time * 1.8) * cos(vPosition.x * 18.0 - time * 1.2);
          float pattern3 = sin(length(vPosition.xy) * 15.0 + time * 2.5);
          
          // Fractal-like interference combining multiple frequencies
          float combinedPattern = (pattern1 + pattern2 * 0.7 + pattern3 * 0.5) / 2.2;
          combinedPattern = combinedPattern * 0.4 + 0.6;
          
          // Create data flow lines across the surface
          float dataFlow = sin(vPosition.y * 40.0 + time * 5.0) * 
                          smoothstep(-0.1, 0.1, sin(vPosition.x * 30.0));
          dataFlow = abs(dataFlow) * 0.3;
          
          // Enhanced color mixing with more dynamic range
          vec3 patternColor = mix(coreColor, glowColor, combinedPattern * hologramIntensity);
          vec3 flowColor = glowColor * 1.5;
          vec3 color = mix(patternColor, flowColor, dataFlow);
          
          // Apply pulse modulation
          color *= vPulse;
          
          // Enhanced Fresnel effect for hologram edge glow
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          color += fresnel * glowColor * 0.5;
          
          // Holographic flicker effect
          float flicker = sin(time * 20.0) * 0.05 + 0.95;
          color *= flicker;
          
          // Variable transparency based on viewing angle and patterns
          float alpha = (0.4 + fresnel * 0.4 + combinedPattern * 0.2) * hologramIntensity;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    
    // Position nodes in 3D space (will be animated)
    const phi = Math.acos(-1 + (2 * index) / this.config.netNodeCount)
    const theta = Math.sqrt(this.config.netNodeCount * Math.PI) * phi
    
    mesh.position.setFromSphericalCoords(30, phi, theta)
    mesh.userData = { originalPosition: mesh.position.clone() }
    
    return mesh
  }

  createNetConnections() {
    // Create flowing connections between nearby nodes
    for (let i = 0; i < this.indrasNet.nodes.length; i++) {
      for (let j = i + 1; j < this.indrasNet.nodes.length; j++) {
        const distance = this.indrasNet.nodes[i].position.distanceTo(this.indrasNet.nodes[j].position)
        
        if (distance < 20 && Math.random() < 0.3) {
          const connection = this.createNetConnection(
            this.indrasNet.nodes[i].position,
            this.indrasNet.nodes[j].position
          )
          this.indrasNet.connections.push(connection)
          this.indrasNet.group.add(connection)
        }
      }
    }
  }

  createNetConnection(posA, posB) {
    const curve = new THREE.QuadraticBezierCurve3(
      posA,
      posA.clone().add(posB).multiplyScalar(0.5),
      posB
    )
    
    const geometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        flowSpeed: { value: 2.0 },
        connectionColor: { value: new THREE.Color(0x0D4F5C) }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float flowSpeed;
        uniform vec3 connectionColor;
        varying vec2 vUv;
        
        void main() {
          float flow = sin(vUv.x * 6.28 - time * flowSpeed) * 0.5 + 0.5;
          gl_FragColor = vec4(connectionColor, flow * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    return new THREE.Mesh(geometry, material)
  }

  createCellSystem() {
    // Create realistic cell division system with mitosis stages
    this.cellSystem = {
      cells: [],
      group: new THREE.Group(),
      divisionStage: 0, // Track overall division progress
      newCells: [] // Track newly divided cells
    }
    
    // Start with initial cells that will undergo division
    for (let i = 0; i < 4; i++) {
      const cell = this.createCell(i)
      this.cellSystem.cells.push(cell)
      this.cellSystem.group.add(cell.membrane)
      this.cellSystem.group.add(cell.nucleus)
      
      // Add organelles for realism
      if (cell.organelles) {
        cell.organelles.forEach(organelle => {
          this.cellSystem.group.add(organelle)
        })
      }
    }
    
    this.cellSystem.group.visible = false
    this.scene.add(this.cellSystem.group)
  }

  createCell(index) {
    // Create realistic cell membrane with division capability
    const membraneRadius = 2.5 + Math.random() * 0.5
    const membraneGeometry = new THREE.SphereGeometry(membraneRadius, 20, 20)
    
    const membraneMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cellIndex: { value: index },
        divisionProgress: { value: 0.0 },
        mitosisStage: { value: 0.0 }, // 0=interphase, 1=prophase, 2=metaphase, 3=anaphase, 4=telophase
        membraneColor: { value: new THREE.Color(0x0D4F5C) },
        divisionColor: { value: new THREE.Color(0x1B4F72) }
      },
      vertexShader: `
        uniform float time;
        uniform float cellIndex;
        uniform float divisionProgress;
        uniform float mitosisStage;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vPulse;
        varying float vDivision;
        
        void main() {
          vNormal = normal;
          vPosition = position;
          vDivision = divisionProgress;
          
          vec3 pos = position;
          
          // Natural cell breathing/pulsing
          float breathe = sin(time * 0.8 + cellIndex) * 0.05 + 1.0;
          pos *= breathe;
          
          // Mitosis transformation effects
          if (divisionProgress > 0.0) {
            // Prophase: cell rounds up
            if (mitosisStage < 1.0) {
              pos *= 1.0 + divisionProgress * 0.1;
            }
            // Metaphase: cell elongates
            else if (mitosisStage < 2.0) {
              pos.y *= 1.0 + (mitosisStage - 1.0) * 0.3;
            }
            // Anaphase/Telophase: cell pinches and divides
            else if (mitosisStage < 4.0) {
              float pinch = (mitosisStage - 2.0) / 2.0;
              if (abs(position.y) < 0.3) {
                pos.x *= 1.0 - pinch * 0.8; // Pinch in the middle
                pos.z *= 1.0 - pinch * 0.8;
              }
            }
          }
          
          vPulse = breathe;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 membraneColor;
        uniform vec3 divisionColor;
        uniform float time;
        uniform float mitosisStage;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vPulse;
        varying float vDivision;
        
        void main() {
          // Base membrane color
          vec3 color = membraneColor;
          
          // Division activity colors
          if (vDivision > 0.0) {
            float activity = sin(time * 4.0 + vPosition.y * 10.0) * 0.5 + 0.5;
            color = mix(color, divisionColor, vDivision * activity * 0.6);
          }
          
          // Fresnel effect for cell membrane realism
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          color += fresnel * 0.3;
          
          // Transparency varies with division state
          float alpha = 0.6 + fresnel * 0.3 + vDivision * 0.2;
          
          gl_FragColor = vec4(color * vPulse, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })
    
    const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial)
    
    // Create nucleus with division capability
    const nucleusRadius = membraneRadius * 0.3
    const nucleusGeometry = new THREE.SphereGeometry(nucleusRadius, 12, 12)
    const nucleusMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        divisionProgress: { value: 0.0 },
        mitosisStage: { value: 0.0 },
        nucleusColor: { value: new THREE.Color(0x1B4F72) },
        chromatinColor: { value: new THREE.Color(0xF8F9FA) }
      },
      vertexShader: `
        uniform float time;
        uniform float divisionProgress;
        uniform float mitosisStage;
        
        varying vec3 vPosition;
        varying float vDivision;
        
        void main() {
          vPosition = position;
          vDivision = divisionProgress;
          
          vec3 pos = position;
          
          // Nucleus changes during division
          if (divisionProgress > 0.0) {
            // During metaphase, nucleus elongates
            if (mitosisStage > 1.0 && mitosisStage < 3.0) {
              pos.y *= 1.0 + (mitosisStage - 1.0) * 0.5;
            }
            // During telophase, nucleus starts to split
            if (mitosisStage > 3.0) {
              float split = mitosisStage - 3.0;
              pos.y += sign(position.y) * split * 0.8;
            }
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 nucleusColor;
        uniform vec3 chromatinColor;
        uniform float time;
        uniform float mitosisStage;
        
        varying vec3 vPosition;
        varying float vDivision;
        
        void main() {
          vec3 color = nucleusColor;
          
          // Show chromatin/chromosome activity during division
          if (vDivision > 0.0) {
            float chromatin = sin(vPosition.x * 20.0 + time * 3.0) * 
                            cos(vPosition.y * 15.0 + time * 2.0) * 
                            sin(vPosition.z * 25.0 + time * 4.0);
            chromatin = abs(chromatin) * vDivision;
            color = mix(color, chromatinColor, chromatin * 0.8);
          }
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true
    })
    
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial)
    
    // Create organelles (mitochondria, etc.)
    const organelles = []
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      const organelle = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 6),
        new THREE.MeshBasicMaterial({ 
          color: 0x2C5F41, 
          transparent: true, 
          opacity: 0.7 
        })
      )
      
      // Random position within cell
      const angle = Math.random() * Math.PI * 2
      const radius = (membraneRadius * 0.7) * Math.random()
      organelle.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * membraneRadius,
        Math.sin(angle) * radius
      )
      
      organelles.push(organelle)
    }
    
    // Position cells in space
    const angle = (index / 4) * Math.PI * 2
    const radius = 8 + Math.random() * 4
    membrane.position.set(
      Math.cos(angle) * radius, 
      (Math.random() - 0.5) * 6, 
      Math.sin(angle) * radius
    )
    nucleus.position.copy(membrane.position)
    
    organelles.forEach(organelle => {
      organelle.position.add(membrane.position)
    })
    
    return { 
      membrane, 
      nucleus, 
      organelles,
      divisionProgress: 0,
      mitosisStage: 0,
      age: 0,
      hasCompleted: false,
      daughterCells: []
    }
  }

  setupMouseTracking() {
    document.addEventListener('mousemove', (event) => {
      this.onMouseMove(event)
    })
  }

  onMouseMove(event) {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Calculate smooth mouse influence based on movement
    const currentTime = performance.now()
    if (this.lastMouseMoveTime && this.lastMousePosition) {
      const timeDelta = Math.max(currentTime - this.lastMouseMoveTime, 1) // Prevent division by zero
      const positionDelta = Math.sqrt(
        Math.pow(this.mousePosition.x - this.lastMousePosition.x, 2) +
        Math.pow(this.mousePosition.y - this.lastMousePosition.y, 2)
      )
      
      // Much gentler influence calculation to prevent strobing
      const rawInfluence = Math.min(positionDelta / (timeDelta * 0.01), 0.5) // Reduced max influence
      
      // Smooth the influence with exponential moving average to prevent flickering
      this.mouseInfluence = this.mouseInfluence * 0.7 + rawInfluence * 0.3
    } else {
      this.mouseInfluence = 0
    }
    
    this.lastMouseMoveTime = currentTime
    this.lastMousePosition = this.mousePosition.clone()
    
    // Update shader materials less frequently to reduce strobing
    if (this.morphingSystem && this.morphingSystem.lines) {
      // Only update every few frames to smooth the effect
      if (!this.lastUniformUpdate || currentTime - this.lastUniformUpdate > 16) { // ~60fps
        this.morphingSystem.lines.forEach(lineObj => {
          if (lineObj.mesh.material.uniforms) {
            lineObj.mesh.material.uniforms.mousePosition.value.copy(this.mousePosition)
            lineObj.mesh.material.uniforms.mouseInfluence.value = this.mouseInfluence
          }
        })
        this.lastUniformUpdate = currentTime
      }
    }
  }

  // Main progression update based on scroll
  updateProgression(scrollProgress) {
    // Divide scroll into 4 phases
    if (scrollProgress < 0.25) {
      // Phase 1: 2D Topographical soundwaves
      this.phase1Progress = scrollProgress * 4
      this.updatePhase1()
    } else if (scrollProgress < 0.5) {
      // Phase 2: 3D Mountain transformation
      this.phase1Progress = 1
      this.phase2Progress = (scrollProgress - 0.25) * 4
      this.updatePhase2()
    } else if (scrollProgress < 0.75) {
      // Phase 3: Indra's Net transformation
      this.phase2Progress = 1
      this.phase3Progress = (scrollProgress - 0.5) * 4
      this.updatePhase3()
    } else {
      // Phase 4: Cell division
      this.phase3Progress = 1
      this.phase4Progress = (scrollProgress - 0.75) * 4
      this.updatePhase4()
    }
  }

  updatePhase1() {
    console.log('Phase 1 update, progress:', this.phase1Progress)
    
    // Morphing system shows organic topographical contours
    if (this.morphingSystem && this.morphingSystem.lines.length > 0) {
      this.morphToPhase('topographical', this.phase1Progress)
      // Shader materials handle color automatically based on currentPhase uniform
    }
    
    // Phase 1: Clean topographical view - hide 3D elements
    if (this.mountainTerrain) this.mountainTerrain.visible = false
    if (this.sun) this.sun.visible = false
    if (this.sunLight) this.sunLight.visible = false
    
    // Camera stays top-down for topographical view (like looking at a real map)
    this.sceneManager.camera.position.set(0, 0, 120)
    this.sceneManager.camera.lookAt(0, 0, 0)
  }

  morphToPhase(phaseName, progress) {
    if (!this.morphingSystem || !this.morphingSystem.vertices) {
      console.warn('Morphing system not available')
      return
    }
    
    // Core morphing function with enhanced transition effects
    const vertices = this.morphingSystem.vertices
    const targetPositions = this.morphingSystem.targetPositions[phaseName]
    
    // Use different easing functions for different phases to reduce boring transitions
    let easedProgress
    switch(phaseName) {
      case 'topographical':
        easedProgress = this.easeOutQuart(progress) // Quick start, slower finish
        break
      case 'mountain':
        easedProgress = this.easeInOutBack(progress) // Dramatic swing with overshoot
        break
      case 'network':
        easedProgress = this.easeInOutElastic(progress) // Elastic web-like movement
        break
      case 'cellular':
        easedProgress = this.easeInQuart(progress) // Accelerating organic growth
        break
      default:
        easedProgress = this.easeInOutCubic(progress)
    }
    
    if (!targetPositions || targetPositions.length === 0) {
      console.warn('No target positions for phase', phaseName)
      return
    }
    
    // Enhanced morphing with phase-specific effects
    vertices.forEach((vertex, i) => {
      if (targetPositions[i]) {
        // Base morphing
        const morphSpeed = this.getMorphSpeedForPhase(phaseName, progress)
        vertex.currentPosition.lerpVectors(
          vertex.currentPosition,
          targetPositions[i],
          easedProgress * morphSpeed
        )
        
        // Add phase-specific transformation effects
        this.addPhaseSpecificEffects(vertex, phaseName, progress, i)
      }
    })
    
    // Update all line geometries with new vertex positions
    this.morphingSystem.lines.forEach(lineObj => {
      const positions = lineObj.geometry.attributes.position.array
      const startVertex = vertices[lineObj.startVertexId]
      const endVertex = vertices[lineObj.endVertexId]
      
      if (startVertex && endVertex && startVertex.currentPosition && endVertex.currentPosition) {
        // Update line endpoints
        positions[0] = startVertex.currentPosition.x
        positions[1] = startVertex.currentPosition.y
        positions[2] = startVertex.currentPosition.z
        positions[3] = endVertex.currentPosition.x
        positions[4] = endVertex.currentPosition.y
        positions[5] = endVertex.currentPosition.z
        
        lineObj.geometry.attributes.position.needsUpdate = true
      }
    })
  }
  
  getMorphSpeedForPhase(phaseName, progress) {
    // Different morph speeds to make transitions more interesting
    switch(phaseName) {
      case 'topographical': return 0.015 // Gentle emergence
      case 'mountain': return 0.035 // Rapid mountain formation
      case 'network': return 0.025 // Steady network assembly
      case 'cellular': return 0.04 // Quick cellular division
      default: return 0.02
    }
  }
  
  addPhaseSpecificEffects(vertex, phaseName, progress, vertexIndex) {
    // Add unique visual effects for each phase transformation
    const time = this.time
    
    switch(phaseName) {
      case 'topographical':
        // Gentle rippling effect like water settling
        const ripple = Math.sin(time * 2 + vertexIndex * 0.1) * progress * 0.5
        vertex.currentPosition.z += ripple
        break
        
      case 'mountain':
        // Tectonic upheaval effect
        if (progress > 0.3) {
          const upheaval = Math.sin(time * 1.5 + vertex.basePosition.x * 0.02) * 
                          Math.cos(time * 1.2 + vertex.basePosition.y * 0.015) * 
                          (progress - 0.3) * 3
          vertex.currentPosition.z += upheaval
        }
        break
        
      case 'network':
        // Pulsing network nodes effect
        const networkPulse = Math.sin(time * 3 + vertexIndex * 0.2) * progress * 2
        const pulseVector = vertex.currentPosition.clone().normalize().multiplyScalar(networkPulse)
        vertex.currentPosition.add(pulseVector)
        break
        
      case 'cellular':
        // Organic cellular breathing/growth
        if (progress > 0.2) {
          const breath = Math.sin(time * 2.5 + vertexIndex * 0.15) * (progress - 0.2) * 1.5
          vertex.currentPosition.multiplyScalar(1 + breath * 0.1)
        }
        break
    }
  }
  
  // Additional easing functions for more dynamic transitions
  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4)
  }
  
  easeInOutBack(t) {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  }
  
  easeInOutElastic(t) {
    const c5 = (2 * Math.PI) / 4.5
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
  }
  
  easeInQuart(t) {
    return t * t * t * t
  }

  updatePhase2() {
    // Seamless morph from topographical to 3D mountain wireframe + low poly terrain
    const progress = this.phase2Progress
    const easedProgress = this.easeInOutCubic(progress)
    
    // Morph lines to mountain wireframe positions
    this.morphToPhase('mountain', progress)
    // Shader materials handle color automatically based on currentPhase uniform
    
    // Show and animate low poly mountain terrain
    if (this.mountainTerrain) {
      this.mountainTerrain.visible = progress > 0.1
      if (this.mountainTerrain.material.uniforms) {
        this.mountainTerrain.material.uniforms.morphProgress.value = progress
        this.mountainTerrain.material.uniforms.lightIntensity.value = progress
      }
    }
    
    // Show and animate sun rising behind mountains
    if (this.sun) {
      this.sun.visible = progress > 0.2
      if (this.sunLight) this.sunLight.visible = progress > 0.2
      
      // Sun rises from behind mountains
      const sunAngle = progress * Math.PI * 0.6
      const sunDistance = 200
      const sunX = -sunDistance + (Math.cos(sunAngle) * 80)
      const sunY = Math.max(40, Math.sin(sunAngle) * 120 + 50)
      const sunZ = 30 + progress * 40
      
      this.sun.position.set(sunX, sunY, sunZ)
      if (this.sunLight) {
        this.sunLight.position.copy(this.sun.position)
        this.sunLight.intensity = progress * 0.8
      }
      
      // Update sun material brightness
      if (this.sun.material.uniforms) {
        this.sun.material.uniforms.sunIntensity.value = progress * 2.0 + 0.3
      }
      
      // Update mountain terrain sun position
      if (this.mountainTerrain?.material.uniforms) {
        this.mountainTerrain.material.uniforms.sunPosition.value.copy(this.sun.position)
      }
    }
    
    // Dramatic camera movement to reveal 3D mountain landscape
    const startCameraPos = { x: 0, y: 0, z: 120 }
    const endCameraPos = { x: -40, y: -60, z: 90 } // More dramatic angle to see mountains
    
    const cameraX = startCameraPos.x + (endCameraPos.x - startCameraPos.x) * easedProgress
    const cameraY = startCameraPos.y + (endCameraPos.y - startCameraPos.y) * easedProgress
    const cameraZ = startCameraPos.z + (endCameraPos.z - startCameraPos.z) * easedProgress
    
    this.sceneManager.camera.position.set(cameraX, cameraY, cameraZ)
    
    // Look up to see mountain peaks
    const lookAtX = progress * -10
    const lookAtY = progress * -10  
    const lookAtZ = progress * 15 // Look up more to see mountain height
    this.sceneManager.camera.lookAt(lookAtX, lookAtY, lookAtZ)
  }
  
  // Helper function to calculate terrain height at any x,y position
  getTerrainHeightAt(x, y) {
    // Replicate the organic height calculation from the new topology
    let height = 0
    
    // Organic, asymmetrical patterns (matching topographical map)
    height += Math.sin(x * 0.0123 + y * 0.0087) * 10.0
    height += Math.cos(x * 0.0234 - y * 0.0156) * 7.0
    height += Math.sin(x * 0.0345 + y * 0.0267 + Math.PI) * 5.0
    
    // Irregular ridges and valleys
    height += Math.sin(x * 0.0167 + 1.23) * Math.cos(y * 0.0134 + 2.34) * 6.0
    height += Math.cos(x * 0.0198 - 0.87) * Math.sin(y * 0.0176 - 1.56) * 4.5
    height += Math.sin(x * 0.0243 + y * 0.0187 + 4.67) * 3.5
    
    // Small scale details
    height += Math.sin(x * 0.0456 + y * 0.0378) * 2.0
    height += Math.cos(x * 0.0567 - y * 0.0423) * 1.5
    
    return height
  }
  
  // Easing function for smooth camera transitions
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  updatePhase3() {
    // Seamless morph from mountain wireframe to distributed network graph
    const progress = this.phase3Progress
    const easedProgress = this.easeInOutCubic(progress)
    
    // Morph to network graph positions
    this.morphToPhase('network', progress)
    // Shader materials handle color automatically based on currentPhase uniform
    
    // Hide mountain terrain and sun as we enter network phase
    if (this.mountainTerrain) this.mountainTerrain.visible = false
    if (this.sun) this.sun.visible = false
    if (this.sunLight) this.sunLight.visible = false
    
    // More dramatic camera movement - sweeping arc around forming network
    const startPos = { x: -40, y: -60, z: 90 } // From mountain phase
    const midPos = { x: 0, y: 80, z: 100 }     // High overhead sweep
    const endPos = { x: 60, y: 30, z: 85 }     // Final network viewing position
    
    let cameraX, cameraY, cameraZ
    
    if (progress < 0.5) {
      // First half: dramatic sweep from mountain view to overhead
      const t = progress * 2
      const eased = this.easeInOutCubic(t)
      cameraX = startPos.x + (midPos.x - startPos.x) * eased
      cameraY = startPos.y + (midPos.y - startPos.y) * eased
      cameraZ = startPos.z + (midPos.z - startPos.z) * eased
    } else {
      // Second half: descend to network viewing position
      const t = (progress - 0.5) * 2
      const eased = this.easeInOutCubic(t)
      cameraX = midPos.x + (endPos.x - midPos.x) * eased
      cameraY = midPos.y + (endPos.y - midPos.y) * eased
      cameraZ = midPos.z + (endPos.z - midPos.z) * eased
    }
    
    this.sceneManager.camera.position.set(cameraX, cameraY, cameraZ)
    
    // Camera tracks network formation with dynamic look-at
    const networkCenterX = Math.sin(progress * Math.PI * 0.8) * 10
    const networkCenterY = Math.cos(progress * Math.PI * 0.6) * 5
    const networkCenterZ = progress * 20 - 10
    
    this.sceneManager.camera.lookAt(networkCenterX, networkCenterY, networkCenterZ)
  }

  updatePhase4() {
    // Seamless morph from network to cellular clusters with breaking apart effect
    const progress = this.phase4Progress
    const easedProgress = this.easeInOutCubic(progress)
    
    // Morph to cellular cluster positions
    this.morphToPhase('cellular', progress)
    // Shader materials handle color automatically based on currentPhase uniform
    
    // Cell division effect - break apart connections as progress increases
    if (progress > 0.5) {
      this.morphingSystem.lines.forEach(lineObj => {
        const breakProbability = (progress - 0.5) * 2
        if (Math.random() < breakProbability * 0.3) {
          lineObj.mesh.visible = Math.random() > 0.5 // Randomly hide connections
        }
      })
    }
    
    // Create molecular structure effect - some lines become shorter/fragment
    if (progress > 0.7) {
      this.createMolecularFragmentation(progress)
    }
    
    // Dramatic camera movement mimicking microscopic dive into cellular structures
    const startPos = { x: 60, y: 30, z: 85 }  // From network phase
    const divePos = { x: 20, y: -15, z: 50 }  // Diving into cellular clusters
    const endPos = { x: -8, y: 2, z: 25 }     // Intimate molecular view
    
    let cameraX, cameraY, cameraZ
    
    if (progress < 0.4) {
      // First phase: rapid dive toward cellular clusters
      const t = progress / 0.4
      const eased = this.easeInOutCubic(t) * 1.5 // Accelerated dive
      cameraX = startPos.x + (divePos.x - startPos.x) * eased
      cameraY = startPos.y + (divePos.y - startPos.y) * eased
      cameraZ = startPos.z + (divePos.z - startPos.z) * eased
    } else if (progress < 0.8) {
      // Second phase: navigate through cellular structures
      const t = (progress - 0.4) / 0.4
      const eased = this.easeInOutCubic(t)
      cameraX = divePos.x + (endPos.x - divePos.x) * eased
      cameraY = divePos.y + (endPos.y - divePos.y) * eased
      cameraZ = divePos.z + (endPos.z - divePos.z) * eased
      
      // Add organic movement during navigation
      cameraX += Math.sin(progress * Math.PI * 3) * 2
      cameraY += Math.cos(progress * Math.PI * 2.5) * 1.5
    } else {
      // Final phase: molecular-level examination with subtle movements
      const t = (progress - 0.8) / 0.2
      const microMovementX = Math.sin(this.time * 0.5 + progress * 10) * 0.8
      const microMovementY = Math.cos(this.time * 0.3 + progress * 8) * 0.6
      const microMovementZ = Math.sin(this.time * 0.4 + progress * 6) * 0.4
      
      cameraX = endPos.x + microMovementX
      cameraY = endPos.y + microMovementY
      cameraZ = endPos.z + microMovementZ
    }
    
    this.sceneManager.camera.position.set(cameraX, cameraY, cameraZ)
    
    // Dynamic look-at following cellular division and molecular activity
    let lookAtX, lookAtY, lookAtZ
    
    if (progress < 0.6) {
      // Focus on main cellular cluster during early division
      lookAtX = Math.sin(progress * Math.PI * 1.5) * 8
      lookAtY = Math.cos(progress * Math.PI * 1.2) * 6
      lookAtZ = progress * 10 - 5
    } else {
      // Focus on molecular fragments and division products
      const fragmentFocus = (progress - 0.6) / 0.4
      lookAtX = Math.sin(this.time * 0.8 + fragmentFocus * 5) * 4
      lookAtY = Math.cos(this.time * 0.6 + fragmentFocus * 4) * 3
      lookAtZ = Math.sin(this.time * 0.4 + fragmentFocus * 3) * 2
    }
    
    this.sceneManager.camera.lookAt(lookAtX, lookAtY, lookAtZ)
  }
  
  createMolecularFragmentation(progress) {
    // Break apart some connections to create molecular structure effect
    const fragmentProgress = (progress - 0.7) / 0.3
    
    this.morphingSystem.lines.forEach((lineObj, index) => {
      if (index % 3 === 0) { // Only affect every third line
        const positions = lineObj.geometry.attributes.position.array
        const startVertex = this.morphingSystem.vertices[lineObj.startVertexId]
        const endVertex = this.morphingSystem.vertices[lineObj.endVertexId]
        
        // Create fragmentation by shortening lines
        const fragmentation = fragmentProgress * 0.8
        const midX = (startVertex.currentPosition.x + endVertex.currentPosition.x) * 0.5
        const midY = (startVertex.currentPosition.y + endVertex.currentPosition.y) * 0.5
        const midZ = (startVertex.currentPosition.z + endVertex.currentPosition.z) * 0.5
        
        // Shorten lines towards their midpoints
        positions[0] = startVertex.currentPosition.x + (midX - startVertex.currentPosition.x) * fragmentation
        positions[1] = startVertex.currentPosition.y + (midY - startVertex.currentPosition.y) * fragmentation
        positions[2] = startVertex.currentPosition.z + (midZ - startVertex.currentPosition.z) * fragmentation
        positions[3] = endVertex.currentPosition.x + (midX - endVertex.currentPosition.x) * fragmentation
        positions[4] = endVertex.currentPosition.y + (midY - endVertex.currentPosition.y) * fragmentation
        positions[5] = endVertex.currentPosition.z + (midZ - endVertex.currentPosition.z) * fragmentation
        
        lineObj.geometry.attributes.position.needsUpdate = true
      }
    })
  }
  
  createDaughterCells(parentCell, parentIndex) {
    // Create two daughter cells from the parent
    for (let i = 0; i < 2; i++) {
      const daughterCell = this.createCell(this.cellSystem.cells.length + this.cellSystem.newCells.length)
      
      // Position daughter cells on either side of parent
      const offset = (i === 0 ? -1 : 1) * 4
      daughterCell.membrane.position.copy(parentCell.membrane.position)
      daughterCell.membrane.position.y += offset
      daughterCell.nucleus.position.copy(daughterCell.membrane.position)
      
      // Mark birth time for scaling animation
      daughterCell.birthTime = this.phase4Progress
      
      // Add to scene
      this.cellSystem.group.add(daughterCell.membrane)
      this.cellSystem.group.add(daughterCell.nucleus)
      if (daughterCell.organelles) {
        daughterCell.organelles.forEach(organelle => {
          this.cellSystem.group.add(organelle)
        })
      }
      
      this.cellSystem.newCells.push(daughterCell)
    }
    
    // Hide parent cell (it has completed division)
    parentCell.membrane.visible = false
    parentCell.nucleus.visible = false
    if (parentCell.organelles) {
      parentCell.organelles.forEach(organelle => {
        organelle.visible = false
      })
    }
  }

  update(deltaTime) {
    this.time = performance.now() * 0.001
    
    // Gradually decay mouse influence when not moving  
    if (this.mouseInfluence > 0) {
      this.mouseInfluence = Math.max(0, this.mouseInfluence * 0.95) // Exponential decay
    }
    
    // Update unified morphing system uniforms
    if (this.morphingSystem?.lines) {
      this.morphingSystem.lines.forEach((lineObj, index) => {
        if (lineObj.mesh.material.uniforms) {
          const uniforms = lineObj.mesh.material.uniforms
          uniforms.time.value = this.time
          uniforms.mouseInfluence.value = this.mouseInfluence
          
          // Update current phase for shader color changes
          let currentPhase = 0
          if (this.phase2Progress > 0) currentPhase = 1 + this.phase2Progress
          else if (this.phase3Progress > 0) currentPhase = 2 + this.phase3Progress  
          else if (this.phase4Progress > 0) currentPhase = 3 + this.phase4Progress
          else currentPhase = this.phase1Progress
          
          uniforms.currentPhase.value = currentPhase
          uniforms.phaseProgress.value = Math.max(
            this.phase1Progress, this.phase2Progress, 
            this.phase3Progress, this.phase4Progress
          )
          
          // Vary wave parameters slightly per line for organic diversity
          uniforms.waveAmplitude.value = 2.0 + Math.sin(index * 0.3 + this.time * 0.1) * 0.5
          uniforms.waveFrequency.value = 0.02 + Math.cos(index * 0.5 + this.time * 0.08) * 0.005
        }
      })
    }
    
    // Update mountain terrain uniforms
    if (this.mountainTerrain?.material.uniforms) {
      this.mountainTerrain.material.uniforms.time.value = this.time
    }
    
    // Update sun uniforms
    if (this.sun?.material.uniforms) {
      this.sun.material.uniforms.time.value = this.time
    }
  }

  updateScroll(progress, direction) {
    this.updateProgression(progress)
  }

  onEnter() {
    console.log('🌊 Entering unified progression scene')
  }

  onExit() {
    console.log('🌊 Exiting unified progression scene')
  }

  getScene() {
    return this.scene
  }

  dispose() {
    // Dispose of all geometries and materials
    this.topographicalLines.forEach(line => {
      line.geometry.dispose()
      line.material.dispose()
    })
    
    if (this.mountainTerrain) {
      this.mountainTerrain.geometry.dispose()
      this.mountainTerrain.material.dispose()
    }
    
    // ... dispose other elements
    
    console.log('🌊 Unified progression scene disposed')
  }
}