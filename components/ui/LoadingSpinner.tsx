
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 48, text, className="" }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 size={size} className="text-[#DC6E47] animate-spin" />
      {text && <p className="text-[#B0AEB6]">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;