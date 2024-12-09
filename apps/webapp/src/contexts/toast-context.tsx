'use client';

import { PropsWithChildren, Dispatch, SetStateAction, useState, createContext, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import SuccessIcon from '@/public/general/toast/success.jsx';
import ErrorIcon from '@/public/general/toast/error.jsx';

const TOAST_DURATION = 3000;

interface ToastInterface {
  _id: string;
  message: string;
  type?: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
};

const Toast = ({
  _id,
  message,
  type = 'success',
  duration = TOAST_DURATION,
  onClose
}: ToastInterface) => {
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState('translate-y-10 opacity-0');

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    setPosition('translate-y-0 opacity-100');

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`z-\[999999\] flex flex-row gap-7 items-center max-w-xs w-fit p-4 rounded-[60px] shadow-lg bg-[#1B1B1B] transition-all duration-500 ease-out gap-x-[10px] font-medium text-[16px] ${
        type === 'success' ? 'text-green' : 'text-[#CD3556]'
      } ${position}`}
    >
      {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
      <p className='ml-5'>{message}</p>
    </div>
  );
};

interface ToastContextInterface {
  toasts: ToastInterface[];
  setToasts: Dispatch<
    SetStateAction<ToastContextInterface['toasts']>
  >;
  showToast: (
    message: string,
    type: 'success' | 'error',
    duration?: number
  ) => void;
  closeToast: (
    id: string
  ) => void;
};

export const ToastContext = createContext<ToastContextInterface>({
  toasts: [],
  setToasts: () => {},
  showToast: () => {},
  closeToast: () => {}
});

export const ToastProvider = ({ children }: PropsWithChildren<{}>) => {
  const [toasts, setToasts] = useState<ToastContextInterface['toasts']>([]);

  const showToast = (
    message: string,
    type: 'success' | 'error',
    duration?: number
  ): void => {
    if (!duration) duration = TOAST_DURATION;

    const _id = uuidv4();
    setToasts(prevToasts => [...prevToasts, { _id, message, type, duration }]);

    setTimeout(() => {
      closeToast(_id);
    }, duration);
  };

  const closeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast._id !== id));
  };

  return (
    <ToastContext.Provider value={{
      toasts,
      setToasts,
      showToast,
      closeToast
    }}>
      <div className="fixed bottom-0 right-0 p-4 space-y-4">
        {toasts.map((toast) => (
          <Toast
            key={toast._id} // Use the unique ID to avoid index as key
            _id={toast._id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => closeToast(toast._id)}
          />
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
};
