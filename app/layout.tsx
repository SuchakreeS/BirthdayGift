import type { Metadata } from "next";
import { Noto_Serif_Thai, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

// Cormorant Garamond/Jost (the original pick) only cover Latin glyphs, so
// every Thai character on the site — most of the copy — was silently
// falling back to whatever default font the OS/browser picked, mismatched
// in size/weight against the Latin bits sitting right next to it. These
// two cover Thai and Latin in the same family, so both scripts share
// consistent metrics everywhere.
const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-display",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-body",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Birthday4U",
  description: "A little something for you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${notoSerifThai.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
