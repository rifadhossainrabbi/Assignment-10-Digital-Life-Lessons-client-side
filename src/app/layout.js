import { Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata = {
  title: 'Digital Life Lessons',
  description: 'Wisdom Sanctuary Platform',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${roboto.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer/>

        {/* Fixed Toaster with High Z-Index */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerStyle={{
            zIndex: 99999,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#d4af37', 
              border: '1px solid #d4af37',
            },
            success: {
              iconTheme: {
                primary: '#d4af37',
                secondary: '#1a1a1a',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
