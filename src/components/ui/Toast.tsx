/**
 * Toast Component
 *
 * Notification toast with auto-dismiss and animations
 */

'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RiCheckboxCircleLine, RiCloseCircleLine, RiAlertLine, RiInformationLine, RiCloseLine } from 'react-icons/ri';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  const icons = {
    success: <RiCheckboxCircleLine className={`w-5 h-5 ${iconColors[type]}`} />,
    error: <RiCloseCircleLine className={`w-5 h-5 ${iconColors[type]}`} />,
    warning: <RiAlertLine className={`w-5 h-5 ${iconColors[type]}`} />,
    info: <RiInformationLine className={`w-5 h-5 ${iconColors[type]}`} />,
  };

  const toastContent = (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`${typeStyles[type]} border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[320px] transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        role="alert"
      >
        {icons[type]}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <RiCloseLine className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(toastContent, document.body);
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    showToast,
    toasts,
    removeToast,
  };
};
