import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Canvas React",
  description: "A declarative canvas rendering engine for React",
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/canvas' },
      { text: 'Examples', link: '/examples/basic' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Components',
          items: [
            { text: '<Canvas>', link: '/api/canvas' },
            { text: '<Group>', link: '/api/group' },
            { text: 'Shapes', link: '/api/shapes' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/canvas-react' }
    ]
  }
})