import './globals.css';
import Providers from './providers';
export const metadata = { title: 'QMart — Fresh Groceries', description: 'Farm-to-fork quick commerce' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
