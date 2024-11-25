import '../styles/globals.css';

import WalletProvider from '@/components/WalletProvider.jsx';

import { IsCompiledProvider } from '@/contexts/IsCompiledContext.js';

import Navbar from '@/app/(partials)/NavBar.jsx';
import ToastProvider from '@/app/(partials)/ToastProvider.jsx';

// TODO: uncomment
// const montserrat = Montserrat({
//   subsets: ['latin'],
//   weight: ['400', '700'],
// });

export const metadata = {
  title: 'zkVot',
  description: 'A zero-knowledge voting platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
    <body>
      {/* <body className={montserrat.className}> */}
        <div className='mobile-warning flex flex-col'>
          <div className='icon-container mb-[1rem] animate-pulse'>
            <svg
              width='80'
              height='80'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='computer-icon'
            >
              <rect
                x='2'
                y='4'
                width='20'
                height='14'
                rx='2'
                fill='#ffffff'
              />
              <rect
                x='5'
                y='18'
                width='14'
                height='2'
                fill='#ffffff'
              />
            </svg>
          </div>
          <span>
            Please use a larger screen for the best experience on zkVot.
          </span>
        </div>

        <main className='flex flex-col px-4 overflow-hidden'>
          <IsCompiledProvider>
            <ToastProvider>
              <WalletProvider>
                <Navbar />
                {children}
              </WalletProvider>
            </ToastProvider>
          </IsCompiledProvider>
        </main>
      </body>
    </html>
  );
}
