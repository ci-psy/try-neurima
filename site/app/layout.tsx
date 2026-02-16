import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'
import { MouseGlow } from './components'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neurima - Of Sound Mind',
  description:
    'A timing desynchronization between your ears. Imperceptible, except to your nervous system.',
  icons: {
    icon: [
      { url: '/favicon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/apple-touch-icon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/apple-touch-icon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
  authors: [{ name: 'Neurima' }],
  keywords: [
    'Neurima',
    'Imperceptible Musical Augments',
    'IMA',
    'psychoacoustics',
    'binaural beats alternative',
    'audio desynchronization',
    'stress relief music',
    'focus music app',
  ],
  openGraph: {
    title: 'Neurima - Of Sound Mind',
    description:
      'A timing desynchronization between your ears. Imperceptible, except to your nervous system.',
    url: 'https://tryneurima.com/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurima - Of Sound Mind',
    description:
      'A timing desynchronization between your ears. Imperceptible, except to your nervous system.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MouseGlow />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
