import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

// Use system fonts to avoid network dependency on Google Fonts
const inter = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  preload: false,
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-mono',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  preload: false,
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Organized AI Marketplace - Claude Code Components',
  description: 'Discover and install AI agents, MCPs, commands, and skills for Claude Code. 500+ community-contributed components.',
  keywords: ['Claude Code', 'AI Agents', 'MCPs', 'Developer Tools', 'Marketplace'],
  authors: [{ name: 'Organized AI' }],
  openGraph: {
    title: 'Organized AI Marketplace',
    description: 'Discover Claude Code components',
    url: 'https://aitmpl.com',
    siteName: 'Organized AI Marketplace',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Organized AI Marketplace',
    description: 'Discover Claude Code components',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
