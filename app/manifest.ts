import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kashikari',
    short_name: 'Kashikari',
    description: '割り勘・貸し借り管理アプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f1e',
    theme_color: '#10b981',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
