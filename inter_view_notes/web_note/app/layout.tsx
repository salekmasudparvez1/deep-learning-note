import "./globals.css";
import { AppHeader } from "@/components/app-header";

export const metadata = {
  title: "Parvez AI Eng Routine",
  description: "A focused AI and ML interview preparation workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
