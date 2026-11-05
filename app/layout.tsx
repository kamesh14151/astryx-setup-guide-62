import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
import '@astryxdesign/theme-neutral/theme.css'
import '@astryxdesign/theme-neutral/fonts.css'
import './globals.css'

import { Theme } from '@astryxdesign/core/theme'
import { defaultThemeSlug, themes } from '../src/astryx-themes'

export const metadata: Metadata = {
  title: 'Classic Gallery',
  description: 'A thoughtful gallery of everyday details.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/aj-logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/file_000000001640820bb05949a256f91b5d.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <Theme theme={themes[defaultThemeSlug]}>{children}</Theme>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
