import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Peregrino — A Jornada de Davi',
  description:
    'Plataforma de engajamento bíblico que transforma as Escrituras em jornadas interativas.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0d0805" />
        <link
          rel="preload"
          href="/fonts/cinzel-var-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
