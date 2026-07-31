import React, { useState, useRef, useEffect } from 'react';
// History diberi alias: namanya bentrok dengan konstruktor global window.History
import { Send, Mic, Image as ImageIcon, Bot, Sparkles, RefreshCw, MoreVertical, FileText, History as HistoryIcon, X, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { QUICK_PROMPTS } from '../constants';
import { API_BASE_URL } from '../utils/api';


interface Conversation {
  id: number;
  title: string;
  updated_at: string;
  message_count: string;
}

// Jawaban AI datang sebagai teks markdown sederhana. Komponen ini merapikannya:
// poin bernomor jadi baris tersendiri, **tebal** jadi bold, rujukan [1] jadi badge kecil.
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const renderInline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (/^\[\d+\]$/.test(part)) {
        return (
          <sup key={i} className="text-[10px] text-blue-500 font-semibold ml-0.5">{part}</sup>
        );
      }
      return <span key={i}>{part}</span>;
    });

  // Sebagian jawaban datang tanpa baris baru antar poin, jadi dipisahkan manual
  const lines = text
    .replace(/\s+(\d+\.\s)/g, '\n$1')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const numbered = line.match(/^(\d+)\.\s+(.*)$/);
        const bullet = line.match(/^[-*•]\s+(.*)$/);

        if (numbered) {
          return (
            <div key={i} className="flex gap-2">
              <span className="font-semibold text-blue-600 shrink-0">{numbered[1]}.</span>
              <span className="flex-1">{renderInline(numbered[2])}</span>
            </div>
          );
        }
        if (bullet) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-blue-600 shrink-0">•</span>
              <span className="flex-1">{renderInline(bullet[1])}</span>
            </div>
          );
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    /* Empty initial state to show the Welcome Hero */
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  // Percakapan yang sedang menunggu konfirmasi hapus
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

  const openHistory = async () => {
    setShowHistory(true);
    setConfirmDeleteId(null);
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, { headers: authHeader() });
      setConversations(res.ok ? await res.json() : []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openConversation = async (id: number) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${id}`, { headers: authHeader() });
      if (!res.ok) throw new Error('Gagal memuat percakapan');
      const rows = await res.json();

      setMessages(rows.map((r: any) => ({
        id: String(r.id),
        role: r.role,
        text: r.content,
        timestamp: new Date(r.created_at),
        sources: r.sources || undefined,
      })));
      setConversationId(id);
      setShowHistory(false);
    } catch (err) {
      console.error('Buka percakapan gagal:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) return;
      setConversations(prev => prev.filter(c => c.id !== id));
      // Kalau percakapan yang dibuka ikut terhapus, kosongkan layar chat
      if (conversationId === id) {
        setMessages([]);
        setConversationId(null);
      }
    } catch (err) {
      console.error('Hapus percakapan gagal:', err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Digulir lewat kontainernya, bukan scrollIntoView: elemen penanda berada
  // sebelum padding bawah sehingga scroll berhenti terlalu awal dan pesan
  // terakhir tertutup kolom input. Timeout dipakai (bukan requestAnimationFrame)
  // supaya tetap jalan saat tab sedang tidak aktif, dan scroll dibuat instan
  // karena animasi smooth ikut berhenti di kondisi yang sama.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const id = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
    return () => clearTimeout(id);
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: text, conversationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal terhubung ke server');
      }

      // Percakapan baru dibuatkan server pada pesan pertama
      if (data.conversationId) setConversationId(data.conversationId);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply || "Maaf, terjadi kesalahan.",
        timestamp: new Date(),
        sources: data.sources
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

  // Mulai percakapan baru: percakapan lama tetap tersimpan di riwayat
  const handleReset = () => {
    setMessages([]);
    setConversationId(null);
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
            onClick={openHistory}
            className="w-10 h-10 rounded-full bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all border border-slate-100"
            title="Riwayat Chat"
          >
            <HistoryIcon size={18} />
          </button>
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all border border-slate-100"
            title="Chat Baru"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Panel Riwayat Chat */}
      {showHistory && (
        <div className="absolute inset-0 z-[60] flex flex-col bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="mt-auto bg-white rounded-t-[28px] max-h-[75%] flex flex-col shadow-float">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Riwayat Chat</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="w-9 h-9 rounded-full text-slate-400 hover:bg-slate-100 flex items-center justify-center"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingHistory && (
                <p className="text-center text-sm text-slate-400 py-8">Memuat...</p>
              )}

              {!loadingHistory && conversations.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">
                  Belum ada percakapan tersimpan.
                </p>
              )}

              {!loadingHistory && conversations.map((c) => (
                confirmDeleteId === c.id ? (
                  // Konfirmasi hapus: riwayat bisa jadi bahan telusur audit,
                  // jadi jangan terhapus hanya karena salah sentuh.
                  <div
                    key={c.id}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-700 truncate">{c.title}</p>
                    <p className="text-[11px] text-red-500 mt-0.5">
                      Hapus percakapan ini beserta {c.message_count} pesannya? Tidak bisa dibatalkan.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => deleteConversation(c.id)}
                        className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2 rounded-2xl border transition-all ${conversationId === c.id
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                      }`}
                  >
                    <button
                      onClick={() => openConversation(c.id)}
                      className="flex-1 text-left px-4 py-3 min-w-0"
                    >
                      <p className="text-sm font-medium text-slate-700 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(c.updated_at).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })} · {c.message_count} pesan
                      </p>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(c.id)}
                      className="w-10 h-10 mr-2 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0"
                      title="Hapus percakapan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pb-52 space-y-6">

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

              <div className={`flex flex-col ${isUser ? 'items-end max-w-[80%]' : 'items-start max-w-[88%]'}`}>
                <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all ${isUser
                  ? 'bg-blue-600 text-white rounded-t-[24px] rounded-bl-[24px] rounded-br-[6px] shadow-blue-500/20'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-t-[24px] rounded-br-[24px] rounded-bl-[6px] shadow-card'
                  }`}>
                  {isUser ? msg.text : <FormattedText text={msg.text} />}
                </div>

                {/* Dokumen prosedur yang jadi rujukan jawaban */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                    {msg.sources.map((source) => (
                      <span
                        key={source}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-1"
                      >
                        <FileText size={10} />
                        {source}
                      </span>
                    ))}
                  </div>
                )}

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