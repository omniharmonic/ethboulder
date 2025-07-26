import { portfolioData } from '../data/portfolio.js'

export class FrostedGlassCardsUI {
  constructor() {
    this.cardsContainer = null
    this.cards = []
    this.currentSection = 'systems' // Default section
    this.resizeTimeout = null
  }

  init() {
    this.createCardsContainer()
    this.renderCards()
    console.log('✨ Frosted Glass Cards UI initialized')
  }

  createCardsContainer() {
    // Create the main cards container positioned along the scroll
    this.cardsContainer = document.createElement('div')
    this.cardsContainer.className = 'frosted-cards-overlay'
    this.cardsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 800vh;
      pointer-events: none;
      z-index: var(--z-content);
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding: 20vh 5vw;
      box-sizing: border-box;
      opacity: 1;
    `

    document.body.appendChild(this.cardsContainer)
    
    // Setup scroll listener for dynamic positioning
    this.setupScrollListener()
    
    // Setup resize listener for responsive layout updates
    this.setupResizeListener()
  }

  setupScrollListener() {
    let ticking = false
    
    const updateCardPositions = () => {
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      this.updateCardsVisibility(scrollProgress)
      ticking = false
    }
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateCardPositions)
        ticking = true
      }
    }, { passive: true })
  }

  setupResizeListener() {
    // Debounced resize handler for responsive layout updates
    const handleResize = () => {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => {
        console.log('📱 Screen size changed - updating card layout responsively')
        this.renderCards() // Re-render cards with new responsive positioning
      }, 250) // Debounce resize events
    }

    window.addEventListener('resize', handleResize)
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100) // Small delay for orientation change to complete
    })
  }

  updateCardsVisibility(scrollProgress) {
    // Update card visibility and effects based on scroll position
    this.cards.forEach((card, index) => {
      if (!card) return
      
      const cardRect = card.getBoundingClientRect()
      const isVisible = cardRect.top < window.innerHeight && cardRect.bottom > 0
      
      if (isVisible) {
        // Calculate visibility ratio
        const visibilityRatio = Math.min(1, Math.max(0, 
          (window.innerHeight - cardRect.top) / (window.innerHeight + cardRect.height)
        ))
        
        // Apply smooth fade and parallax effect
        card.style.opacity = visibilityRatio * 0.9 + 0.1
        card.style.transform = `translateY(${(1 - visibilityRatio) * 20}px) scale(${0.95 + visibilityRatio * 0.05})`
      } else {
        card.style.opacity = 0.1
      }
    })
  }

  renderCards() {
    // Clear existing cards
    this.cardsContainer.innerHTML = ''
    this.cards = []

    // Get 3 cards from each section for comprehensive display
    const allCardsToShow = [
      ...portfolioData.systems.slice(0, 3),   // First 3 systems cards
      ...portfolioData.culture.slice(0, 3),   // First 3 culture cards  
      ...portfolioData.story.slice(0, 3)      // First 3 story cards
    ]

    allCardsToShow.forEach((project, index) => {
      const card = this.createStaggeredCard(project, index)
      this.cards.push(card)
      this.cardsContainer.appendChild(card)
    })

    // Initial visibility update
    setTimeout(() => this.updateCardsVisibility(0), 100)
    
    console.log(`✨ Rendered ${allCardsToShow.length} cards across all sections (3 per section)`)
  }

  createStaggeredCard(project, index) {
    const cardWrapper = document.createElement('div')
    cardWrapper.className = 'card-wrapper'
    
    // Enhanced responsive detection with viewport considerations
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const isPortrait = viewportHeight > viewportWidth
    const isMobile = viewportWidth < 768
    const isTablet = viewportWidth >= 768 && viewportWidth < 1024
    const isDesktop = viewportWidth >= 1024
    const isSmallMobile = viewportWidth < 480 // Extra small screens
    
    // Responsive card dimensions with enhanced mobile support
    let cardWidth
    if (isSmallMobile) {
      cardWidth = '90vw' // Wider on very small screens
    } else if (isMobile) {
      cardWidth = '85vw'
    } else if (isTablet) {
      cardWidth = isPortrait ? '70vw' : '45vw' // Adjust for tablet orientation
    } else {
      cardWidth = '320px'
    }
    
    // Calculate safe starting position - ensure cards start MUCH further below header
    const headerHeight = isMobile ? 100 : 120 // Account for header height in vh
    const safeStartPosition = Math.max(300, headerHeight + 200) // Much higher minimum - 300vh or header + large buffer
    
    // Dynamic spacing with enhanced mobile considerations
    let cardSpacing, sectionGap
    if (isSmallMobile) {
      cardSpacing = 30 // Extra spacing for small screens
      sectionGap = 80 // Smaller section gaps on small screens to fit more content
    } else if (isMobile) {
      cardSpacing = 25
      sectionGap = 100
    } else if (isTablet) {
      cardSpacing = isPortrait ? 35 : 30 // More spacing in portrait mode
      sectionGap = isPortrait ? 90 : 120
    } else {
      cardSpacing = 30
      sectionGap = 120
    }
    
    const positions = [
      // Systems section (cards 0-2) - positioned safely below header
      { 
        top: `${safeStartPosition}vh`, 
        left: isMobile ? '50vw' : '15vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'none'
      },
      { 
        top: `${safeStartPosition + cardSpacing}vh`, 
        left: isMobile ? '50vw' : '70vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'translateX(-100%)'
      },
      { 
        top: `${safeStartPosition + cardSpacing * 2}vh`, 
        left: isMobile ? '50vw' : '42vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'translateX(-50%)'
      },
      
      // Culture section (cards 3-5) - positioned with large gap from systems
      { 
        top: `${safeStartPosition + sectionGap}vh`, 
        left: isMobile ? '50vw' : '20vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'none'
      },
      { 
        top: `${safeStartPosition + sectionGap + cardSpacing}vh`, 
        left: isMobile ? '50vw' : '75vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'translateX(-100%)'
      },
      { 
        top: `${safeStartPosition + sectionGap + cardSpacing * 2}vh`, 
        left: isMobile ? '50vw' : '47vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'translateX(-50%)'
      },
      
      // Story section (cards 6-8) - positioned with large gap from culture
      { 
        top: `${safeStartPosition + sectionGap * 2}vh`, 
        left: isMobile ? '50vw' : '25vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'none'
      },
      { 
        top: `${safeStartPosition + sectionGap * 2 + cardSpacing}vh`, 
        left: isMobile ? '50vw' : '65vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'translateX(-100%)'
      },
      { 
        top: `${safeStartPosition + sectionGap * 2 + cardSpacing * 2}vh`, 
        left: isMobile ? '50vw' : '45vw', 
        maxWidth: cardWidth,
        transform: isMobile ? 'translateX(-50%)' : 'translateX(-50%)'
      }
    ]
    
    const position = positions[index] || positions[0]
    
    // Debug logging for card positioning
    console.log(`📍 Card ${index} positioned at: ${position.top}, ${position.left} (safeStart: ${safeStartPosition}vh)`)
    
    cardWrapper.style.cssText = `
      position: absolute;
      top: ${position.top};
      left: ${position.left};
      max-width: ${position.maxWidth};
      width: 100%;
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0.8;
      transform: ${position.transform || 'none'};
      z-index: 10;
    `
    
    const card = this.createCard(project, index)
    cardWrapper.appendChild(card)
    
    return cardWrapper
  }

  formatStatus(status) {
    const statusMap = {
      'active': 'Active',
      'development': 'In Development', 
      'pilot': 'Pilot Phase',
      'research': 'Research',
      'published': 'Published',
      'completed': 'Completed'
    }
    return statusMap[status] || status
  }

  formatTag(tag) {
    return tag.replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())
  }

  createCard(project, index) {
    const card = document.createElement('div')
    card.className = 'frosted-glass-card'
    card.style.opacity = '1'
    card.style.transform = 'translateY(0px)'

    // Create card content with improved spacing and layout
    card.innerHTML = `
      <div class="card-header">
        <h3>${project.title}</h3>
        <span class="year">${project.year || 'Recent'}</span>
      </div>
      <div class="card-body">
        <p class="description">${project.description}</p>
        <div class="meta-info">
          <span class="status status-${project.status}">${this.formatStatus(project.status)}</span>
          ${project.impact ? `<span class="impact">Impact: ${Math.round(project.impact * 100)}%</span>` : ''}
        </div>
      </div>
      <div class="card-footer">
        <div class="tags">
          ${project.tags.slice(0, 3).map(tag => 
            `<span class="tag">${this.formatTag(tag)}</span>`
          ).join('')}
        </div>
      </div>
    `

    // Add click interaction
    card.addEventListener('click', () => {
      this.onCardClick(project)
    })

    // Add hover effects
    card.addEventListener('mouseenter', () => {
      this.onCardHover(card, true)
    })

    card.addEventListener('mouseleave', () => {
      this.onCardHover(card, false)
    })

    return card
  }

  animateCardsIn() {
    this.cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        card.style.opacity = '1'
        card.style.transform = 'translateY(0)'
      }, index * 150) // Stagger animation
    })
  }

  animateCardsOut() {
    return new Promise((resolve) => {
      this.cards.forEach((card, index) => {
        setTimeout(() => {
          card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          card.style.opacity = '0'
          card.style.transform = 'translateY(-20px)'
        }, index * 100)
      })

      // Resolve after all animations complete
      setTimeout(resolve, this.cards.length * 100 + 500)
    })
  }

  onCardClick(project) {
    console.log('Card clicked:', project.title)
    // TODO: Show detailed project view
    this.showProjectDetails(project)
  }

  onCardHover(card, isHovering) {
    if (isHovering) {
      // Subtle scale and glow effect
      card.style.transform = 'translateY(-4px) scale(1.02)'
    } else {
      card.style.transform = 'translateY(0) scale(1)'
    }
  }

  showProjectDetails(project) {
    // Create a detailed view overlay
    const detailsOverlay = document.createElement('div')
    detailsOverlay.className = 'project-details-overlay'
    detailsOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    `

    const detailsCard = document.createElement('div')
    detailsCard.className = 'frosted-glass-card'
    detailsCard.style.cssText = `
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      margin: var(--spacing-lg);
    `

    detailsCard.innerHTML = `
      <div class="modal-header">
        <div class="title-section">
          <h2 class="modal-title">${project.title}</h2>
          <div class="modal-meta">
            <span class="modal-year">${project.year || 'Recent'}</span>
            <span class="status status-${project.status}">${this.formatStatus(project.status)}</span>
            ${project.impact ? `<span class="impact-badge">Impact: ${Math.round(project.impact * 100)}%</span>` : ''}
          </div>
        </div>
        <button class="close-btn">×</button>
      </div>
      
      <div class="modal-description">
        ${project.description}
      </div>
      
      ${project.content ? `
        <div class="content-sections">
          <div class="content-section">
            <h4 class="section-title">Overview</h4>
            <p class="section-content">${project.content.overview}</p>
          </div>
          
          <div class="content-section">
            <h4 class="section-title">Methodology</h4>
            <p class="section-content">${project.content.methodology}</p>
          </div>
          
          <div class="content-section">
            <h4 class="section-title">Outcomes</h4>
            <p class="section-content">${project.content.outcomes}</p>
          </div>
        </div>
      ` : ''}
      
      <div class="modal-footer">
        <div class="tags">
          ${project.tags.map(tag => 
            `<span class="tag">${this.formatTag(tag)}</span>`
          ).join('')}
        </div>
      </div>
    `

    // Close functionality
    const closeBtn = detailsCard.querySelector('.close-btn')
    const closeDetails = () => {
      detailsOverlay.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(detailsOverlay)
      }, 300)
    }

    closeBtn.addEventListener('click', closeDetails)
    detailsOverlay.addEventListener('click', (e) => {
      if (e.target === detailsOverlay) closeDetails()
    })

    detailsOverlay.appendChild(detailsCard)
    document.body.appendChild(detailsOverlay)

    // Animate in
    detailsOverlay.style.opacity = '0'
    setTimeout(() => {
      detailsOverlay.style.transition = 'opacity 0.3s ease'
      detailsOverlay.style.opacity = '1'
    }, 10)
  }

  async switchSection(newSection) {
    if (newSection === this.currentSection) return

    // Animate out current cards
    await this.animateCardsOut()
    
    // Render new cards
    this.renderCards(newSection)
  }

  setVisibility(visible, duration = 500) {
    if (!this.cardsContainer) return

    if (visible) {
      this.cardsContainer.style.display = 'flex'
      setTimeout(() => {
        this.cardsContainer.style.transition = `opacity ${duration}ms ease`
        this.cardsContainer.style.opacity = '1'
      }, 10)
    } else {
      this.cardsContainer.style.transition = `opacity ${duration}ms ease`
      this.cardsContainer.style.opacity = '0'
      setTimeout(() => {
        this.cardsContainer.style.display = 'none'
      }, duration)
    }
  }

  dispose() {
    // Clean up event listeners
    clearTimeout(this.resizeTimeout)
    
    // Remove the cards container
    if (this.cardsContainer) {
      document.body.removeChild(this.cardsContainer)
    }
    
    this.cards = []
    console.log('✨ Frosted Glass Cards UI disposed with cleaned event listeners')
  }
}