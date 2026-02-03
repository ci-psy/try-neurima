import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neurima - Transform Your Music Into Wellness',
  description: 'Neurima applies Imperceptible Musical Augmentation (IMA) to your music, engaging subconscious processing to promote relaxation, focus, and calm.',
  keywords: ['music', 'wellness', 'relaxation', 'focus', 'IMA', 'audio', 'mental health', 'stress relief'],
  authors: [{ name: 'Neurima' }],
  openGraph: {
    title: 'Neurima - Transform Your Music Into Wellness',
    description: 'Imperceptible Musical Augmentation that promotes relaxation and focus through your favorite music.',
    type: 'website',
    url: 'https://tryneurima.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurima - Transform Your Music Into Wellness',
    description: 'Imperceptible Musical Augmentation that promotes relaxation and focus through your favorite music.',
  },
  metadataBase: new URL('https://tryneurima.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <link rel="icon" href="/favicon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-dark.png" media="(prefers-color-scheme: dark)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="bg-gradient min-h-screen">
        {children}
      </body>
    </html>
  )
}
