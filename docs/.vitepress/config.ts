import { defineConfig } from 'vitepress'
import { buildEndGenerateOpenGraphImages } from '@nolebase/vitepress-plugin-og-image/vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'docker-compose',
  base: '/docker-compose/',
  description: 'Manage docker compose using Node.js',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting started', link: '/getting-started' },
      { text: 'API', link: '/api' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting started', link: '/getting-started' },
          { text: 'API Overview', link: '/api' }
        ]
      },
      {
        text: 'Commands',
        items: [
          { text: 'up', link: '/commands/up' },
          { text: 'down', link: '/commands/down' },
          { text: 'stop', link: '/commands/stop' },
          { text: 'restart', link: '/commands/restart' },
          { text: 'build', link: '/commands/build' },
          { text: 'create', link: '/commands/create' },
          { text: 'pull', link: '/commands/pull' },
          { text: 'push', link: '/commands/push' },
          { text: 'config', link: '/commands/config' },
          { text: 'ps', link: '/commands/ps' },
          { text: 'images', link: '/commands/images' },
          { text: 'logs', link: '/commands/logs' },
          { text: 'exec', link: '/commands/exec' },
          { text: 'run', link: '/commands/run' },
          { text: 'rm', link: '/commands/rm' },
          { text: 'kill', link: '/commands/kill' },
          { text: 'pause', link: '/commands/pause' },
          { text: 'port', link: '/commands/port' },
          { text: 'version', link: '/commands/version' },
          { text: 'stats', link: '/commands/stats' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pdmlab/docker-compose' },
      { icon: 'discord', link: 'https://discord.gg/pR6duvNHtV' }
    ]
  },

  async buildEnd(siteConfig) {
    await buildEndGenerateOpenGraphImages({
      baseUrl: 'https://pdmlab.github.io/docker-compose/',
      category: {
        fallbackWithFrontmatter: true
      }
    })(siteConfig)
  }
})
