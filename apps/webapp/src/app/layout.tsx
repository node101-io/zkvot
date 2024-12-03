import "../styles/globals.css";

import Navbar from "@/app/(partials)/NavBar";

import WalletProvider from "@/components/WalletProvider";

import { ZKProgramCompileProvider } from "@/contexts/ZKProgramCompileContext";
import { ToastProvider } from "@/contexts/ToastContext";

// TODO: uncomment
// const montserrat = Montserrat({
//   subsets: ['latin'],
//   weight: ['400', '700'],
// });

export const metadata = {
  title: "zkVot - World's first fully live anonymous voting application!",
  description: `
    zkVot is a client side trustless distributed computation protocol designed to achieve anonymous and censorship resistant voting while ensuring scalability. The protocol is created as an example of how modular and distributed computation may improve both decentralization and scalability of the internet.
    zkVot brings various distributed layers (e.g. blockchains), zero knowledge proving technology, and client side computation together to make most of the distributed value on an actual use case. By implementing this project, our main goal is to show that the technology is ready, and it is just a matter of time and perspective to bring decentralization into the life of the actual end user.
  `,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <body className={montserrat.className}> */}
        <div className="mobile-warning flex flex-col">
          <div className="icon-container mb-[1rem] animate-pulse">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="computer-icon"
            >
              <rect x="2" y="4" width="20" height="14" rx="2" fill="#ffffff" />
              <rect x="5" y="18" width="14" height="2" fill="#ffffff" />
            </svg>
          </div>
          <span>
            Please use a larger screen for the best experience on zkVot.
          </span>
        </div>

        <main className="flex flex-col px-4 overflow-hidden">
          <ZKProgramCompileProvider>
            <ToastProvider>
              <WalletProvider>
                <Navbar />
                {children}
              </WalletProvider>
            </ToastProvider>
          </ZKProgramCompileProvider>
        </main>
      </body>
    </html>
  );
}
