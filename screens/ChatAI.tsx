import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Bot, Sparkles, RefreshCw, MoreVertical } from 'lucide-react';
import { ChatMessage } from '../types';
import { QUICK_PROMPTS } from '../constants';
import { API_BASE_URL } from '../utils/api';


export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    /* Empty initial state to show the Welcome Hero */
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal terhubung ke server');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply || "Maaf, terjadi kesalahan.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Error: " + (error.message || "Gagal menghubungi AI."),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
  }

  return (
    <div className="flex flex-col h-full bg-[#F3F6F8] relative">
      {/* Header - Glassmorphism */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bot size={22} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">ERT AI</h1>
            <p className="text-xs text-slate-500 font-medium">Safety Assistant</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all border border-slate-100"
            title="Reset Chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-40 space-y-6">

        {/* Welcome State (If no messages) */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60%] animate-fade-in mt-10">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-float mb-6">
              <Sparkles size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Halo, Chief! 👋</h2>
            <p className="text-slate-500 text-center max-w-[250px] leading-relaxed mb-8">
              Saya siap membantu analisa P2H, prosedur safety, atau cek status alat.
            </p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
              {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-5 py-3.5 bg-white rounded-2xl text-sm font-semibold text-slate-600 shadow-sm border border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Bubbles */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const showAvatar = !isUser && (idx === 0 || messages[idx - 1].role === 'user');

          return (
            <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start items-end gap-3'}`}>

              {/* Bot Avatar (only show for bot) */}
              {!isUser && (
                <div className={`w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                  <Bot size={16} />
                </div>
              )}

              <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all ${isUser
                  ? 'bg-blue-600 text-white rounded-t-[24px] rounded-bl-[24px] rounded-br-[6px] shadow-blue-500/20'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-t-[24px] rounded-br-[24px] rounded-bl-[6px] shadow-card'
                  }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex justify-start items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-slate-100 rounded-t-[24px] rounded-br-[24px] rounded-bl-[6px] px-5 py-4 shadow-card flex items-center gap-1.5 w-fit">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-[90px] left-0 w-full px-4 z-20">
        <div className="glass rounded-[28px] p-2 pr-2 border border-white/60 shadow-float flex items-end gap-2">
          <button className="w-11 h-11 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center flex-shrink-0">
            <ImageIcon size={22} />
          </button>

          <div className="flex-1 py-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tanya tentang safety..."
              className="w-full bg-transparent text-slate-800 text-sm focus:outline-none placeholder-slate-400 font-medium resize-none max-h-[80px]"
              rows={1}
              style={{ minHeight: '24px' }}
            />
          </div>

          {inputText ? (
            <button
              onClick={() => handleSend()}
              className="w-11 h-11 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform active:scale-95"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          ) : (
            <button className="w-11 h-11 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center flex-shrink-0">
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};