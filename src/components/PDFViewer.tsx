"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Button } from "./ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = () => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.5 && value <= 3.0) {
      setScale(value);
    }
  };

  const resetZoom = () => setScale(1.0);

  return (
    <div className="flex flex-col h-screen bg-background  ">
      {/* Toolbar */}
      <div className="border-b bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <span className="text-sm font-medium">{pageNumber}</span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {numPages || "—"}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber >= (numPages || 1)}
              onClick={() =>
                setPageNumber((p) => Math.min(p + 1, numPages || 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <input
                type="number"
                min="0.5"
                max="3.0"
                step="0.1"
                value={scale.toFixed(2)}
                onChange={handleZoomInputChange}
                className="w-16 bg-transparent text-center text-sm font-medium outline-none"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale((s) => Math.min(s + 0.25, 3.0))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-x-scroll l flex items-center justify-center bg-muted/30 p-4 w-full">
        <Document
          file="https://arxiv.org/pdf/1706.03762v1"
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-center text-muted-foreground">
              Loading PDF...
            </div>
          }
          error={
            <div className="text-center text-destructive">
              Failed to load PDF
            </div>
          }
        >
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={scale}
            />
          </div>
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
