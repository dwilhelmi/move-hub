import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { HubProvider } from "@/components/providers/hub-provider"
import { LayoutClient } from "./layout-client"

const inter = Inter({ subsets: ["latin"] })

// Force dynamic rendering since all pages require authentication
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Move Hub - Your Moving Companion",
  description: "Plan your move from start to finish",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <HubProvider>
              <LayoutClient>{children}</LayoutClient>
            </HubProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
