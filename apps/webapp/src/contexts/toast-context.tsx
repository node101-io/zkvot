"use client";

import {
  PropsWithChildren,
  Dispatch,
  SetStateAction,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";
import { v4 as uuidv4 } from "uuid";

import SuccessIcon from "@/public/general/toast/success.jsx";
import ErrorIcon from "@/public/general/toast/error.jsx";

const TOAST_DURATION = 7000;

interface ToastInterface {
  _id: string;
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose?: () => void;
}

const Toast = ({
  _id,
  message,
  type = "success",
  duration = TOAST_DURATION,
  onClose,
}: ToastInterface) => {
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState("translate-y-10 opacity-0");

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    setPosition("translate-y-0 opacity-100");

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`z-[999999] flex items-center gap-x-2.5 max-w-xs w-fit p-5 rounded-2xl shadow-lg bg-[#1B1B1B] transition-all duration-500 ease-out font-medium text-base ${
        type === "success" ? "text-green-400" : "text-[#CD3556]"
      } ${position}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="mr-2">
        {type === "success" ? <SuccessIcon /> : <ErrorIcon />}
      </div>
      <p className="ml-3">{message}</p>
    </div>
  );
};

interface ToastContextInterface {
  toasts: ToastInterface[];
  setToasts: Dispatch<SetStateAction<ToastContextInterface["toasts"]>>;
  showToast: (
    message: string,
    type: "success" | "error",
    duration?: number
  ) => void;
  closeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextInterface>({
  toasts: [],
  setToasts: () => {},
  showToast: () => {},
  closeToast: () => {},
});

export const ToastProvider = ({ children }: PropsWithChildren<{}>) => {
  const [toasts, setToasts] = useState<ToastContextInterface["toasts"]>([]);

  const showToast = (
    message: string,
    type: "success" | "error",
    duration?: number
  ): void => {
    if (!duration) duration = TOAST_DURATION;

    const _id = uuidv4();
    setToasts((prevToasts) => [
      ...prevToasts,
      { _id, message, type, duration },
    ]);

    setTimeout(() => {
      closeToast(_id);
    }, duration);
  };

  const closeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast._id !== id));
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        setToasts,
        showToast,
        closeToast,
      }}
    >
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-4 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast._id}
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
