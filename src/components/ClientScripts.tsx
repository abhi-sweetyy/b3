"use client";

import Script from "next/script";

export default function ClientScripts() {
  return (
    <Script
      src="/german-slides-embed.js"
      strategy="beforeInteractive"
      id="german-slides-script"
    />
  );
} 