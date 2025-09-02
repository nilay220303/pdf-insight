"use client";

import { useState, useRef, useEffect } from "react";
import { Send, FileText, Loader2 } from "lucide-react";
import type { PdfDocument, ChatMessage } from "@/lib/types";
import { answerQuestionsFromPdf } from "@/ai/flows/answer-questions-from-pdf";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageDisplay } from "./chat-message";
import { SidebarTrigger } from "./ui/sidebar";
import { Card } from "./ui/card";

interface ChatViewProps {
  pdf: PdfDocument | null;
  onChatHistoryChange: (pdfId: string, newHistory: ChatMessage[]) => void;
}

const samplePrompts = [
  "Summarize this document",
  "What are the key takeaways?",
  "Who is the author of this document?",
  "What is the main topic of this PDF?",
];

export function ChatView({ pdf, onChatHistoryChange }: ChatViewProps) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pdf?.chatHistory, isLoading]);

  useEffect(() => {
    setQuestion("");
  }, [pdf?.id]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !pdf || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: message };
    const newHistory = [...pdf.chatHistory, userMessage];
    onChatHistoryChange(pdf.id, newHistory);
    setQuestion("");
    setIsLoading(true);

    try {
      const chatHistoryString = newHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
        
      const result = await answerQuestionsFromPdf({
        question: message,
        pdfDataUri: pdf.dataUri,
        chatHistory: chatHistoryString,
      });

      const assistantMessage: ChatMessage = { role: "assistant", content: result.answer };
      onChatHistoryChange(pdf.id, [...newHistory, assistantMessage]);

    } catch (error) {
      console.error("Error answering question:", error);
      let errorMessageContent = "Sorry, I encountered an error. Please try again.";
      if (error instanceof Error && error.message.includes('The model is overloaded')) {
        errorMessageContent = "The AI model is currently busy. Please try again in a moment.";
      }
      const errorMessage: ChatMessage = { role: "assistant", content: errorMessageContent };
      onChatHistoryChange(pdf.id, [...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(question);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  if (!pdf) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="absolute top-4 left-4 md:hidden">
          <SidebarTrigger />
        </div>
        <FileText className="w-16 h-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Welcome to PDF-Insight</h2>
        <p className="text-muted-foreground">Upload a PDF to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center p-4 border-b shrink-0">
        <div className="md:hidden mr-2">
            <SidebarTrigger />
        </div>
        <FileText className="w-6 h-6 mr-2 shrink-0" />
        <h2 className="text-lg font-semibold truncate" title={pdf.name}>{pdf.name}</h2>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {pdf.chatHistory.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <h2 className="text-2xl font-semibold mb-4">How can I help you with {pdf.name}?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {samplePrompts.map((prompt) => (
                    <Card key={prompt} className="p-4 text-left hover:bg-accent cursor-pointer transition-colors" onClick={() => handlePromptClick(prompt)}>
                      <p className="font-medium">{prompt}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {pdf.chatHistory.map((message, index) => (
                  <ChatMessageDisplay key={index} message={message} />
                ))}
              </>
            )}
            {isLoading && <ChatMessageDisplay message={{role: 'assistant', content: ''}} isLoading={true} />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <footer className="p-4 border-t shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the PDF..."
            disabled={isLoading}
            className="flex-1"
            aria-label="Ask a question"
          />
          <Button type="submit" disabled={isLoading || !question.trim()} aria-label="Send message">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}
