import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Die Community von JNSW.DE sammelt Menschen und Perspektiven rund um Marken, digitale Produkte und verantwortungsvolle digitale Arbeit.",
};

export default function CommunityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
