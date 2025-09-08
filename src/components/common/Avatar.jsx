import React from 'react';
import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt = 'User', 
  size = 'md', 
  online = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center overflow-hidden`}>
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-blue-100 text-blue-600">
            {alt && getInitials(alt) ? (
              <span className="font-medium">{getInitials(alt)}</span>
            ) : (
              <User className="w-1/2 h-1/2" />
            )}
          </div>
        )}
      </div>
      {online && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar;