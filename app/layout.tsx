import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import {Room} from "./Room";

//调整字体
const work_sans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight:['400','600','700']
});

//调整名字
export const metadata: Metadata = {
  title: "Figma Clone",
  description: "A mvp Figma Clone For Real Time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${work_sans.className} bg-primary-grey-200`}>
        <Room>
        {children}
        </Room>
      </body>
    </html>
  );
}
