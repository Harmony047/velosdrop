import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "auth"; // the file we made earlier
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Provider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "VelosDrop | On-Demand Local Delivery",
  description: "Fast and reliable delivery of your goods",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Provider session={session}>
          <Navbar />
          <main className="relative overflow-hidden">
            {children}
          </main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
