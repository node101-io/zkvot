"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const SuccessSVG = () => (
  <svg
    width="33"
    height="33"
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 32C25.0605 32 32 25.0605 32 16.5C32 7.93959 25.0605 1 16.5 1C7.93959 1 1 7.93959 1 16.5C1 25.0605 7.93959 32 16.5 32Z"
      stroke="#9BCA9C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 11L14.3333 22L10 18.7"
      stroke="#9BCA9C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorSVG = () => (
  <svg
    width="33"
    height="33"
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 32C25.0605 32 32 25.0605 32 16.5C32 7.93959 25.0605 1 16.5 1C7.93959 1 1 7.93959 1 16.5C1 25.0605 7.93959 32 16.5 32Z"
      stroke="#CD3556"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.5357 10.4643L10.4643 22.5357"
      stroke="#CD3556"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.4643 10.4643L22.5357 22.5357"
      stroke="#CD3556"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Toast = ({ message, type = "success", duration = 1500, onClose }) => {
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

  return createPortal(
    <div
      className={`w-fit fixed flex flex-row items-center justify-start bottom-4 right-4 px-6 py-4 rounded-[60px] shadow-lg bg-[#1B1B1B] transition-all duration-500 ease-out gap-x-[10px] font-medium text-[16px] ${
        type === "success" ? "text-green" : "text-[#CD3556]"
      } ${position}`}
    >
      {type === "success" ? <SuccessSVG /> : <ErrorSVG />}
      <p>{message}</p>
    </div>,
    document.body
  );
};

export default Toast;
