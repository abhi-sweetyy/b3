"use client";

import { useEffect, useState } from "react";

interface PDFViewerProps {
  pdfBytes: Uint8Array;
}

export default function PDFViewer({ pdfBytes }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (pdfBytes && pdfBytes.length > 0) {
        // Convert Uint8Array to Blob
        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        // Create object URL
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        // Clean up URL when component unmounts
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        setError("Invalid PDF data received");
      }
    } catch (err) {
      console.error("Error creating PDF URL:", err);
      setError("Failed to process PDF data");
    }
  }, [pdfBytes]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5169FE]" />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <iframe
        src={`${pdfUrl}#toolbar=0`}
        className="w-full h-full border-0"
        title="PDF Viewer"
      />
    </div>
  );
}
