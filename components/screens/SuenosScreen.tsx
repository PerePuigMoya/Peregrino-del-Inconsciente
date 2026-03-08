import React, { useState, useRef, useEffect } from 'react';
import { Send as SendIcon, ClipboardCopy as CopyIcon, Check as CheckIcon, Moon } from 'lucide-react';
import { ChatMessage } from '../../types';
import { getDreamInterpretation } from '../../services/geminiService';

const SuenosScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'start-suenos',
        sender: 'ai',
        text: `Hola caminante.

Cuéntame tu sueño con el mayor detalle que recuerdes.

¿Dónde estabas? ¿Quién aparecía? ¿Qué sucedía? ¿Cómo te sentías dentro del sueño?`,
        timestamp: new Date(),
      },
    ]);
  }, []);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMsg = userInput.trim();

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsg,
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await getDreamInterpretation(updatedMessages);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error en sueños:", error);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Las brumas del sueño impiden la visión clara. Por favor, intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[calc(100dvh-220px)] max-w-2xl mx-auto bg-[#372523] rounded-2xl border border-[#83454A]/40 overflow-hidden shadow-2xl">
      <div className="bg-[#4a3a38]/50 p-4 border-b border-[#83454A]/30 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <Moon size={20} className="text-[#DC6E47]" />
          <h2 className="text-xl font-bold text-[#DC6E47]">El Espejo de los Sueños</h2>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#B0AEB6]">Analista Onírico</span>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide overscroll-contain bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`relative group max-w-[90%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#83454A] text-white rounded-tr-none shadow-lg'
                  : 'bg-[#4a3a38] text-[#DAD9D5] rounded-tl-none border border-[#83454A]/20 shadow-xl'
              }`}
            >
              {msg.sender === 'ai' && (
                <button
                  onClick={() => handleCopy(msg.text, msg.id)}
                  className="absolute -top-2 -right-2 p-1.5 bg-[#372523] border border-[#83454A]/40 rounded-full text-[#B0AEB6] hover:text-[#DC6E47] transition-all z-10"
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
            <div className="bg-[#4a3a38] p-4 rounded-2xl rounded-tl-none animate-pulse flex items-center space-x-2 border border-[#83454A]/20">
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

      <div className="p-4 bg-[#372523] border-t border-[#83454A]/30 shrink-0">
        <div className="flex items-center space-x-2 bg-[#4a3a38] rounded-full px-4 py-1 border border-[#83454A]/50 focus-within:border-[#DC6E47] transition-colors shadow-inner">
          <input
            type="text"
            className="flex-grow bg-transparent border-none focus:ring-0 text-[#DAD9D5] text-[16px] py-2 placeholder-[#B0AEB6]/50 outline-none"
            placeholder={messages.length <= 1 ? "Cuéntame tu sueño..." : "Responde al Peregrino..."}
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

export default SuenosScreen;
