import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar/NavBar";
import { WalletProvider } from "@/components/providers";
import ToastProvider from "@/components/ToastProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "ZKvote",
  description: "A zero-knowledge voting platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <main className="flex flex-col px-4 overflow-hidden">
          <ToastProvider>
            <WalletProvider>
              <Navbar />
              {children}
            </WalletProvider>
          </ToastProvider>
        </main>
      </body>
    </html>
  );
}
