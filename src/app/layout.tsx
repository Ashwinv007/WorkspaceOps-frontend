import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "WorkspaceOps",
  description: "Workspace operations management",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <div id="mobile-message" style={{ display: "none" }}>
          Please open WorkspaceOps on a desktop browser.
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
