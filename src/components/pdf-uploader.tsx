"use client";

import { useRef, type ReactNode } from "react";
import type { PdfDocument } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface PdfUploaderProps {
  children: ReactNode;
  onUpload: (pdfs: PdfDocument[]) => void;
}

export function PdfUploader({ children, onUpload }: PdfUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const pdfPromises: Promise<PdfDocument>[] = [];
    const invalidFiles: string[] = [];

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        invalidFiles.push(file.name);
        continue;
      }

      pdfPromises.push(
        new Promise<PdfDocument>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                dataUri: e.target.result,
                chatHistory: [],
              });
            } else {
              reject(new Error(`Failed to read file: ${file.name}`));
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        })
      );
    }

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: `The following files are not PDFs and were skipped: ${invalidFiles.join(", ")}`,
        variant: "destructive",
      });
    }

    try {
      const newPdfs = await Promise.all(pdfPromises);
      if (newPdfs.length > 0) {
        onUpload(newPdfs);
      } else if (files.length > 0 && invalidFiles.length === files.length) {
        toast({
            title: "No PDFs selected",
            description: "Please select one or more PDF files.",
            variant: "destructive",
        });
      }
    } catch (error) {
        console.error("Error reading files:", error);
        toast({
            title: "Upload Failed",
            description: "There was an error processing your files.",
            variant: "destructive",
        });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf"
        multiple
      />
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    </>
  );
}
