
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, ariaLabel, className, ...props }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-150 ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
    