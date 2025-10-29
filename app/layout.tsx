import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
        {children}
      </body>
    </html>
  );
}
