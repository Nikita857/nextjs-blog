import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/UI/layout/header";
import { Providers } from "@/providers/provider";
import "./globals.css";
import { layoutConfig } from "@/config/layout.config";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth/auth";
import AppLoader from "@/hoc/app-loader";
import { ThemeProvider } from "next-themes";
import { siteConfig } from "@/config/site.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <SessionProvider session={session}>
              <AppLoader>
                <Header />
                <main
                  className={`flex flex-col w-full justify-start items-center`}
                  style={{
                    height: `calc(100vh - ${layoutConfig.headerHeight} - ${layoutConfig.footerHeight})`,
                  }}
                >
                  {children}
                </main>
                <footer
                  className={`flex h-[${layoutConfig.footerHeight}] w-full justify-center items-center`}
                >
                  <p>{siteConfig.description}</p>
                </footer>
              </AppLoader>
            </SessionProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
