
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, className, ...props }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-[#B0AEB6] mb-1">{label}</label>}
      <textarea
        className={`w-full p-3 bg-[#4a3a38] border border-[#83454A]/50 rounded-lg text-[#DAD9D5] focus:ring-2 focus:ring-[#DC6E47] focus:border-[#DC6E47] outline-none transition-colors ${className}`}
        rows={4}
        {...props}
      />
    </div>
  );
};

export default TextArea;