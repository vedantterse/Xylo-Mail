import { Metadata } from 'next'
export const metadata: Metadata = {
  metadataBase: new URL('https://mail.xylosync.in'),
  title: {
    default: 'XyloMail - The Simple Way to Email Files',
    template: '%s | XyloMail'
  },
  description: 'Instantly send files to any email address directly from your browser. Perfect for getting documents off public computers without signing in.',
  keywords: ['file sharing', 'XyloSync Mail', 'email attachments', 'xylomail', 'file transfer', 'secure file transfer','Xylomail email'],
  authors: [{ name: 'XyloSync' }],
  creator: 'vedantterse',
  publisher: 'XyloSync',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    },
  },
   openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mail.xylosync.in',
    siteName: 'XyloMail',
    title: 'XyloMail - The Simple Way to Email Files',
    description: 'Instantly send files to any email address directly from your browser. Perfect for getting documents off public computers without signing in.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XyloMail Preview'
      }
    ]
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
  
    ],
    }
}

