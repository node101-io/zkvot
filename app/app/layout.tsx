import "../styles/globals.css";

import { Montserrat } from "next/font/google";
import Navbar from "../components/NavBar/NavBar";
import { WalletProvider } from "../components/providers";
import ToastProvider from "../components/ToastProvider";
import { IsCompiledProvider } from "../contexts/IsCompiledContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "ZKvote",
  description: "A zero-knowledge voting platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <main className="flex flex-col px-4 overflow-hidden">
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
