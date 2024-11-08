'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const APP_URL = process.env.APP_URL || '';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたときに自動スクロール
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(APP_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-2xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <CardHeader>
          <CardTitle>AI Chat Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
                  <Avatar className="w-8 h-8 mt-0.5 mx-2">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <AvatarImage src="/ai-avatar.png" alt="AI" />
                    )}
                    <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.content?.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line.split('**').map((part, i) => (
                          <React.Fragment key={i}>
                            {i % 2 === 1 ? <strong>{part}</strong> : part}
                          </React.Fragment>
                        ))}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="w-4 h-4 mr-2" />
              送信
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
