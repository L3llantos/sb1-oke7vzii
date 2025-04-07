import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { OfflineBanner } from "@/components/offline-banner"
import { NavigationBar } from "@/components/navigation-bar"
import { RefreshProvider } from "@/lib/refresh-context"
import { ThemeProvider } from "@/components/theme-provider"
import AuthWrapper from "@/components/auth-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitQuest - Adventure Through Fitness",
  description: "Embark on an epic journey powered by your real-world fitness activities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <RefreshProvider>
            <AuthWrapper>
              <OfflineBanner />
              <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
                <div className="flex-1 pb-16">{children}</div>
                <NavigationBar />
              </div>
            </AuthWrapper>
          </RefreshProvider>
        </ThemeProvider>

        {/* Add service worker registration script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(error) {
                      console.log('ServiceWorker registration failed: ', error);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}



import './globals.css'