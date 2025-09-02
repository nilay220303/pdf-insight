"use client";

import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ChatMessageDisplayProps {
  message: ChatMessage;
  isLoading?: boolean;
}

export function ChatMessageDisplay({ message, isLoading = false }: ChatMessageDisplayProps) {
  const isUser = message.role === "user";

  const renderWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderContent = (content: string) => {
    if (isUser) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
  
    const blocks = content.split(/\n\s*\n/); 

    return blocks.map((block, blockIndex) => {
      if (block.match(/^(\*|\-|\d+\.) /m)) {
        const listItems = block.split('\n').filter(item => item.trim() !== '');
        const isOrdered = /^\d+\./.test(listItems[0].trim());
        
        const ListComponent = isOrdered ? 'ol' : 'ul';
        const listStyle = isOrdered ? 'list-decimal' : 'list-disc';

        return (
          <ListComponent key={blockIndex} className={`list-inside ${listStyle} pl-4 space-y-1`}>
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="break-words">
                {renderWithBold(item.replace(/^(\*|\-|\d+\.) /, ''))}
              </li>
            ))}
          </ListComponent>
        );
      }
      
      return (
        <p key={blockIndex} className="mb-2 last:mb-0 break-words">
          {renderWithBold(block)}
        </p>
      );
    });
  };


  return (
    <div className={cn("flex items-start gap-3 w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-secondary">
            <Bot className="w-5 h-5 text-secondary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-xl rounded-lg p-3 text-sm prose prose-sm dark:prose-invert prose-p:my-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card"
        )}
      >
        {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin"/>
                <span>Thinking...</span>
            </div>
        ) : (
          <div className="space-y-4">{renderContent(message.content)}</div>
        )}
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback>
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
