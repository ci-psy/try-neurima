import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'
import { CardSpotlight, Nav } from './components'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neurima - Same music. Different mind.',
  description:
    'You won\'t hear it. Your subconscious will.',
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
    'wellness music app',
    'focus music app',
  ],
  alternates: {
    canonical: 'https://tryneurima.com/',
  },
  openGraph: {
    title: 'Neurima - Same music. Different mind.',
    description:
      'You won\'t hear it. Your subconscious will.',
    url: 'https://tryneurima.com/',
    type: 'website',
    images: [{ url: 'https://tryneurima.com/og.png', width: 1200, height: 630, alt: 'Neurima' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurima - Same music. Different mind.',
    description:
      'You won\'t hear it. Your subconscious will.',
    images: ['https://tryneurima.com/og.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Neurima',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'You won\'t hear it. Your subconscious will.',
  url: 'https://tryneurima.com/',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CardSpotlight />
          <Nav />
          <div className="relative z-[1]">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
