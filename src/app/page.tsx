"use client";

import { useState } from "react";
import type { PdfDocument } from "@/lib/types";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { PdfList } from "@/components/pdf-list";
import { ChatView } from "@/components/chat-view";

export default function Home() {
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);

  const activePdf = pdfs.find((pdf) => pdf.id === activePdfId) || null;

  const handlePdfUpload = (newPdfs: PdfDocument[]) => {
    setPdfs((prevPdfs) => [...prevPdfs, ...newPdfs]);
    if (!activePdfId && newPdfs.length > 0) {
      setActivePdfId(newPdfs[0].id);
    }
  };

  const handlePdfDelete = (pdfId: string) => {
    const newPdfs = pdfs.filter((pdf) => pdf.id !== pdfId);
    setPdfs(newPdfs);

    if (activePdfId === pdfId) {
      if (newPdfs.length > 0) {
        setActivePdfId(newPdfs[0].id);
      } else {
        setActivePdfId(null);
      }
    }
  };

  const updateChatHistory = (pdfId: string, newHistory: PdfDocument['chatHistory']) => {
    setPdfs(pdfs.map(pdf => pdf.id === pdfId ? { ...pdf, chatHistory: newHistory } : pdf));
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <PdfList
          pdfs={pdfs}
          activePdfId={activePdfId}
          onPdfSelect={setActivePdfId}
          onPdfUpload={handlePdfUpload}
          onPdfDelete={handlePdfDelete}
        />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <ChatView 
            pdf={activePdf} 
            onChatHistoryChange={updateChatHistory}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
