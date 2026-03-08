
import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, icon, onClick, className = '' }) => {
  return (
    <div
      className={`bg-[#4a3a38]/70 backdrop-blur-sm p-6 rounded-xl shadow-xl hover:shadow-[#DC6E47]/20 border border-[#83454A]/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {icon && <div className="text-[#DC6E47] mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-[#DC6E47] mb-2">{title}</h3>
      <p className="text-[#B0AEB6] text-sm">{description}</p>
    </div>
  );
};

export default Card;