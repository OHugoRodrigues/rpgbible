import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peregrino',
  description: 'Plataforma de engajamento bíblico — infraestrutura em construção.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
