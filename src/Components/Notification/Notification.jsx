import React, { useEffect } from 'react';

const Notification = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed bottom-5 right-5 p-4 rounded-xl shadow-lg flex items-center justify-between z-50 
      ${type === 'success' ? 'bg-green-500 text-white' : 
       type === 'error' ? 'bg-red-500 text-white' : 
       type === 'unauthorized' ? 'bg-yellow-500 text-white' : 
       'bg-white text-black'}`}>
      <span>{message}</span>
      <div 
        className="absolute bottom-0 left-0 h-1 bg-white rounded-full w-full animate-progress" 
        style={{ animationDuration: `${duration}ms` }}>
      </div>
    </div>
  );
};

export default Notification;
