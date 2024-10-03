import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar/NavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WalletProvider } from "@/components/providers";

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
          <WalletProvider>
            <Navbar />
            {children}
            <ToastContainer
              position="bottom-right"
              autoClose={1000}
            />
          </WalletProvider>
        </main>
      </body>
    </html>
  );
}
