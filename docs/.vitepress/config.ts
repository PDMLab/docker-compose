import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'docker-compose',
  base: '/docker-compose/',
  description: 'Manage docker compose using Node.js',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting started', link: '/getting-started' }
    ],

    sidebar: [
      {
        text: 'Docs',
        items: [
          { text: 'Getting started', link: '/getting-started' },
          { text: 'API documentation', link: '/api' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pdmlab/docker-compose' },
      { icon: 'discord', link: 'https://discord.gg/pR6duvNHtV' }
    ]
  }
})
