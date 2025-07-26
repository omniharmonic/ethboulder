# OmniHarmonic

An immersive 3D web experience that embodies "digital ecological harmony" through interactive visualizations and sound design.

## 🌊 Features

- **Interactive Topographical Landscape**: 2D to 3D transformation with mouse-responsive sound waves
- **Systems Network Visualization**: Indra's Net inspired 3D network of interconnected projects  
- **Cellular Growth Simulation**: Organic particle system showing cultural evolution
- **Spatial Audio Design**: Context-aware soundscapes and interaction sonification
- **Accessibility First**: Screen reader support, keyboard navigation, reduced motion options
- **Performance Adaptive**: Automatic quality adjustment based on device capabilities
- **Sacred Geometry**: Golden ratio proportions throughout the design system

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript + Three.js for 3D graphics
- **Build**: Vite with ES2020 target and legacy browser support
- **Animation**: GSAP with ScrollTrigger for scroll-based interactions
- **Audio**: Tone.js for interactive sound synthesis
- **Styling**: CSS3 with Custom Properties and sacred geometry proportions
- **Deployment**: Vercel with optimized caching and security headers

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy preview to Vercel  
npm run deploy:preview
```

## 🎮 Interaction Guide

### Homepage - Topographical Landscape
- **Mouse Movement**: Creates sound waves and terrain interaction
- **Scrolling**: Transforms 2D contour map into 3D terrain
- **Audio**: Ambient soundscape with mouse sonification

### Systems Section - Project Network
- **Node Hover**: Highlights connected projects with visual and audio feedback
- **Node Click**: Displays detailed project information
- **Navigation**: Use arrow keys for accessibility

### Culture Section - Cellular Evolution
- **Mouse Movement**: Influences cell movement and division patterns
- **Click**: Adds environmental stimuli to accelerate growth
- **Controls**: 
  - `P` or Pause button: Pause/resume simulation
  - `R` or Reset button: Reset to single mother cell

## ♿ Accessibility Features

- **Keyboard Navigation**: Full functionality via keyboard shortcuts
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **High Contrast**: Adapts to `prefers-contrast` preferences
- **Alternative Navigation**: Text-based menu (Ctrl+/ to toggle)
- **Help System**: Keyboard shortcuts guide (Ctrl+H)

## 🎵 Audio System

The application features a sophisticated audio system that:

- Generates ambient soundscapes specific to each section
- Sonifies user interactions (mouse movement, scrolling, clicks)
- Respects browser autoplay policies with user-initiated activation
- Provides audio feedback for accessibility

Audio can be controlled through the user's system volume and will automatically initialize on first user interaction.

## 🔧 Performance Optimization

The application automatically adapts to device capabilities:

- **Low Performance**: Reduced particle counts, simplified geometry, disabled shadows
- **Medium Performance**: Balanced quality and performance
- **High Performance**: Full visual fidelity with advanced effects

Performance monitoring runs continuously and adjusts quality in real-time to maintain smooth frame rates.

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Legacy Support**: IE11 and older browsers via included polyfills
- **Mobile**: Optimized for iOS Safari and Android Chrome

## 📱 Responsive Design

- **Desktop**: Full immersive experience with all features
- **Tablet**: Adapted interactions for touch input
- **Mobile**: Simplified interface with optimized performance

## 🔒 Security & Privacy

- Implements comprehensive security headers
- No tracking or analytics by default
- Privacy-first design approach
- Secure content delivery with CSP headers

## 🎨 Design Philosophy

OmniHarmonic embodies digital ecological harmony through:

- **Sacred Geometry**: Golden ratio proportions in layout and animations
- **Organic Interactions**: Natural, breathing animations and organic growth patterns  
- **Systems Thinking**: Interconnected visualizations showing relationships
- **Inclusive Design**: Accessibility and performance as core principles
- **Sensory Integration**: Visual, audio, and haptic feedback working in harmony

## 📂 Project Structure

```
omniharmonic/
├── src/
│   ├── scenes/          # Three.js scene implementations
│   ├── utils/           # Performance, audio, accessibility managers
│   ├── styles/          # CSS with sacred geometry system
│   └── data/            # Portfolio and content data
├── public/              # Static assets
├── docs/                # Project documentation
└── dist/                # Production build output
```

## 🤝 Contributing

This is a portfolio project, but feedback and suggestions are welcome! Please feel free to:

- Report accessibility issues
- Suggest performance improvements  
- Share ideas for new interactions
- Contribute to documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Experience digital harmony at the intersection of art, technology, and consciousness.*