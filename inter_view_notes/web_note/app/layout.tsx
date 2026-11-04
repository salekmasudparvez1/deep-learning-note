import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "Parvez AI Eng Routine",
  description: "A focused AI and ML interview preparation workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={jetBrainsMono.variable}>
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
