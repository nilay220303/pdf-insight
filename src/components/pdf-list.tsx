"use client";

import type { PdfDocument } from "@/lib/types";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { FileText, Bot, Upload, Trash2 } from "lucide-react";
import { PdfUploader } from "./pdf-uploader";
import { Button } from "./ui/button";

interface PdfListProps {
  pdfs: PdfDocument[];
  activePdfId: string | null;
  onPdfSelect: (id: string) => void;
  onPdfUpload: (newPdfs: PdfDocument[]) => void;
  onPdfDelete: (id: string) => void;
}

export function PdfList({ pdfs, activePdfId, onPdfSelect, onPdfUpload, onPdfDelete }: PdfListProps) {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">PDF-Insight</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {pdfs.map((pdf) => (
            <SidebarMenuItem key={pdf.id}>
              <SidebarMenuButton
                onClick={() => onPdfSelect(pdf.id)}
                isActive={pdf.id === activePdfId}
                className="justify-start"
                tooltip={pdf.name}
              >
                <FileText />
                <span>{pdf.name}</span>
              </SidebarMenuButton>
              <SidebarMenuAction
                onClick={(e) => {
                  e.stopPropagation();
                  onPdfDelete(pdf.id);
                }}
                showOnHover
                aria-label={`Delete ${pdf.name}`}
              >
                <Trash2 />
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <PdfUploader onUpload={onPdfUpload}>
          <Button className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
        </PdfUploader>
      </SidebarFooter>
    </>
  );
}
