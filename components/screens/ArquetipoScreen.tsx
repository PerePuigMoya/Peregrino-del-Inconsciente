
import React, { useState } from 'react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ArquetipoName, ARQUETIPOS } from '../../types';
import { getArchetypeDescription } from '../../services/geminiService';
import { Sparkles, ClipboardCopy, Check } from 'lucide-react';

const ArquetipoScreen: React.FC = () => {
  const [archetype, setArchetype] = useState<ArquetipoName | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const revealArchetype = async () => {
    setIsLoading(true);
    setIsRevealed(true);
    const randomIndex = Math.floor(Math.random() * ARQUETIPOS.length);
    const selectedArchetype = ARQUETIPOS[randomIndex];
    setArchetype(selectedArchetype);

    try {
      const desc = await getArchetypeDescription(selectedArchetype);
      setDescription(desc);
    } catch (error) {
      console.error("Error revealing archetype:", error);
      setDescription("Parece que los arquetipos están jugando al escondite hoy. Intenta más tarde.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!archetype || !description) return;
    
    const cleanDescription = description
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '');
        
    const fullText = `Tu Arquetipo Guía: ${archetype}\n\n${cleanDescription}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  

  return (
    <div className="max-w-3xl mx-auto text-center p-4">
      <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#DC6E47] to-[#83454A]">
        Tu Arquetipo Guía
      </h2>
      
      {!isRevealed && (
        <>
          <p className="text-[#B0AEB6] mb-8 text-lg">
            El Peregrino tiene una propuesta para ti, una energía que te acompañará en tu travesía.
            ¿Sientes la llamada para descubrirla?
          </p>

          <div className="max-w-xl mx-auto mb-8 p-4 border border-[#83454A]/40 rounded-lg bg-[#4a3a38]/50">
            <p className="text-sm text-[#DAD9D5] italic">
              Una nota del Peregrino: "Consultar muchos arquetipos en poco tiempo es como ir a una fiesta muy concurrida; no tienes tiempo para conversar profundamente con nadie. Dale a tu guía el espacio que merece para ser escuchada."
            </p>
          </div>

          <Button onClick={revealArchetype} isLoading={isLoading} size="lg" variant="primary" className="bg-gradient-to-r from-[#DC6E47] to-[#83454A] hover:from-[#c86340] hover:to-[#703b40] text-white shadow-lg">
            <Sparkles size={24} className="mr-2" />
            Revelar mi Guía
          </Button>
        </>
      )}

      {isLoading && isRevealed && (
        <div className="mt-12">
          <LoadingSpinner text="Consultando el mapa de tu alma..." size={64} />
        </div>
      )}

      {!isLoading && isRevealed && archetype && (
        <div className="mt-10 p-8 bg-[#4a3a38]/80 backdrop-blur-sm rounded-xl shadow-2xl border border-[#83454A]/50">
          <h3 className="text-3xl font-semibold text-[#DC6E47] mb-6">
            Te acompaña: <span className="text-[#DAD9D5]">{archetype}</span>
          </h3>
          <div className="text-left text-[#DAD9D5] whitespace-pre-wrap leading-relaxed prose max-w-none prose-invert prose-p:my-3 prose-headings:text-[#DC6E47] prose-strong:text-[#DC6E47]"
            dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
          >
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={() => {setIsRevealed(false); setArchetype(null); setDescription('');}} variant="outline" size="md">
              Consultar de nuevo
            </Button>
            <Button onClick={handleCopy} variant="secondary" size="md">
              {isCopied ? <Check size={20} className="mr-2 text-[#DC6E47]" /> : <ClipboardCopy size={20} className="mr-2" />}
              {isCopied ? '¡Copiado!' : 'Copiar Reflexión'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArquetipoScreen;
