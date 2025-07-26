export const portfolioData = {
  systems: [
    {
      id: 'systems-001',
      title: 'Urban Regeneration Network',
      description: 'Multi-stakeholder platform uniting communities, planners, and scientists to co-create sustainable urban solutions through systems thinking.',
      tags: ['systems-thinking', 'urban-planning', 'sustainability', 'collaboration'],
      connections: ['systems-003', 'culture-002'],
      impact: 0.85,
      complexity: 0.75,
      status: 'active',
      year: 2023,
      content: {
        overview: 'A comprehensive platform that bridges community leaders, urban planners, environmental scientists, and residents to collaboratively design and implement sustainable urban regeneration strategies.',
        methodology: 'Integrates complex adaptive systems theory with participatory design, creating feedback loops between stakeholders to understand and positively intervene in urban ecosystem dynamics.',
        outcomes: 'Successfully deployed in 3 pilot neighborhoods with measurable results: 40% increase in community engagement, 25% reduction in urban heat island effect, and formation of 5 ongoing community-led initiatives.'
      }
    },
    {
      id: 'systems-002', 
      title: 'Supply Chain Resilience Model',
      description: 'AI-powered system that predicts supply chain vulnerabilities and automatically adapts to disruptions in real-time.',
      tags: ['systems-modeling', 'resilience', 'logistics', 'ai'],
      connections: ['systems-001', 'systems-004'],
      impact: 0.70,
      complexity: 0.90,
      status: 'development',
      year: 2024,
      content: {
        overview: 'An intelligent early warning system that combines network analysis and machine learning to identify supply chain vulnerabilities before they become critical disruptions.',
        methodology: 'Leverages graph theory, machine learning algorithms, and systems dynamics modeling to create self-adapting supply network simulations that continuously learn from real-world data.',
        outcomes: 'Demonstrated 60% reduction in supply disruption impact across 5 major manufacturing partners, with average recovery time decreased from 3 weeks to 5 days.'
      }
    },
    {
      id: 'systems-003',
      title: 'Educational Ecosystem Design',
      description: 'Holistic framework for designing learning environments that adapt to individual and collective needs.',
      tags: ['education', 'systems-design', 'learning', 'adaptation'],
      connections: ['systems-001', 'culture-001'],
      impact: 0.80,
      complexity: 0.65,
      status: 'pilot',
      year: 2023,
      content: {
        overview: 'A systemic approach to educational design that treats learning as an emergent property of dynamic interactions between learners, educators, content, and environment.',
        methodology: 'Applied complexity science and learning sciences to design adaptive educational experiences.',
        outcomes: '35% improvement in learning outcomes, 50% increase in student engagement across pilot programs.'
      }
    },
    {
      id: 'systems-004',
      title: 'Biomimetic Network Architecture',
      description: 'Infrastructure design inspired by natural systems for enhanced resilience and adaptability.',
      tags: ['biomimicry', 'networks', 'infrastructure', 'design'],
      connections: ['systems-002'],
      impact: 0.65,
      complexity: 0.80,
      status: 'research',
      year: 2024,
      content: {
        overview: 'Applying principles from biological networks to create more resilient and adaptive technological infrastructure.',
        methodology: 'Cross-disciplinary research combining biology, systems engineering, and network theory.',
        outcomes: 'Prototype developed, 2 patents filed, collaboration with major infrastructure providers.'
      }
    }
  ],
  
  culture: [
    {
      id: 'culture-001',
      title: 'Community Storytelling Networks',
      description: 'Participatory platforms that help communities document, share, and evolve their collective narratives.',
      tags: ['storytelling', 'community', 'digital-culture', 'participation'],
      connections: ['culture-002', 'systems-003'],
      impact: 0.75,
      complexity: 0.55,
      status: 'active',
      year: 2022,
      content: {
        overview: 'Digital and physical spaces where community members collaboratively create and evolve stories that capture their shared experiences and aspirations.',
        methodology: 'Combines ethnographic methods with digital storytelling tools and community organizing principles.',
        outcomes: '12 communities engaged, 200+ stories documented, 3 policy changes influenced by community narratives.'
      }
    },
    {
      id: 'culture-002',
      title: 'Regenerative Cultural Practices',
      description: 'Research and development of cultural practices that support both human and ecological wellbeing.',
      tags: ['regeneration', 'ecology', 'culture', 'sustainability'],
      connections: ['culture-001', 'systems-001'],
      impact: 0.90,
      complexity: 0.70,
      status: 'research',
      year: 2024,
      content: {
        overview: 'Investigation into how cultural practices can actively contribute to ecological restoration and community resilience.',
        methodology: 'Interdisciplinary research combining anthropology, ecology, and systems theory.',
        outcomes: 'Framework adopted by 5 cultural organizations, 3 academic publications, ongoing partnerships with environmental groups.'
      }
    },
    {
      id: 'culture-003',
      title: 'Collective Memory Archives',
      description: 'Digital preservation and interactive exploration of community memories and cultural heritage.',
      tags: ['memory', 'heritage', 'digital-archives', 'community'],
      connections: ['culture-001'],
      impact: 0.70,
      complexity: 0.60,
      status: 'active',
      year: 2023,
      content: {
        overview: 'Interactive digital archives that preserve and make accessible the collective memories and cultural heritage of communities.',
        methodology: 'Combines digital humanities, community engagement, and interactive design methodologies.',
        outcomes: '8 community archives created, 5000+ stories preserved, award for digital heritage innovation.'
      }
    },
    {
      id: 'culture-004',
      title: 'Ritual Design for Modern Communities',
      description: 'Creating meaningful ceremonies and rituals that support contemporary community building.',
      tags: ['ritual', 'ceremony', 'community', 'design'],
      connections: ['culture-002'],
      impact: 0.80,
      complexity: 0.50,
      status: 'pilot',
      year: 2024,
      content: {
        overview: 'Designing contemporary rituals and ceremonies that foster community connection and mark important transitions.',
        methodology: 'Anthropological research combined with participatory design and community co-creation.',
        outcomes: '15 communities engaged, 25+ rituals designed, featured in cultural design publications.'
      }
    }
  ],
  
  story: [
    {
      id: 'story-001',
      title: 'The Mycelial Web',
      description: 'A speculative fiction narrative exploring how fungal networks might inspire new forms of human organization.',
      tags: ['speculative-fiction', 'biomimicry', 'networks', 'collaboration'],
      connections: [],
      impact: 0.60,
      complexity: 0.40,
      status: 'published',
      year: 2023,
      content: {
        overview: 'A story that imagines a future where human communities organize themselves based on principles learned from mycorrhizal networks.',
        methodology: 'Speculative design fiction methodology combined with scientific research on fungal networks.',
        outcomes: 'Published in 3 journals, adapted for immersive theater experience, inspired community organizing workshop series.'
      }
    },
    {
      id: 'story-002',
      title: 'Emergent Futures Workshop Series',
      description: 'Interactive storytelling workshops that help communities imagine and plan for regenerative futures.',
      tags: ['futures', 'workshops', 'storytelling', 'imagination'],
      connections: ['culture-001'],
      impact: 0.75,
      complexity: 0.45,
      status: 'active',
      year: 2024,
      content: {
        overview: 'Workshop series using speculative storytelling to help communities envision and work toward regenerative futures.',
        methodology: 'Combines futures thinking, participatory storytelling, and community organizing methodologies.',
        outcomes: '20 workshops delivered, 500+ participants, 10 community action plans developed.'
      }
    },
    {
      id: 'story-003',
      title: 'Living Systems Narratives',
      description: 'Stories exploring the intersection of human consciousness and ecological intelligence.',
      tags: ['ecology', 'consciousness', 'narratives', 'living-systems'],
      connections: ['systems-001'],
      impact: 0.65,
      complexity: 0.50,
      status: 'published',
      year: 2023,
      content: {
        overview: 'Collection of narratives exploring how human consciousness might evolve in deeper relationship with ecological intelligence.',
        methodology: 'Interdisciplinary synthesis of systems thinking, ecology, and speculative fiction.',
        outcomes: 'Book published, 2 literary awards, adapted for podcast series with 50k+ downloads.'
      }
    }
  ]
}

// Content loading utility
export class ContentLoader {
  static async loadPortfolioData() {
    try {
      return portfolioData
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
      return { systems: [], culture: [], story: [] }
    }
  }

  static async loadProjectDetails(projectId) {
    const allProjects = [
      ...portfolioData.systems,
      ...portfolioData.culture, 
      ...portfolioData.story
    ]
    
    return allProjects.find(project => project.id === projectId)
  }

  static getProjectsByTag(tag) {
    const allProjects = [
      ...portfolioData.systems,
      ...portfolioData.culture,
      ...portfolioData.story  
    ]
    
    return allProjects.filter(project => 
      project.tags.includes(tag)
    )
  }

  static getConnectedProjects(projectId) {
    const project = this.loadProjectDetails(projectId)
    if (!project || !project.connections) return []
    
    return project.connections.map(id => this.loadProjectDetails(id)).filter(Boolean)
  }
}