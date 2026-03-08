import React from 'react';
import { Home, Compass } from 'lucide-react';
import Button from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
  showHomeButton: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigateHome, showHomeButton }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#372523] text-[#DAD9D5]">
      <header className="p-4 sticky top-0 bg-[#372523]/80 backdrop-blur-md z-10">
        {showHomeButton && (
          <Button variant="outline" size="sm" onClick={onNavigateHome} className="focus:!ring-offset-[#372523]">
            <Home size={20} className="mr-2" />
            Inicio
          </Button>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="p-4 text-center text-xs text-[#B0AEB6] border-t border-[#83454A]/30">
        <div className="flex items-center justify-center">
            <Compass size={16} className="mr-2 text-[#B0AEB6]" />
            <span>Un viaje hacia el interior</span>
        </div>
        <p className="mt-1">&copy; {new Date().getFullYear()} El Peregrino del Inconsciente. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;