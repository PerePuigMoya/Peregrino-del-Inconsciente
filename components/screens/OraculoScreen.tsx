
import React, { useState, useRef, useEffect } from 'react';
import { Send as SendIcon, ClipboardCopy as CopyIcon, Check as CheckIcon } from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ChatMessage } from '../../types';
import { getOraculoInterpretation } from '../../services/geminiService';

const OraculoScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      const cleanText = text.replace(/<[^>]*>/g, '');
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(cleanText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMsg = userInput;
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsg,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    // Datos internos para el motor
    const hexagramNumber = Math.floor(Math.random() * 64) + 1;
    const changingLines = [1, 2, 3, 4, 5, 6].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3));

    try {
      const response = await getOraculoInterpretation(userMsg, hexagramNumber, changingLines);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "El Peregrino no ha podido descifrar los vientos hoy. Por favor, intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[calc(100dvh-220px)] max-w-2xl mx-auto bg-[#4a3a38] rounded-2xl border border-[#83454A]/40 overflow-hidden shadow-2xl">
      <div className="bg-[#372523]/50 p-4 border-b border-[#83454A]/30 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-[#DC6E47]">Diálogo Arquetípico</h2>
        <span className="text-[10px] uppercase tracking-widest text-[#B0AEB6]">Peregrino del Inconsciente</span>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide overscroll-contain">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-8 py-12">
            <div className="w-16 h-16 border-2 border-[#DC6E47] rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-serif text-[#DC6E47]">?</span>
            </div>
            <p className="italic">"Toda pregunta es una puerta. ¿Cuál deseas abrir hoy?"</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative group max-w-[90%] p-4 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-[#83454A] text-white rounded-tr-none' 
                : 'bg-[#5b4a48] text-[#DAD9D5] rounded-tl-none border border-[#83454A]/20'
            }`}>
              {msg.sender === 'ai' && (
                <button 
                  onClick={() => handleCopy(msg.text, msg.id)}
                  className="absolute -top-2 -right-2 p-1.5 bg-[#4a3a38] border border-[#83454A]/40 rounded-full text-[#B0AEB6] hover:text-[#DC6E47] transition-all z-10"
                >
                  {copiedId === msg.id ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </button>
              )}
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#5b4a48] p-4 rounded-2xl rounded-tl-none animate-pulse flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-[#DC6E47] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#DC6E47] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#DC6E47] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4 w-full" />
      </div>

      <div className="p-4 bg-[#372523]/30 border-t border-[#83454A]/30 shrink-0">
        <div className="flex items-center space-x-2 bg-[#372523] rounded-full px-4 py-1 border border-[#83454A]/50 focus-within:border-[#DC6E47] transition-colors shadow-inner">
          <input
            type="text"
            className="flex-grow bg-transparent border-none focus:ring-0 text-[#DAD9D5] text-[16px] py-2 placeholder-[#B0AEB6]/50 outline-none" 
            placeholder="Tu consulta..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading}
            className="text-[#DC6E47] disabled:text-[#B0AEB6]/30 transition-colors p-1"
          >
            <SendIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OraculoScreen;
