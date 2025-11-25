import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ulinify',
    short_name: 'Ulinify',
    description: 'Platform untuk mengurangi jejak karbon dengan tantangan ramah lingkungan',
    start_url: '/',
    display: 'standalone',
    background_color: '#001E31',
    theme_color: '#FF00BF',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}