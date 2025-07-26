export class PerformanceMonitor {
  constructor() {
    this.fps = 60
    this.frameCount = 0
    this.lastTime = performance.now()
    this.performanceLevel = null
    this.fpsHistory = []
    this.isMonitoring = false
    
    // Performance thresholds
    this.thresholds = {
      low: { fps: 30, memory: 100 },
      medium: { fps: 45, memory: 200 },
      high: { fps: 60, memory: 500 }
    }
    
    this.init()
  }

  async init() {
    this.performanceLevel = await this.detectPerformanceLevel()
    this.startMonitoring()
    console.log(`🔧 Performance level detected: ${this.performanceLevel}`)
  }

  async detectPerformanceLevel() {
    // Test WebGL capabilities
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    
    if (!gl) {
      return 'low'
    }

    const renderer = gl.getParameter(gl.RENDERER) || ''
    const vendor = gl.getParameter(gl.VENDOR) || ''
    
    // Mobile device detection
    if (this.isMobile()) {
      return 'low'
    }
    
    // GPU-based classification
    if (renderer.includes('Intel')) {
      return 'medium'
    }
    
    if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Apple')) {
      return 'high'
    }
    
    // Memory-based fallback
    const memory = navigator.deviceMemory || 4
    if (memory < 4) return 'low'
    if (memory < 8) return 'medium'
    return 'high'
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  getQualitySettings() {
    const settings = {
      low: {
        particleCount: 500,
        shadowMapSize: 512,
        antialias: false,
        pixelRatio: Math.min(window.devicePixelRatio, 1),
        geometryDetail: 0.3,
        postProcessing: false
      },
      medium: {
        particleCount: 2000,
        shadowMapSize: 1024,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        geometryDetail: 0.6,
        postProcessing: true
      },
      high: {
        particleCount: 5000,
        shadowMapSize: 2048,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        geometryDetail: 1.0,
        postProcessing: true
      }
    }

    return settings[this.performanceLevel] || settings.medium
  }

  startMonitoring() {
    this.isMonitoring = true
    
    // Monitor FPS
    setInterval(() => {
      if (this.isMonitoring) {
        this.updateFPS()
        this.adaptQuality()
      }
    }, 1000)
  }

  update(deltaTime) {
    if (!this.isMonitoring) return
    
    this.frameCount++
    
    // Calculate instantaneous FPS
    const currentTime = performance.now()
    const elapsed = currentTime - this.lastTime
    
    if (elapsed >= 1000) {
      this.fps = (this.frameCount * 1000) / elapsed
      this.frameCount = 0
      this.lastTime = currentTime
      
      // Keep FPS history for averaging
      this.fpsHistory.push(this.fps)
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift()
      }
    }
  }

  updateFPS() {
    if (this.fpsHistory.length === 0) return
    
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
    this.fps = avgFPS
  }

  adaptQuality() {
    const avgFPS = this.fps
    
    // Auto-adjust performance level based on FPS
    if (avgFPS < this.thresholds.low.fps && this.performanceLevel !== 'low') {
      this.performanceLevel = 'low'
      this.notifyQualityChange('low')
    } else if (avgFPS > this.thresholds.high.fps && this.performanceLevel === 'low') {
      this.performanceLevel = 'medium'
      this.notifyQualityChange('medium')
    }
  }

  notifyQualityChange(newLevel) {
    console.log(`📊 Performance adapted to: ${newLevel} (FPS: ${this.fps.toFixed(1)})`)
    
    // Dispatch custom event for components to respond to quality changes
    window.dispatchEvent(new CustomEvent('performancechange', {
      detail: {
        level: newLevel,
        settings: this.getQualitySettings(),
        fps: this.fps
      }
    }))
  }

  getPerformanceStats() {
    return {
      fps: this.fps,
      level: this.performanceLevel,
      settings: this.getQualitySettings(),
      memory: this.getMemoryUsage()
    }
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  }

  pause() {
    this.isMonitoring = false
  }

  resume() {
    this.isMonitoring = true
    this.lastTime = performance.now()
    this.frameCount = 0
  }
}