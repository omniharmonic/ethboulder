import * as Tone from 'tone'

export class AudioManager {
  constructor() {
    this.isInitialized = false
    this.isPaused = false
    this.masterVolume = 0.3
    this.ambientSynth = null
    this.interactionSynths = new Map()
    this.currentSection = 'homepage'
    
    // Audio context settings
    this.setupAudioContext()
  }

  setupAudioContext() {
    // Audio context will be started on first user interaction
    // This is handled automatically by Tone.js and the browser
    console.log('🎵 Audio context ready for user interaction')
  }

  async init() {
    if (this.isInitialized) return
    
    try {
      // Start Tone.js audio context
      await Tone.start()
      console.log('🎵 Audio context started')
      
      // Create synthesizers
      this.createSynthesizers()
      
      // Set initial volume
      this.setMasterVolume(this.masterVolume)
      
      this.isInitialized = true
      console.log('🎵 Audio manager initialized')
      
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      // Gracefully handle audio failure
      this.isInitialized = false
    }
  }

  createSynthesizers() {
    // Ambient synthesis for atmospheric sounds
    this.ambientSynth = new Tone.PolySynth({
      oscillator: {
        type: 'sine',
        modulationType: 'sine',
        modulationFrequency: 0.1
      },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.3,
        release: 4
      },
      volume: -20
    }).toDestination()

    // Mouse interaction sounds
    this.interactionSynths.set('wave', new Tone.Synth({
      oscillator: { 
        type: 'sine',
        modulationType: 'sine',
        modulationFrequency: 2
      },
      envelope: { 
        attack: 0.02, 
        decay: 0.1, 
        sustain: 0, 
        release: 0.2 
      },
      volume: -25
    }).toDestination())

    // Node selection sounds
    this.interactionSynths.set('node', new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 10,
      envelope: { 
        attack: 0.01, 
        decay: 0.01, 
        sustain: 0.2, 
        release: 0.2 
      },
      volume: -20
    }).toDestination())

    // Cell division sounds
    this.interactionSynths.set('cell', new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.7,
      volume: -18
    }).toDestination())

    // Scroll interaction sounds
    this.interactionSynths.set('scroll', new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { 
        attack: 0.005, 
        decay: 0.1, 
        sustain: 0.1, 
        release: 0.3 
      },
      volume: -30
    }).toDestination())
  }

  playTone(frequency, duration = 0.1, synthType = 'wave', delay = 0) {
    if (!this.isInitialized || this.isPaused) return
    
    const synth = this.interactionSynths.get(synthType)
    if (synth) {
      if (delay > 0) {
        synth.triggerAttackRelease(frequency, duration, `+${delay}`)
      } else {
        synth.triggerAttackRelease(frequency, duration)
      }
    }
  }

  playAmbientChord(frequencies = ['C4', 'E4', 'G4'], duration = '2n') {
    if (!this.isInitialized || this.isPaused || !this.ambientSynth) return
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.ambientSynth.triggerAttackRelease(freq, duration)
      }, index * 100)
    })
  }

  // Context-aware ambient soundscapes for different sections
  updateAmbientForSection(section) {
    if (!this.isInitialized || this.isPaused) return
    
    this.currentSection = section
    
    const soundscapes = {
      homepage: {
        frequencies: ['C3', 'G3', 'C4'],
        duration: '1n',
        interval: 8000
      },
      systems: {
        frequencies: ['D3', 'F#3', 'A3', 'D4'],
        duration: '2n',
        interval: 6000
      },
      culture: {
        frequencies: ['E3', 'G#3', 'B3', 'E4'],
        duration: '4n',
        interval: 4000
      }
    }

    const config = soundscapes[section]
    if (config) {
      // Clear existing ambient intervals
      if (this.ambientInterval) {
        clearInterval(this.ambientInterval)
      }
      
      // Set new ambient pattern
      this.ambientInterval = setInterval(() => {
        if (!this.isPaused && this.currentSection === section) {
          this.playAmbientChord(config.frequencies, config.duration)
        }
      }, config.interval)
      
      // Play immediate chord
      this.playAmbientChord(config.frequencies, config.duration)
    }
  }

  // Mouse movement sonification
  sonifyMouseMovement(x, y, intensity = 1) {
    if (!this.isInitialized || this.isPaused) return
    
    // Map mouse position to frequency
    const baseFreq = 200
    const freq = baseFreq + (x * 300) + (y * 200)
    
    // Randomize playback to avoid overwhelming
    if (Math.random() < 0.1 * intensity) {
      this.playTone(freq, 0.1, 'wave')
    }
  }

  // Scroll sonification
  sonifyScroll(progress, direction = 1) {
    if (!this.isInitialized || this.isPaused) return
    
    const baseFreq = 150
    const freq = baseFreq + (progress * 400)
    
    if (Math.random() < 0.2) {
      this.playTone(freq, 0.05, 'scroll')
    }
  }

  // Network node interaction
  playNodeSound(nodeData) {
    if (!this.isInitialized || this.isPaused) return
    
    // Map node properties to musical parameters
    const baseFreq = 220
    const freq = baseFreq * Math.pow(2, (nodeData.index % 12) / 12)
    
    this.playTone(freq, 0.3, 'node')
  }

  // Cell division sound
  playCellDivision(generation, position) {
    if (!this.isInitialized || this.isPaused) return
    
    // Higher pitch for later generations
    const baseFreq = 330
    const freq = baseFreq * Math.pow(1.1, generation % 10)
    
    this.playTone(freq, 0.2, 'cell', Math.random() * 0.1)
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.isInitialized) {
      Tone.Destination.volume.value = Tone.gainToDb(this.masterVolume)
    }
  }

  fadeIn(duration = 1000) {
    if (!this.isInitialized) return
    
    Tone.Destination.volume.rampTo(Tone.gainToDb(this.masterVolume), duration / 1000)
  }

  fadeOut(duration = 1000) {
    if (!this.isInitialized) return
    
    Tone.Destination.volume.rampTo(-Infinity, duration / 1000)
  }

  pause() {
    this.isPaused = true
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval)
    }
    if (this.isInitialized) {
      Tone.Transport.pause()
    }
  }

  resume() {
    this.isPaused = false
    if (this.isInitialized) {
      Tone.Transport.start()
      this.updateAmbientForSection(this.currentSection)
    }
  }

  update(deltaTime) {
    // Update any time-based audio parameters
    if (!this.isInitialized || this.isPaused) return
    
    // Could be used for dynamic audio parameter modulation
  }

  dispose() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval)
    }
    
    if (this.ambientSynth) {
      this.ambientSynth.dispose()
    }
    
    this.interactionSynths.forEach(synth => synth.dispose())
    this.interactionSynths.clear()
    
    this.isInitialized = false
  }
}