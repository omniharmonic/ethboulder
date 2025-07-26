import { ethBoulderTracks } from '../data/ethBoulderTracks.js'

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
    
    // Check if we need vertical layout
    this.updateContainerLayout()

    document.body.appendChild(this.cardsContainer)
    
    // Setup scroll listener for dynamic positioning
    this.setupScrollListener()
    
    // Setup resize listener for responsive layout updates
    this.setupResizeListener()
  }

  updateContainerLayout() {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const cardMinWidth = 200 // Increased minimum card width for better spacing
    const cardSpacing = 20 // Minimum spacing between cards
    const cardsCount = 5
    const availableWidth = viewportWidth * 0.8 // Reduced to 80% for more padding
    const totalRequiredWidth = (cardMinWidth * cardsCount) + (cardSpacing * (cardsCount - 1))
    
    // Determine layout type - stricter requirements for horizontal layout
    const canFitAllHorizontal = totalRequiredWidth <= availableWidth
    const canFit2x3Grid = viewportWidth >= 450 && viewportHeight >= 600 // Increased threshold
    
    if (canFitAllHorizontal) {
      // All cards in horizontal row
      this.layoutType = 'horizontal'
      this.cardsContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        pointer-events: none;
        z-index: var(--z-content);
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 20vh 5vw;
        box-sizing: border-box;
        opacity: 1;
      `
    } else if (canFit2x3Grid) {
      // 2x3 grid layout - almost full width at bottom of screen
      this.layoutType = 'grid'
      
      // Position at bottom with comfortable width
      const marginSides = Math.max(60, viewportWidth * 0.1) // Larger margins, 10% of viewport or 60px min
      const containerWidth = viewportWidth - (marginSides * 2)
      const containerHeight = Math.min(viewportHeight * 0.35, 300) // Max 35% height or 300px
      
      this.cardsContainer.style.cssText = `
        position: fixed;
        top: 65vh;
        left: 50%;
        transform: translateX(-50%);
        width: ${containerWidth}px;
        height: ${containerHeight}px;
        pointer-events: auto;
        z-index: var(--z-content);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        padding: 25px;
        box-sizing: border-box;
        opacity: 1;
        overflow-y: auto;
        overflow-x: hidden;
        background: rgba(255, 255, 255, 0.008);
        backdrop-filter: blur(1px);
        border: 1px solid transparent;
        box-shadow: 
          0 2px 8px rgba(0, 0, 0, 0.02),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(255, 255, 255, 0.05),
          inset 1px 0 0 rgba(255, 255, 255, 0.08),
          inset -1px 0 0 rgba(255, 255, 255, 0.08);
        border-radius: 15px;
      `
    } else {
      // Single column vertical layout - almost full width at bottom
      this.layoutType = 'vertical'
      
      // Position at bottom with comfortable width
      const marginSides = Math.max(60, viewportWidth * 0.1) // Larger margins, 10% of viewport or 60px min
      const containerWidth = viewportWidth - (marginSides * 2)
      const containerHeight = Math.min(viewportHeight * 0.35, 300)
      
      this.cardsContainer.style.cssText = `
        position: fixed;
        top: 65vh;
        left: 50%;
        transform: translateX(-50%);
        width: ${containerWidth}px;
        height: ${containerHeight}px;
        pointer-events: auto;
        z-index: var(--z-content);
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 25px;
        box-sizing: border-box;
        opacity: 1;
        overflow-y: auto;
        overflow-x: hidden;
        background: rgba(255, 255, 255, 0.008);
        backdrop-filter: blur(1px);
        border: 1px solid transparent;
        box-shadow: 
          0 2px 8px rgba(0, 0, 0, 0.02),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(255, 255, 255, 0.05),
          inset 1px 0 0 rgba(255, 255, 255, 0.08),
          inset -1px 0 0 rgba(255, 255, 255, 0.08);
        border-radius: 15px;
      `
    }
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
        this.updateContainerLayout() // Update layout first
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
        
        // Apply smooth fade and parallax effect - keep cards at full opacity
        card.style.opacity = 1 // Always full opacity
        card.style.transform = `translateY(${(1 - visibilityRatio) * 20}px) scale(${0.95 + visibilityRatio * 0.05})`
      } else {
        card.style.opacity = 1 // Always full opacity even when out of view
      }
    })
  }

  renderCards() {
    // Clear existing cards
    this.cardsContainer.innerHTML = ''
    this.cards = []

    // Show all 5 ethBoulder conference tracks
    const allCardsToShow = ethBoulderTracks

    allCardsToShow.forEach((project, index) => {
      const card = this.createStaggeredCard(project, index)
      this.cards.push(card)
      this.cardsContainer.appendChild(card)
    })

    // Initial visibility update
    setTimeout(() => this.updateCardsVisibility(0), 100)
    
    console.log(`✨ Rendered ${allCardsToShow.length} ethBoulder conference track cards`)
    console.log('🔍 Cards container:', this.cardsContainer)
    console.log('🔍 Cards array:', this.cards)
  }

  createStaggeredCard(project, index) {
    const cardWrapper = document.createElement('div')
    cardWrapper.className = 'card-wrapper'
    
    if (this.layoutType === 'grid') {
      // Grid layout styling (2 cards per row)
      cardWrapper.style.cssText = `
        width: 100%;
        pointer-events: auto;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
      `
    } else if (this.layoutType === 'vertical') {
      // Single column vertical layout styling
      cardWrapper.style.cssText = `
        width: 100%;
        pointer-events: auto;
        transition: all 0.3s ease;
        margin-bottom: 0;
        flex-shrink: 0;
      `
    } else {
      // Enhanced responsive detection with viewport considerations
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const isPortrait = viewportHeight > viewportWidth
      const isMobile = viewportWidth < 768
      const isTablet = viewportWidth >= 768 && viewportWidth < 1024
      const isDesktop = viewportWidth >= 1024
      const isSmallMobile = viewportWidth < 480 // Extra small screens
    
    // Responsive card dimensions - smaller to fit on one line
    let cardWidth
    if (isSmallMobile) {
      cardWidth = '80vw' // Smaller on very small screens
    } else if (isMobile) {
      cardWidth = '70vw'
    } else if (isTablet) {
      cardWidth = isPortrait ? '50vw' : '30vw' // Much smaller for tablet
    } else {
      cardWidth = '240px' // Smaller desktop cards
    }
    
    // Position cards at bottom of opening screen (no scroll needed)
    const startPosition = isMobile ? 60 : 70 // Start cards at bottom of viewport
    
    // Compact spacing for cards in single screen view
    const cardSpacing = isMobile ? 4 : 5 // Small vertical spacing between cards
    
    const positions = [
      // AI Track
      { 
        top: `${startPosition}vh`, 
        left: '2vw', 
        maxWidth: cardWidth,
        transform: 'none'
      },
      // ETH Localism Track
      { 
        top: `${startPosition}vh`, 
        left: '21vw', 
        maxWidth: cardWidth,
        transform: 'none'
      },
      // App Track (center)
      { 
        top: `${startPosition}vh`, 
        left: '40vw', 
        maxWidth: cardWidth,
        transform: 'none'
      },
      // Abundance Track
      { 
        top: `${startPosition}vh`, 
        left: '59vw', 
        maxWidth: cardWidth,
        transform: 'none'
      },
      // Protocol Layer Track
      { 
        top: `${startPosition}vh`, 
        left: '78vw', 
        maxWidth: cardWidth,
        transform: 'none'
      }
    ]
    
      const position = positions[index] || positions[0]
      
      // Debug logging for card positioning
      console.log(`📍 Card ${index} positioned at: ${position.top}, ${position.left} (startPos: ${startPosition}vh)`)
      
      cardWrapper.style.cssText = `
        position: absolute;
        top: ${position.top};
        left: ${position.left};
        max-width: ${position.maxWidth};
        width: 100%;
        pointer-events: auto;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 1 !important;
        transform: ${position.transform || 'none'};
        z-index: 10;
      `
    } // Close else block
    
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

  createCard(track, index) {
    const card = document.createElement('div')
    card.className = 'frosted-glass-card'
    card.style.opacity = '1'
    card.style.transform = 'translateY(0px)'
    // Remove side lines as requested

    // Create card content for ethBoulder track
    card.innerHTML = `
      <div class="card-header">
        <div class="track-icon">${track.icon}</div>
        <h3>${track.title}</h3>
      </div>
      <div class="card-body">
        <p class="description">${track.description}</p>
        <div class="topics-list">
          ${track.topics.map(topic => 
            `<span class="topic-tag" style="background-color: ${track.color}20; color: ${track.color}">${topic}</span>`
          ).join('')}
        </div>
      </div>
    `

    // Add click interaction
    card.addEventListener('click', () => {
      this.onCardClick(track)
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