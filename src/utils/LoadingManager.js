export class LoadingManager {
  constructor() {
    this.loadedAssets = new Map()
    this.loadingPromises = new Map()
    this.totalAssets = 0
    this.loadedCount = 0
    this.onProgress = null
    this.onComplete = null
  }

  async loadAssets(assetPaths, onProgress = null, onComplete = null) {
    this.onProgress = onProgress
    this.onComplete = onComplete
    this.totalAssets = assetPaths.length
    this.loadedCount = 0

    const loadPromises = assetPaths.map(assetPath => this.loadAsset(assetPath))
    
    try {
      const results = await Promise.allSettled(loadPromises)
      
      // Process results
      const loaded = results.filter(result => result.status === 'fulfilled')
      const failed = results.filter(result => result.status === 'rejected')
      
      if (failed.length > 0) {
        console.warn(`Failed to load ${failed.length} assets:`, failed)
      }
      
      console.log(`✅ Loaded ${loaded.length}/${this.totalAssets} assets`)
      
      if (this.onComplete) {
        this.onComplete(loaded.length, this.totalAssets)
      }
      
      return { loaded: loaded.length, failed: failed.length, total: this.totalAssets }
      
    } catch (error) {
      console.error('Asset loading failed:', error)
      throw error
    }
  }

  async loadAsset(assetPath) {
    // Check if already loaded
    if (this.loadedAssets.has(assetPath)) {
      return this.loadedAssets.get(assetPath)
    }

    // Check if currently loading
    if (this.loadingPromises.has(assetPath)) {
      return this.loadingPromises.get(assetPath)
    }

    // Determine asset type and load appropriately
    const promise = this.createLoadPromise(assetPath)
    this.loadingPromises.set(assetPath, promise)

    try {
      const asset = await promise
      this.loadedAssets.set(assetPath, asset)
      this.onAssetLoaded(assetPath, asset)
      return asset
    } catch (error) {
      this.loadingPromises.delete(assetPath)
      throw error
    }
  }

  createLoadPromise(assetPath) {
    const extension = this.getFileExtension(assetPath)
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'svg':
        return this.loadImage(assetPath)
      
      case 'mp3':
      case 'wav':
      case 'ogg':
        return this.loadAudio(assetPath)
      
      case 'gltf':
      case 'glb':
        return this.loadModel(assetPath)
      
      case 'json':
        return this.loadJSON(assetPath)
      
      case 'txt':
      case 'md':
        return this.loadText(assetPath)
      
      default:
        return this.loadGeneric(assetPath)
    }
  }

  loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          type: 'image',
          path,
          element: img,
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${path}`))
      }
      
      img.src = path
    })
  }

  loadAudio(path) {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      
      audio.addEventListener('canplaythrough', () => {
        resolve({
          type: 'audio',
          path,
          element: audio,
          duration: audio.duration
        })
      }, { once: true })
      
      audio.addEventListener('error', () => {
        reject(new Error(`Failed to load audio: ${path}`))
      }, { once: true })
      
      audio.src = path
      audio.load()
    })
  }

  async loadModel(path) {
    // This would typically use THREE.GLTFLoader
    // For now, return a placeholder
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      
      return {
        type: 'model',
        path,
        data: arrayBuffer,
        size: arrayBuffer.byteLength
      }
    } catch (error) {
      throw new Error(`Failed to load model: ${path} - ${error.message}`)
    }
  }

  async loadJSON(path) {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      return {
        type: 'json',
        path,
        data
      }
    } catch (error) {
      throw new Error(`Failed to load JSON: ${path} - ${error.message}`)
    }
  }

  async loadText(path) {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const text = await response.text()
      
      return {
        type: 'text',
        path,
        content: text
      }
    } catch (error) {
      throw new Error(`Failed to load text: ${path} - ${error.message}`)
    }
  }

  async loadGeneric(path) {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return {
        type: 'generic',
        path,
        response
      }
    } catch (error) {
      throw new Error(`Failed to load asset: ${path} - ${error.message}`)
    }
  }

  onAssetLoaded(path, asset) {
    this.loadedCount++
    
    if (this.onProgress) {
      this.onProgress(this.loadedCount, this.totalAssets, asset)
    }
    
    // Update loading screen if it exists
    this.updateLoadingProgress()
  }

  updateLoadingProgress() {
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen && this.totalAssets > 0) {
      const progress = (this.loadedCount / this.totalAssets) * 100
      
      let progressBar = loadingScreen.querySelector('.progress-bar')
      if (!progressBar) {
        progressBar = document.createElement('div')
        progressBar.className = 'progress-bar'
        progressBar.innerHTML = `
          <div class="progress-fill"></div>
          <div class="progress-text">Loading...</div>
        `
        loadingScreen.appendChild(progressBar)
      }
      
      const fill = progressBar.querySelector('.progress-fill')
      const text = progressBar.querySelector('.progress-text')
      
      if (fill) {
        fill.style.width = `${progress}%`
      }
      
      if (text) {
        text.textContent = `Loading... ${Math.round(progress)}%`
      }
    }
  }

  getFileExtension(path) {
    return path.split('.').pop().toLowerCase()
  }

  getAsset(path) {
    return this.loadedAssets.get(path)
  }

  isAssetLoaded(path) {
    return this.loadedAssets.has(path)
  }

  preloadAssets(assetPaths) {
    // Start loading assets without waiting for completion
    assetPaths.forEach(path => {
      this.loadAsset(path).catch(error => {
        console.warn(`Preload failed for ${path}:`, error)
      })
    })
  }

  clearCache() {
    this.loadedAssets.clear()
    this.loadingPromises.clear()
    this.loadedCount = 0
    this.totalAssets = 0
  }

  getLoadingStats() {
    return {
      loaded: this.loadedCount,
      total: this.totalAssets,
      progress: this.totalAssets > 0 ? (this.loadedCount / this.totalAssets) * 100 : 0,
      cached: this.loadedAssets.size
    }
  }
}