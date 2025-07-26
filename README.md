# OmniHarmonic - ETHBoulder Experience

An immersive 3D web experience created specifically for ETHBoulder 2024, featuring Boulder's iconic Flatirons terrain and Ethereum-inspired visual design.

## 🏔️ Features

- **Interactive Boulder Terrain**: 3D rendering of Boulder's Flatirons climbing area with mouse-responsive interactions
- **3D Ethereum Logo**: Floating Ethereum symbol with dynamic lighting and rotation
- **Clean Glass Card UX**: Modern frosted glass interface with smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Performance Optimized**: Smooth 60fps experience across all devices

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript + Three.js for 3D graphics
- **Build**: Vite with ES2020 target and legacy browser support
- **Animation**: GSAP with ScrollTrigger for scroll-based interactions
- **Styling**: CSS3 with Custom Properties and modern glass morphism effects
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

## 🎮 Interaction Guide

### Homepage - Boulder Terrain
- **Mouse Movement**: Creates interactive effects across the 3D terrain
- **Scrolling**: Smooth parallax effects and animations
- **3D Ethereum Logo**: Continuously rotating with dynamic lighting

### Glass Card Interface
- **Hover Effects**: Subtle animations on interactive elements
- **Smooth Transitions**: Modern glass morphism design language
- **Responsive Layout**: Adapts seamlessly to different screen sizes

## ♿ Accessibility Features

- **Keyboard Navigation**: Full functionality via keyboard shortcuts
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **High Contrast**: Adapts to `prefers-contrast` preferences

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Legacy Support**: IE11 and older browsers via included polyfills
- **Mobile**: Optimized for iOS Safari and Android Chrome

## 📱 Responsive Design

- **Desktop**: Full immersive experience with all features
- **Tablet**: Adapted interactions for touch input
- **Mobile**: Simplified interface with optimized performance

## 🎨 Design Philosophy

OmniHarmonic for ETHBoulder embodies modern web design through:

- **Glass Morphism**: Contemporary frosted glass aesthetic
- **Smooth Animations**: Fluid, natural motion design
- **Performance First**: Optimized for smooth 60fps experience
- **Clean Typography**: Modern, readable text hierarchy
- **Ethereum Integration**: Subtle blockchain-inspired visual elements

## 📂 Project Structure

```
omniharmonic/
├── src/
│   ├── scenes/          # Three.js scene implementations
│   ├── components/      # React-style components
│   ├── styles/          # CSS with modern design system
│   └── data/            # ETHBoulder content data
├── public/              # Static assets including 3D models
└── dist/                # Production build output
```

## 🙏 Acknowledgments

**Boulder's Flatirons Climbing Area** by Shapespeare on Thingiverse: https://www.thingiverse.com/thing:1358558

**Summary:**
By request, a topo of the Flatirons climbing area outside of Boulder CO. The LIDAR data comes courtesy of Anderson, S.P., Qinghua, G., and Parrish, E.G., 2012, Snow-on and snow-off Lidar point cloud data and digital elevation models for study of topography, snow, ecosystems and environmental change at Boulder Creek Critical Zone Observatory, Colorado: Boulder Creek CZO, INSTAAR, University of Colorado at Boulder, digital media. by way of http://opentopo.sdsc.edu/

We talk about topos like this and a whole lot more on the 3D Printing Today podcast available on iTunes, or Stitcher radio learn more at http://www.threedprintingtoday.com/

## 🤝 Contributing

This is a special ETHBoulder experience, but feedback and suggestions are welcome! Please feel free to:

- Report accessibility issues
- Suggest performance improvements  
- Share ideas for new interactions
- Contribute to documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Experience the intersection of blockchain technology and Boulder's natural beauty.*