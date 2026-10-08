import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { company } from "@/config/company"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
})

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "vietnamese"],
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
})

export const metadata: Metadata = {
  title: `${company.brand} Explorer · Cảm hứng du lịch`,
  description: `Khám phá điểm đến, thời tiết, lưu trú, ăn chơi và đặt tour cùng ${company.brand}.`,
}

export const viewport: Viewport = {
  themeColor: "#080e14",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Áp giao diện đã lưu trước khi vẽ để không nháy tối sang sáng. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("explorer-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body className={`${jakarta.variable} ${bricolage.variable} ${playfair.variable}`}>
        {children}
        <Toaster position="top-center" richColors={false} />
      </body>
    </html>
  )
}
