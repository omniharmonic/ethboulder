export class AccessibilityManager {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.highContrast = window.matchMedia('(prefers-contrast: high)').matches
    this.focusedElement = null
    this.focusableElements = []
    this.currentFocusIndex = -1
    
    this.init()
  }

  init() {
    this.setupMediaQueryListeners()
    this.setupKeyboardNavigation()
    this.setupScreenReaderSupport()
    this.createTextNavigation()
    this.updateFocusableElements()
    
    console.log('♿ Accessibility manager initialized')
  }

  setupMediaQueryListeners() {
    // Listen for changes in motion preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches
      this.updateMotionSettings()
    })

    // Listen for changes in contrast preferences
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    contrastQuery.addEventListener('change', (e) => {
      this.highContrast = e.matches
      this.updateContrastSettings()
    })
  }

  updateMotionSettings() {
    document.body.classList.toggle('reduced-motion', this.reducedMotion)
    
    // Notify other components about motion preference changes
    window.dispatchEvent(new CustomEvent('motionpreference', {
      detail: { reducedMotion: this.reducedMotion }
    }))
  }

  updateContrastSettings() {
    document.body.classList.toggle('high-contrast', this.highContrast)
    
    // Notify other components about contrast preference changes
    window.dispatchEvent(new CustomEvent('contrastpreference', {
      detail: { highContrast: this.highContrast }
    }))
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      this.handleKeyboard(event)
    })

    // Update focusable elements when DOM changes
    const observer = new MutationObserver(() => {
      this.updateFocusableElements()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'aria-hidden']
    })
  }

  handleKeyboard(event) {
    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event)
        break
      case 'Enter':
      case ' ':
        if (event.target.classList.contains('interactive-node')) {
          this.handleActivation(event)
        }
        break
      case 'Escape':
        this.handleEscape()
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (document.activeElement?.classList.contains('interactive-node')) {
          this.handleArrowNavigation(event)
        }
        break
      case '/':
        if (event.ctrlKey || event.metaKey) {
          this.toggleTextNavigation()
          event.preventDefault()
        }
        break
      case 'h':
        if (event.ctrlKey || event.metaKey) {
          this.showKeyboardShortcuts()
          event.preventDefault()
        }
        break
    }
  }

  updateFocusableElements() {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '.interactive-node',
      '.control-btn'
    ]

    this.focusableElements = Array.from(
      document.querySelectorAll(selectors.join(', '))
    ).filter(el => {
      return !el.hasAttribute('aria-hidden') && 
             el.offsetParent !== null &&
             !el.disabled
    })
  }

  handleTabNavigation(event) {
    if (this.focusableElements.length === 0) return

    const currentIndex = this.focusableElements.indexOf(document.activeElement)
    
    if (event.shiftKey) {
      // Shift+Tab (backward)
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.focusableElements.length - 1
      this.focusableElements[prevIndex].focus()
    } else {
      // Tab (forward)
      const nextIndex = currentIndex < this.focusableElements.length - 1 ? currentIndex + 1 : 0
      this.focusableElements[nextIndex].focus()
    }
    
    event.preventDefault()
    this.announceToScreenReader(`Focused: ${this.getElementDescription(document.activeElement)}`)
  }

  handleActivation(event) {
    const element = event.target
    
    if (element.classList.contains('interactive-node')) {
      // Trigger node interaction
      element.click()
      this.announceToScreenReader(`Activated: ${this.getElementDescription(element)}`)
    }
    
    event.preventDefault()
  }

  handleEscape() {
    // Close any open panels or modals
    const openPanels = document.querySelectorAll('.panel.open, .modal.open')
    openPanels.forEach(panel => {
      panel.classList.remove('open')
    })
    
    // Return focus to main content
    const main = document.querySelector('main')
    if (main) {
      main.focus()
    }
    
    this.announceToScreenReader('Closed panels and returned to main content')
  }

  handleArrowNavigation(event) {
    // For 3D scene navigation, provide spatial movement feedback
    const directions = {
      'ArrowUp': 'up',
      'ArrowDown': 'down', 
      'ArrowLeft': 'left',
      'ArrowRight': 'right'
    }
    
    const direction = directions[event.key]
    if (direction) {
      this.announceToScreenReader(`Navigating ${direction}`)
      
      // Trigger spatial navigation in 3D scenes
      window.dispatchEvent(new CustomEvent('spatialnavigation', {
        detail: { direction, element: event.target }
      }))
    }
    
    event.preventDefault()
  }

  setupScreenReaderSupport() {
    // Create live region for announcements
    if (!document.getElementById('live-region')) {
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      liveRegion.id = 'live-region'
      document.body.appendChild(liveRegion)
    }

    // Describe 3D scenes for screen readers
    this.createSceneDescriptions()
    
    // Monitor scene changes
    window.addEventListener('scenechange', (event) => {
      this.announceSceneChange(event.detail)
    })
  }

  createSceneDescriptions() {
    const descriptions = {
      homepage: 'Interactive 3D landscape with sound waves that respond to mouse movement. Scroll to transform the 2D map into a 3D terrain. Use arrow keys to explore different areas.',
      systems: 'Network of interconnected project nodes floating in 3D space. Each node represents a different project. Press Enter on a node to view project details. Use arrow keys to navigate between nodes.',
      culture: 'Animated cell division simulation showing organic growth patterns. Cells multiply and evolve over time creating complex structures. Press spacebar to pause or resume the animation.'
    }

    Object.entries(descriptions).forEach(([section, description]) => {
      const element = document.getElementById(`${section}-section`)
      if (element) {
        element.setAttribute('aria-label', description)
        element.setAttribute('role', 'application')
        element.setAttribute('tabindex', '0')
      }
    })
  }

  announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region')
    if (liveRegion) {
      // Clear and then set content to ensure announcement
      liveRegion.textContent = ''
      setTimeout(() => {
        liveRegion.textContent = message
      }, 10)
    }
  }

  announceSceneChange(sceneData) {
    const { name, description, elementCount } = sceneData
    const message = `Entered ${name} section. ${description}. ${elementCount ? `${elementCount} interactive elements available.` : ''}`
    this.announceToScreenReader(message)
  }

  getElementDescription(element) {
    if (!element) return 'Unknown element'
    
    // Try various methods to get meaningful description
    const label = element.getAttribute('aria-label') ||
                 element.getAttribute('title') ||
                 element.textContent?.trim() ||
                 element.tagName.toLowerCase()
    
    return label
  }

  createTextNavigation() {
    const nav = document.createElement('nav')
    nav.className = 'text-navigation'
    nav.style.display = 'none'
    nav.innerHTML = `
      <h2>Alternative Navigation</h2>
      <p>Use this menu if you prefer text-based navigation over the 3D interface.</p>
      <ul>
        <li><a href="#homepage" data-nav="homepage">Home - Interactive Landscape</a></li>
        <li><a href="#systems-section" data-nav="systems">Systems Work - Project Network</a></li>
        <li><a href="#culture-section" data-nav="culture">Cultural Work - Living Processes</a></li>
        <li><a href="#contact" data-nav="contact">Contact & Collaboration</a></li>
      </ul>
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li><kbd>Ctrl+/</kbd> - Toggle this navigation menu</li>
        <li><kbd>Ctrl+H</kbd> - Show all keyboard shortcuts</li>
        <li><kbd>Tab</kbd> - Navigate between interactive elements</li>
        <li><kbd>Enter/Space</kbd> - Activate focused element</li>
        <li><kbd>Escape</kbd> - Close panels and return to main content</li>
        <li><kbd>Arrow Keys</kbd> - Navigate within 3D scenes</li>
      </ul>
    `
    
    document.body.appendChild(nav)
    this.textNavigation = nav
  }

  toggleTextNavigation() {
    if (this.textNavigation) {
      const isVisible = this.textNavigation.style.display !== 'none'
      this.textNavigation.style.display = isVisible ? 'none' : 'block'
      
      if (!isVisible) {
        this.textNavigation.querySelector('a').focus()
        this.announceToScreenReader('Text navigation menu opened')
      } else {
        this.announceToScreenReader('Text navigation menu closed')
      }
    }
  }

  showKeyboardShortcuts() {
    // Create modal with keyboard shortcuts
    const modal = document.createElement('div')
    modal.className = 'keyboard-shortcuts-modal'
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Keyboard Shortcuts</h2>
        <div class="shortcuts-grid">
          <div class="shortcut-group">
            <h3>Navigation</h3>
            <ul>
              <li><kbd>Tab</kbd> - Next element</li>
              <li><kbd>Shift+Tab</kbd> - Previous element</li>
              <li><kbd>Arrow Keys</kbd> - Spatial navigation</li>
              <li><kbd>Enter/Space</kbd> - Activate element</li>
              <li><kbd>Escape</kbd> - Close/Return</li>
            </ul>
          </div>
          <div class="shortcut-group">
            <h3>Application</h3>
            <ul>
              <li><kbd>Ctrl+/</kbd> - Toggle text navigation</li>
              <li><kbd>Ctrl+H</kbd> - Show this help</li>
              <li><kbd>P</kbd> - Pause/Resume (in culture section)</li>
              <li><kbd>R</kbd> - Reset (in culture section)</li>
            </ul>
          </div>
        </div>
        <button class="close-btn">Close</button>
      </div>
    `
    
    // Add modal styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    
    const closeBtn = modal.querySelector('.close-btn')
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal)
      this.announceToScreenReader('Keyboard shortcuts closed')
    })
    
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal)
        this.announceToScreenReader('Keyboard shortcuts closed')
      }
    })
    
    document.body.appendChild(modal)
    closeBtn.focus()
    this.announceToScreenReader('Keyboard shortcuts opened')
  }

  // Called when sections become active
  onSectionChange(sectionName) {
    const section = document.getElementById(`${sectionName}-section`)
    if (section) {
      const description = section.getAttribute('aria-label')
      this.announceToScreenReader(`Entering ${sectionName} section. ${description}`)
    }
  }
}