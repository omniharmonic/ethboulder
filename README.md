# OmniHarmonic - ETHBoulder Experience

An immersive 3D web experience created specifically for ETHBoulder 2024, embodying "digital ecological harmony" through interactive visualizations that showcase the intersection of blockchain technology and consciousness.

## 🏔️ ETHBoulder Special Features

- **ETHBoulder Track Visualization**: Interactive 3D network showcasing the 5 main conference tracks
  - **AI Track**: AI-powered smart contracts and machine learning applications
  - **ETH Localism Track**: Building local Ethereum communities and ecosystems  
  - **App Track**: Application development and Web3 UX/UI design
  - **Abundance Track**: Regenerative finance and prosperity technology
  - **Protocol Layer Track**: Core Ethereum protocol development and infrastructure
- **Interactive Topographical Landscape**: 2D to 3D transformation representing the Boulder landscape
- **Cellular Growth Simulation**: Organic particle system showing the evolution of blockchain communities
- **Spatial Audio Design**: Context-aware soundscapes for each conference track
- **Sacred Geometry**: Golden ratio proportions reflecting the harmony of blockchain ecosystems

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript + Three.js for immersive 3D graphics
- **Build**: Vite with ES2020 target and legacy browser support
- **Animation**: GSAP with ScrollTrigger for scroll-based interactions
- **Audio**: Tone.js for interactive sound synthesis
- **Styling**: CSS3 with Custom Properties and sacred geometry proportions
- **Deployment**: Vercel with optimized caching and security headers

## 🚀 Quick Start

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

## 🎮 ETHBoulder Interaction Guide

### Homepage - Boulder Landscape
- **Mouse Movement**: Creates sound waves and terrain interaction
- **Scrolling**: Transforms 2D contour map into 3D terrain representing Boulder's mountains
- **Audio**: Ambient soundscape with mouse sonification

### Systems Section - Conference Tracks Network
- **Track Hover**: Highlights connected tracks with visual and audio feedback
- **Track Click**: Displays detailed information about each ETHBoulder track
- **Navigation**: Use arrow keys for accessibility

### Culture Section - Community Evolution
- **Mouse Movement**: Influences cell movement and division patterns representing community growth
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

- Generates ambient soundscapes specific to each ETHBoulder track
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

## 🎨 Design Philosophy

OmniHarmonic for ETHBoulder embodies digital ecological harmony through:

- **Sacred Geometry**: Golden ratio proportions in layout and animations
- **Organic Interactions**: Natural, breathing animations and organic growth patterns  
- **Systems Thinking**: Interconnected visualizations showing relationships between blockchain tracks
- **Inclusive Design**: Accessibility and performance as core principles
- **Sensory Integration**: Visual, audio, and haptic feedback working in harmony

## 📂 Project Structure

```
omniharmonic/
├── src/
│   ├── scenes/          # Three.js scene implementations
│   ├── utils/           # Performance, audio, accessibility managers
│   ├── styles/          # CSS with sacred geometry system
│   └── data/            # ETHBoulder tracks and portfolio data
├── public/              # Static assets
└── dist/                # Production build output
```

## 🤝 Contributing

This is a special ETHBoulder experience, but feedback and suggestions are welcome! Please feel free to:

- Report accessibility issues
- Suggest performance improvements  
- Share ideas for new interactions
- Contribute to documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Experience digital harmony at the intersection of blockchain technology, consciousness, and the Boulder ecosystem.*