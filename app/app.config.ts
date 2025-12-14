export default defineAppConfig({
  global: {
    picture: {
      dark: 'https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      light:
        'https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'My profile picture'
    },
    meetingLink: 'https://calendly.com/ayoazeez26/30min',
    email: 'ayoazeez26@gmail.com',
    available: true
  },
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description:
          'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  },
  footer: {
    credits: `Built with Nuxt UI • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [
      {
        'icon': 'i-simple-icons-discord',
        'to': 'https://discord.com/users/1315843097070225448',
        'target': '_blank',
        'aria-label': 'Ayoazeez26 on Discord'
      },
      {
        'icon': 'i-simple-icons-x',
        'to': 'https://x.com/Ayoazeez26',
        'target': '_blank',
        'aria-label': 'Ayoazeez26 on X'
      },
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/Ayoazeez26',
        'target': '_blank',
        'aria-label': 'Ayoazeez26 on GitHub'
      }
    ]
  }
})
