'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, BookOpen, Mic, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockVerses } from '@/lib/mock-data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: string[];
  loading?: boolean;
}

interface AIAssistantProps {
  onBack: () => void;
}

export default function AIAssistant({ onBack }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI scripture study assistant. I can help you understand verses, find connections, explore historical context, and answer questions about Community of Christ scriptures. What would you like to explore today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(mockVerses[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, currentVerse);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const suggestedQuestions = [
    "What's the historical context?",
    "Find related verses",
    "Explain this simply",
    "What themes are present?"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 px-6 py-4 glass shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Study Assistant
            </h1>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6 flex gap-6 h-[calc(100vh-88px)]">
        {/* Current Verse Panel */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-96 flex-shrink-0"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Current Verse</h3>
            </div>

            {/* Verse Selector */}
            <select
              value={currentVerse.id}
              onChange={(e) => {
                const verse = mockVerses.find(v => v.id === e.target.value);
                if (verse) setCurrentVerse(verse);
              }}
              className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {mockVerses.map(v => (
                <option key={v.id} value={v.id}>
                  {v.reference}
                </option>
              ))}
            </select>

            {/* Verse Display */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <p className="text-sm font-semibold text-purple-600 mb-2">
                {currentVerse.reference}
              </p>
              <p className="font-serif text-gray-800 leading-relaxed">
                {currentVerse.text}
              </p>

              {/* Themes */}
              {currentVerse.themes && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentVerse.themes.map(theme => (
                    <span
                      key={theme}
                      className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Suggested Questions:</p>
              {suggestedQuestions.map((question, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput(question)}
                  className="w-full text-left px-4 py-2 rounded-lg bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 transition-all text-sm"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chat Panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white/50">
            <div className="flex gap-3">
              <button
                className="p-3 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about this verse..."
                className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        isUser
          ? "bg-gradient-to-br from-blue-500 to-cyan-500"
          : "bg-gradient-to-br from-purple-500 to-pink-500"
      )}>
        {isUser ? (
          <span className="text-white font-semibold">You</span>
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-2xl",
        isUser && "flex justify-end"
      )}>
        <div className={cn(
          "rounded-2xl px-5 py-3",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
            : "bg-gray-100 text-gray-900"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300/30 space-y-2">
              <p className="text-xs opacity-80 font-semibold">Related Verses:</p>
              {message.citations.map((citation, i) => (
                <button
                  key={i}
                  className="block text-xs opacity-90 hover:opacity-100 underline"
                >
                  📖 {citation}
                </button>
              ))}
            </div>
          )}

          {/* Actions (for AI messages) */}
          {!isUser && (
            <div className="flex gap-2 mt-3">
              <button className="p-1 rounded hover:bg-gray-200 transition-colors" title="Copy">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-gray-200 transition-colors" title="Helpful">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-gray-200 transition-colors" title="Not helpful">
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl px-5 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Mock AI response generator
function generateAIResponse(question: string, verse: any): Message {
  const lowerQuestion = question.toLowerCase();

  let content = '';
  let citations: string[] = [];

  if (lowerQuestion.includes('context') || lowerQuestion.includes('historical')) {
    content = `The verse ${verse.reference} was written in the context of ${verse.book}. This passage emphasizes themes of ${verse.themes?.slice(0, 2).join(' and ')}, which were particularly significant during this period of the narrative. The historical setting helps us understand the deeper meaning of these words.`;
    citations = ['2 Nephi 2:25', 'Alma 32:21'];
  } else if (lowerQuestion.includes('related') || lowerQuestion.includes('similar')) {
    content = `Great question! This verse connects thematically with several other passages. The themes of ${verse.themes?.[0]} appear throughout Community of Christ scriptures, creating a beautiful tapestry of meaning.`;
    citations = ['Mosiah 2:17', 'D&C 163:2', 'John 3:16'];
  } else if (lowerQuestion.includes('explain') || lowerQuestion.includes('simply')) {
    content = `Let me break this down simply: ${verse.reference} teaches us about ${verse.themes?.[0]}. In modern terms, this means that we should approach our spiritual journey with ${verse.themes?.[1]}. The message is both timeless and deeply relevant to our lives today.`;
  } else if (lowerQuestion.includes('themes')) {
    content = `This verse explores several important themes:\n\n${verse.themes?.map((t: string, i: number) => `${i + 1}. **${t}**: This theme emphasizes spiritual growth and understanding.`).join('\n')}\n\nThese themes work together to create a comprehensive message about discipleship and faith.`;
  } else {
    content = `That's an interesting question about ${verse.reference}. This verse speaks to the heart of ${verse.themes?.[0]}, teaching us valuable lessons about our spiritual journey. The ${verse.mood} tone of this passage invites us to reflect deeply on its message and apply it to our daily lives.`;
    citations = ['Moroni 10:32'];
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    citations,
  };
}
