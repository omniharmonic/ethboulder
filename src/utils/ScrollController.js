import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export class ScrollController {
  constructor(sceneManager) {
    this.sceneManager = sceneManager
    this.scrollProgress = 0
    this.lastScrollY = 0
    this.scrollDirection = 1 // 1 for down, -1 for up
    this.isScrolling = false
    this.scrollTimeout = null
    
    this.init()
  }

  init() {
    this.setupScrollTriggers()
    this.setupSmoothScrolling()
    this.setupScrollEvents()
    
    console.log('📜 Scroll controller initialized')
  }

  setupScrollTriggers() {
    // Single unified progression trigger
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        this.scrollProgress = self.progress
        
        // Update unified progression scene
        if (this.sceneManager.currentScene?.updateScroll) {
          this.sceneManager.currentScene.updateScroll(self.progress, self.direction)
        }
        
        
        // Update accessibility announcements based on progression
        this.updateProgressionAccessibility(self.progress)
      }
    })

    // Parallax effects for content sections
    gsap.utils.toArray('.content-overlay').forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          // Subtle parallax movement
          const y = self.progress * 50
          gsap.set(section, { y })
        }
      })
    })
  }

  setupSmoothScrolling() {
    // Optional: Add smooth scrolling behavior for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]')
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        
        const targetId = link.getAttribute('href').substring(1)
        const targetElement = document.getElementById(targetId)
        
        if (targetElement) {
          this.scrollToElement(targetElement)
        }
      })
    })
  }

  setupScrollEvents() {
    // Track scroll direction and speed
    let ticking = false
    
    const updateScroll = () => {
      this.updateScrollProgress()
      ticking = false
    }
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll)
        ticking = true
      }
      
      this.handleScrollStart()
    }, { passive: true })

    // Wheel event for more responsive interaction
    window.addEventListener('wheel', (e) => {
      this.handleWheelEvent(e)
    }, { passive: true })
  }

  updateScrollProgress() {
    const scrollY = window.scrollY
    const maxScroll = document.body.scrollHeight - window.innerHeight
    
    // Calculate scroll direction
    this.scrollDirection = scrollY > this.lastScrollY ? 1 : -1
    this.lastScrollY = scrollY
    
    // Update global scroll progress
    this.scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0
    
    // Update all scenes with scroll progress
    this.sceneManager.updateScroll(this.scrollProgress, this.scrollDirection)
    
    // Update navigation active states
    this.updateNavigationStates()
  }

  handleScrollStart() {
    this.isScrolling = true
    
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }
    
    // Set timeout to detect scroll end
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false
      this.handleScrollEnd()
    }, 150)
  }

  handleScrollEnd() {
    // Trigger scroll end events
    window.dispatchEvent(new CustomEvent('scrollend', {
      detail: {
        progress: this.scrollProgress,
        direction: this.scrollDirection
      }
    }))
  }

  handleWheelEvent(event) {
    // Additional wheel-specific interactions
    const delta = event.deltaY
    const intensity = Math.min(Math.abs(delta) / 100, 1)
    
    // Pass wheel data to current scene for micro-interactions
    if (this.sceneManager.currentScene?.onWheel) {
      this.sceneManager.currentScene.onWheel(delta, intensity)
    }
  }

  scrollToElement(element, duration = 1000) {
    const offsetTop = element.offsetTop
    
    gsap.to(window, {
      duration: duration / 1000,
      scrollTo: {
        y: offsetTop,
        autoKill: false
      },
      ease: "power2.inOut"
    })
  }

  scrollToSection(sectionName) {
    const element = document.getElementById(`${sectionName}-section`) || 
                   document.getElementById(sectionName)
    
    if (element) {
      this.scrollToElement(element)
    }
  }

  updateNavigationStates() {
    const sections = ['homepage', 'systems-section', 'culture-section', 'contact']
    const viewportHeight = window.innerHeight
    const scrollY = window.scrollY
    
    let activeSection = 'homepage'
    
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId)
      if (element) {
        const rect = element.getBoundingClientRect()
        const isInView = rect.top < viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.5
        
        if (isInView) {
          activeSection = sectionId === 'systems-section' ? 'systems' :
                         sectionId === 'culture-section' ? 'culture' :
                         sectionId === 'contact' ? 'contact' : 'homepage'
        }
      }
    })
    
    // Update navigation active states
    const navLinks = document.querySelectorAll('.main-navigation a')
    navLinks.forEach(link => {
      const navTarget = link.getAttribute('data-nav')
      link.classList.toggle('active', navTarget === activeSection)
    })
  }

  updateProgressionAccessibility(progress) {
    let currentPhase = ''
    let description = ''
    
    if (progress < 0.25) {
      currentPhase = 'topographical'
      description = 'Interactive 2D topographical map with soundwave undulations'
    } else if (progress < 0.5) {
      currentPhase = 'mountain'
      description = '3D mountain landscape with moving sun and shadows'
    } else if (progress < 0.75) {
      currentPhase = 'indras-net'
      description = 'Holographic fractal network in three dimensions'
    } else {
      currentPhase = 'cell-division'
      description = 'Cellular division and mitosis animation'
    }
    
    // Only announce changes when crossing phase boundaries
    if (this.lastPhase !== currentPhase) {
      this.notifyAccessibility(currentPhase, description)
      this.lastPhase = currentPhase
    }
  }

  notifyAccessibility(phaseName, description) {
    // Notify accessibility manager of phase changes
    window.dispatchEvent(new CustomEvent('sectionchange', {
      detail: { 
        section: phaseName,
        description: description
      }
    }))
  }

  // Methods for programmatic control
  lockScroll() {
    document.body.style.overflow = 'hidden'
    ScrollTrigger.disable()
  }

  unlockScroll() {
    document.body.style.overflow = ''
    ScrollTrigger.enable()
  }

  getScrollData() {
    return {
      progress: this.scrollProgress,
      direction: this.scrollDirection,
      isScrolling: this.isScrolling,
      scrollY: window.scrollY,
      maxScroll: document.body.scrollHeight - window.innerHeight
    }
  }

  // Cleanup
  destroy() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }
    
    console.log('📜 Scroll controller destroyed')
  }
}