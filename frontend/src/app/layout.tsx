import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notes & Labels',
  description: 'A flexible notes management app with labeling system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}