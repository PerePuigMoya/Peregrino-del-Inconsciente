import React, { useEffect, useState } from 'react';
import { Home, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import Button from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
  showHomeButton: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigateHome, showHomeButton }) => {
  const [largeText, setLargeText] = useState<boolean>(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem('peregrino-large-text');
    if (savedPreference === 'true') {
      setLargeText(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('peregrino-large-text', String(largeText));
  }, [largeText]);

  return (
    <div className={`min-h-screen flex flex-col bg-[#372523] text-[#DAD9D5] ${largeText ? 'large-text' : ''}`}>
      <header className="p-4 sticky top-0 bg-[#372523]/80 backdrop-blur-md z-10 flex items-center justify-between gap-4">
        <div className="flex items-center min-w-0">
          <img
            src="https://terapia-narrativa-sincronica.com/wp-content/uploads/2026/03/peregrino-logo-1.png"
            alt="El Peregrino del Inconsciente"
            className="w-10 h-10 mr-3 rounded-full shrink-0"
          />
          <span className="text-base md:text-lg font-medium tracking-wide truncate">
            El Peregrino del Inconsciente
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLargeText((prev) => !prev)}
            className="px-4 py-3 rounded-xl border-2 border-[#DC6E47] bg-[#4a3a38] text-[#FFF5EE] hover:bg-[#5b4a48] hover:scale-[1.02] transition-all flex items-center gap-3 shadow-md"
            aria-label={largeText ? 'Reducir tamaño de texto' : 'Aumentar tamaño de texto'}
            title={largeText ? 'Reducir tamaño de texto' : 'Aumentar tamaño de texto'}
          >
            {largeText ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
            <span className="text-base font-semibold tracking-wide">
              {largeText ? 'Texto normal' : 'Aumentar texto'}
            </span>
          </button>

          {showHomeButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateHome}
              className="focus:!ring-offset-[#372523]"
            >
              <Home size={20} className="mr-2" />
              Inicio
            </Button>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="p-4 text-center text-xs text-[#B0AEB6] border-t border-[#83454A]/30">
        <div className="flex items-center justify-center">
          <Compass size={16} className="mr-2 text-[#B0AEB6]" />
          <span>Un viaje hacia el interior</span>
        </div>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} El Peregrino del Inconsciente. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
