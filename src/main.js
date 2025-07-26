import { App } from './App.js'
import './styles/main.css'

// Initialize the application
const app = new App()

// Start the app once DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init())
} else {
  app.init()
}

// Handle page visibility changes for performance optimization
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    app.pause()
  } else {
    app.resume()
  }
})

// Handle window resize
window.addEventListener('resize', () => app.handleResize())

// Export for debugging
if (import.meta.env.DEV) {
  window.omniharmonic = app
}