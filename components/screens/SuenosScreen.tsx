import React, { useState, useRef, useEffect } from 'react';
import {
  Send as SendIcon,
  ClipboardCopy as CopyIcon,
  Check as CheckIcon,
  Moon,
  Trash2,
  Files,
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { getDreamInterpretation, getDreamReport } from '../../services/geminiService';

const STORAGE_KEY = 'peregrino_suenos_conversation';

const getInitialMessages = (): ChatMessage[] => [];

const SuenosScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationCopied, setConversationCopied] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedConversation = localStorage.getItem(STORAGE_KEY);

      if (savedConversation) {
        const parsed: ChatMessage[] = JSON.parse(savedConversation).map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        if (parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (error) {
      console.error('Error al cargar la conversación guardada:', error);
    }

    setMessages(getInitialMessages());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error al guardar la conversación en localStorage:', error);
    }
  }, [messages]);

  const handleCopy = async (text: string, id: string) => {
    try {
      const cleanText = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '');

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(cleanText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleCopyConversation = async () => {
    try {
      const fullConversation = messages
        .map((msg) => {
          const speaker = msg.sender === 'user' ? 'Tú' : 'Peregrino';
          const cleanText = msg.text
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '');

          return `${speaker}:\n${cleanText}`;
        })
        .join('\n\n');

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullConversation);
        setConversationCopied(true);
        setTimeout(() => setConversationCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error al copiar la conversación:', err);
    }
  };

  const handleClearConversation = () => {
    const confirmed = window.confirm(
      '¿Seguro que quieres borrar toda la conversación sobre sueños? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error al borrar la conversación guardada:', error);
    }

    setMessages(getInitialMessages());
    setUserInput('');
    setCopiedId(null);
    setConversationCopied(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    try {
      const response = await getDreamInterpretation(updatedMessages);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error en interpretación de sueños:', error);

      const aiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: 'Las brumas del sueño impiden la visión clara. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDreamReport = async () => {
    if (isLoading || isGeneratingReport) return;

    setIsGeneratingReport(true);

    try {
      const response = await getDreamReport(messages);

      const aiMessage: ChatMessage = {
        id: `dream-report-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generando informe del sueño:', error);

      const aiMessage: ChatMessage = {
        id: `dream-report-error-${Date.now()}`,
        sender: 'ai',
        text: 'Ahora mismo no he podido ordenar el sueño en un informe. Inténtalo de nuevo en un momento.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[calc(100dvh-220px)] max-w-2xl mx-auto bg-[#372523] rounded-2xl border border-[#83454A]/40 overflow-hidden shadow-2xl">
      <div className="bg-[#4a3a38]/50 p-4 border-b border-[#83454A]/30 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <Moon size={20} className="text-[#DC6E47]" />
          <h2 className="text-xl font-bold text-[#DC6E47]">El Espejo de los Sueños</h2>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#B0AEB6]">
          Analista Onírico
        </span>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide overscroll-contain bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-60 text-center px-8 py-12">
            <div className="w-16 h-16 border-2 border-[#83454A] rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Moon size={32} className="text-[#DC6E47]" />
            </div>
            <h3 className="text-[#DC6E47] text-xl font-serif mb-2">¿Qué has soñado, caminante?</h3>
            <p className="italic text-sm text-[#B0AEB6]">
              "Los sueños son cartas enviadas por el inconsciente que aún no hemos abierto."
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
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
                  aria-label="Copiar mensaje"
                  title="Copiar mensaje"
                >
                  {copiedId === msg.id ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </button>
              )}

              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
            </div>
          </div>
        ))}

        {(isLoading || isGeneratingReport) && (
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
        <div className="mb-3 flex flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyConversation}
              disabled={messages.length === 0 || isLoading || isGeneratingReport}
              className="px-4 py-2 text-sm rounded-full border border-[#83454A]/50 text-[#DAD9D5] hover:border-[#DC6E47] hover:text-[#DC6E47] transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {conversationCopied ? <CheckIcon size={16} /> : <Files size={16} />}
              {conversationCopied ? 'Copiada' : 'Copiar conversación'}
            </button>

            <button
              onClick={handleClearConversation}
              disabled={isLoading || isGeneratingReport}
              className="px-4 py-2 text-sm rounded-full border border-[#83454A]/50 text-[#DAD9D5] hover:border-[#DC6E47] hover:text-[#DC6E47] transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Borrar conversación
            </button>
          </div>

          <button
            onClick={handleGenerateDreamReport}
            disabled={isLoading || isGeneratingReport}
            className="px-4 py-2 text-sm rounded-full border border-[#83454A]/50 text-[#DAD9D5] hover:border-[#DC6E47] hover:text-[#DC6E47] transition-colors disabled:opacity-40"
          >
            {isGeneratingReport ? 'Ordenando informe...' : 'Recibir informe del sueño'}
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-0 bg-[#4a3a38] rounded-full px-3 sm:px-4 py-1 border border-[#83454A]/50 focus-within:border-[#DC6E47] transition-colors shadow-inner">
          <input
            type="text"
            className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-[#DAD9D5] text-[16px] py-2 placeholder-[#B0AEB6]/50 outline-none"
            placeholder={messages.length === 0 ? 'Describe tu sueño aquí...' : 'Responde al Peregrino...'}
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
            title="Enviar mensaje"
          >
            <SendIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuenosScreen;
