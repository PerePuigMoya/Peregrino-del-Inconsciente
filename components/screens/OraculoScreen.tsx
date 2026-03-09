import React, { useState, useRef, useEffect } from 'react';
import { Send as SendIcon, ClipboardCopy as CopyIcon, Check as CheckIcon } from 'lucide-react';
import { ChatMessage } from '../../types';
import {
  getOraculoInterpretation,
  getArchetypalReport,
} from '../../services/geminiService';

const OraculoScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'start-oraculo',
        sender: 'ai',
        text: `Hola caminante.

Antes de interpretar necesito saber cuál es tu asunto.

¿Qué situación, conflicto, duda o momento de tu vida quieres explorar hoy?`,
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
      console.error('Error al copiar:', err);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timer);
  }, [messages, isLoading, isGeneratingReport]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || isGeneratingReport) return;

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

    const hexagramNumber = Math.floor(Math.random() * 64) + 1;
    const changingLines = [1, 2, 3, 4, 5, 6]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3));

    try {
      const response = await getOraculoInterpretation(
        updatedMessages,
        hexagramNumber,
        changingLines
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error en Oráculo:', error);

      const aiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: 'El Peregrino no ha podido descifrar los vientos hoy. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (messages.length < 3 || isLoading || isGeneratingReport) return;

    setIsGeneratingReport(true);

    const hexagramNumber = Math.floor(Math.random() * 64) + 1;
    const changingLines = [1, 2, 3, 4, 5, 6]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3));

    try {
      const response = await getArchetypalReport(
        messages,
        hexagramNumber,
        changingLines
      );

      const aiMessage: ChatMessage = {
        id: `report-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generando informe:', error);

      const aiMessage: ChatMessage = {
        id: `report-error-${Date.now()}`,
        sender: 'ai',
        text: 'Ahora mismo no he podido ordenar la conversación en un informe arquetípico. Inténtalo de nuevo en un momento.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[calc(100dvh-220px)] max-w-2xl mx-auto bg-[#4a3a38] rounded-2xl border border-[#83454A]/40 overflow-hidden shadow-2xl">
      <div className="bg-[#372523]/50 p-4 border-b border-[#83454A]/30 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-[#DC6E47]">Diálogo Arquetípico</h2>
        <span className="text-[10px] uppercase tracking-widest text-[#B0AEB6]">
          Peregrino del Inconsciente
        </span>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide overscroll-contain">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative group max-w-[90%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#83454A] text-white rounded-tr-none'
                  : 'bg-[#5b4a48] text-[#DAD9D5] rounded-tl-none border border-[#83454A]/20'
              }`}
            >
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
  dangerouslySetInnerHTML={{
    __html: msg.text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />')
  }}
/>
            </div>
          </div>
        ))}

        {(isLoading || isGeneratingReport) && (
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
        {messages.length >= 3 && (
          <div className="mb-3 flex justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading || isGeneratingReport}
              className="px-4 py-2 text-sm rounded-full border border-[#83454A]/50 text-[#DAD9D5] hover:border-[#DC6E47] hover:text-[#DC6E47] transition-colors disabled:opacity-40"
            >
              {isGeneratingReport ? 'Ordenando informe...' : 'Recibir informe arquetípico'}
            </button>
          </div>
        )}

       <div className="flex items-center gap-2 min-w-0 bg-[#372523] rounded-full px-3 sm:px-4 py-1 border border-[#83454A]/50 focus-within:border-[#DC6E47] transition-colors shadow-inner">
  <input
    type="text"
    className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-[#DAD9D5] text-[16px] py-2 placeholder-[#B0AEB6]/50 outline-none"
            placeholder={messages.length <= 1 ? 'Cuéntame cuál es tu asunto...' : 'Responde al Peregrino...'}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading || isGeneratingReport}
          />
          <button
  onClick={handleSendMessage}
  disabled={!userInput.trim() || isLoading || isGeneratingReport}
  className="text-[#DC6E47] disabled:text-[#B0AEB6]/30 transition-colors p-2 shrink-0"
  aria-label="Enviar mensaje"
>
  <SendIcon size={20} />
</button>
        </div>
      </div>
    </div>
  );
};

export default OraculoScreen;
