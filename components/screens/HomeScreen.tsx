
import React from 'react';
import { Screen } from '../../types';
import Card from '../ui/Card';
import { Scroll, UsersRound, Moon } from 'lucide-react';

interface HomeScreenProps {
  navigateTo: (screen: Screen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-8 md:pt-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#DC6E47] to-[#83454A]">
        El Peregrino del Inconsciente
      </h1>
      <p className="text-lg md:text-xl text-[#B0AEB6] mb-10 md:mb-12 max-w-2xl px-4">
        Una app para conversar con tu inconsciente a través de la Terapia Narrativa Sincrónica.
      </p>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl px-4">
        <Card
          title="Consulta al Peregrino"
          description="Inicia un diálogo con tu inconsciente y recibe una propuesta de Pere para iluminar tu camino."
          icon={<Scroll size={36} />}
          onClick={() => navigateTo(Screen.Oraculo)}
        />
        <Card
          title="Tu Arquetipo Guía"
          description="Descubre qué energía arquetípica te acompaña y cómo integrarla en tu día a día."
          icon={<UsersRound size={36} />}
          onClick={() => navigateTo(Screen.Arquetipo)}
        />
        <Card
          title="El Espejo de los Sueños"
          description="Desvela los mensajes ocultos de tu mundo onírico y dialoga sobre el significado de tus símbolos."
          icon={<Moon size={36} />}
          onClick={() => navigateTo(Screen.Suenos)}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
