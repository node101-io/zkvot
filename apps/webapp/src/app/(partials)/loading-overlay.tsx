'use client';

import React, { useState, useEffect } from 'react';
interface LoadingOverlayProps {
  text: string;
}

const Spinner = () => (
  <svg
  className='animate-spin -ml-1 mr-3 h-5 w-5 text-primary'
  xmlns='http://www.w3.org/2000/svg'
  fill='none'
  viewBox='0 0 24 24'
>
  <circle
    className='opacity-25'
    cx='12'
    cy='12'
    r='10'
    stroke='currentColor'
    strokeWidth='4'
  ></circle>
  <path
    className='opacity-75'
    fill='currentColor'
    d='M4 12a8 8 0 018-8v8H4z'
  ></path>
</svg>
);

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text }) => {
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="w-fit max-w-md px-8 py-6 bg-gradient-to-br bg-[#222] rounded-2xl shadow-2xl transform transition-transform duration-300">
        <div className="flex flex-col items-center space-y-4">
          <Spinner />
          
          <h2 className="text-white text-xl font-semibold text-center">
            {text}
          </h2>
          
          <p className="text-gray-300 text-sm text-center">
            Please do not refresh or navigate away.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
