import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Canvas React",
  description: "A declarative canvas rendering engine for React",
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/basic' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Overview',
          link: '/guide/'
        },
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'Interactive Events', link: '/guide/events' },
            { text: 'Groups vs Layers', link: '/guide/groups-vs-layers' },
            { text: 'Layers & Performance', link: '/guide/layers' },
            { text: 'Exporting', link: '/guide/exporting' },
            { text: 'Animations', link: '/guide/animations' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Overview',
          link: '/api/'
        },
        {
          text: 'Components',
          items: [
            { text: 'Canvas', link: '/api/canvas' },
            { text: 'Groups vs Layers', link: '/guide/groups-vs-layers' },
            { text: 'Group', link: '/api/group' },
            { text: 'Layer', link: '/api/layer' },
            { text: 'Shapes', link: '/api/shapes' }
          ]
        },
        {
          text: 'Core API',
          items: [
            { text: 'Node', link: '/api/node' },
            { text: 'Timeline', link: '/api/timeline' },
            { text: 'Tween', link: '/api/tween' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/canvas-react' }
    ]
  }
})