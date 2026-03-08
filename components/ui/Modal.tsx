
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#372523] bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#4a3a38] p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#83454A]/50">
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-2xl font-semibold text-[#DC6E47]">{title}</h2>}
          <button
            onClick={onClose}
            className="text-[#B0AEB6] hover:text-[#DC6E47] transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC6E47] focus:ring-offset-2 focus:ring-offset-[#4a3a38] rounded"
            aria-label="Cerrar modal"
          >
            <X size={28} />
          </button>
        </div>
        <div className="text-[#DAD9D5]">{children}</div>
      </div>
    </div>
  );
};

export default Modal;