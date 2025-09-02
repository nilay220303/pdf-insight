export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PdfDocument {
  id: string;
  name: string;
  dataUri: string;
  chatHistory: ChatMessage[];
}
