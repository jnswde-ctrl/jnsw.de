import type { Metadata } from "next";
import "./globals.css";
import "./tools/tools.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jnsw.de"),
  title: "JNSW.DE — Digital products & identities",
  description: "JNSW.DE gestaltet Marken und digitale Erlebnisse für Menschen, die etwas vorhaben.",
  openGraph: { title: "JNSW.DE — Digital products & identities", images: ["/og.png"] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
