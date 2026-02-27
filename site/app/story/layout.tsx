import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Story - Neurima',
  description: 'The story behind Neurima and Imperceptible Musical Augments.',
  alternates: {
    canonical: 'https://tryneurima.com/story/',
  },
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
