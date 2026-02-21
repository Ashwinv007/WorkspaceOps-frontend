import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "WorkspaceOps",
  description: "Workspace operations management",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <div id="mobile-message" style={{ display: "none" }}>
          Please open WorkspaceOps on a desktop browser.
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
