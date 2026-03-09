import React, { useState } from 'react';
import { Home, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import Button from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
  showHomeButton: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigateHome, showHomeButton }) => {
  const [largeText, setLargeText] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#372523] text-[#DAD9D5] ${largeText ? 'large-text' : ''}`}
    >
      <header className="p-3 sm:p-4 sticky top-0 bg-[#372523]/80 backdrop-blur-md z-10 border-b border-[#83454A]/20">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center min-w-0 flex-1">
            <img
              src="https://terapia-narrativa-sincronica.com/wp-content/uploads/2026/03/peregrino-logo-1.png"
              alt="El Peregrino del Inconsciente"
              className="w-9 h-9 sm:w-10 sm:h-10 mr-2 sm:mr-3 rounded-full shrink-0"
            />
            <span className="text-xs sm:text-sm tracking-wide truncate min-w-0">
              El Peregrino del Inconsciente
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setLargeText((prev) => !prev)}
              className="p-2 rounded-lg border border-[#83454A]/50 text-[#DAD9D5] hover:border-[#DC6E47] hover:text-[#DC6E47] transition-colors shrink-0"
              aria-label={largeText ? 'Reducir tamaño de texto' : 'Aumentar tamaño de texto'}
              title={largeText ? 'Reducir tamaño de texto' : 'Aumentar tamaño de texto'}
            >
              {largeText ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>

            {showHomeButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateHome}
                className="focus:!ring-offset-[#372523] shrink-0"
              >
                <Home size={18} className="mr-1 sm:mr-2 shrink-0" />
                <span className="hidden xs:inline">Inicio</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-3 sm:px-4 py-6 sm:py-8 min-w-0">
        {children}
      </main>

      <footer className="p-4 text-center text-xs text-[#B0AEB6] border-t border-[#83454A]/30">
        <div className="flex items-center justify-center">
          <Compass size={16} className="mr-2 text-[#B0AEB6] shrink-0" />
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
