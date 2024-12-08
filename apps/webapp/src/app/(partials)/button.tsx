import { FC, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

import RightArrow from '@/public/general/icons/right-arrow.jsx';

const Spinner = () => (
  <div className='w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin' />
);

interface ButtonProps {
  onClick?: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  TextColor?: string;
  backgroundColor?: string;
  variant?: string;
  className?: string;
};

const Button: FC<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  loading = false,
  TextColor = 'text-white group-hover:text-black',
  backgroundColor = 'bg-white',
  variant = 'front',
  className = '',
}) => {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={className + ` max-w-fit z-[2] group relative inline-flex items-center px-4 py-2 rounded-full font-medium overflow-hidden transition-all duration-300 ease-in-out ${
        disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {
        variant == 'back' ?
        <>
          <span
            className={`ml-4 w-8 h-8 rounded-full flex justify-center items-center transition-all duration-300 ease-in-out group-hover:bg-transparent z-[1] ${
              loading ? 'opacity-0' : backgroundColor
            }`}
          >
            {!loading && (
              <div className='transform rotate-180'>
                <RightArrow />
              </div>
            )}
          </span>
          <span
            className={`absolute top-1/2 left-8 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full transition-all duration-300 ease-in-out group-hover:w-[200%] group-hover:h-[200%] z-[0] ${
              loading ? 'opacity-0' : backgroundColor
            }`}
          />
          {loading && (
            <div className='absolute inset-0 flex justify-center items-center z-[10]'>
              <Spinner />
            </div>
          )}
          <span
            className={`relative z-10 transition-colors duration-300 ease-in-out ${
              loading ? 'opacity-0' : TextColor
            }`}
          >
            {!loading && children}
          </span>
        </>
        :
        <>
          <span
            className={`relative z-10 transition-colors duration-300 ease-in-out ${
              loading ? 'opacity-0' : TextColor
            }`}
          >
            {!loading && children}
          </span>
          <span
            className={`ml-4 w-8 h-8 rounded-full flex justify-center items-center transition-all duration-300 ease-in-out group-hover:bg-transparent z-[1] ${
              loading ? 'opacity-0' : backgroundColor
            }`}
          >
            {!loading && (
              <div>
                <RightArrow />
              </div>
            )}
          </span>
          <span
            className={`absolute top-1/2 right-8 transform -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full transition-all duration-300 ease-in-out group-hover:w-[200%] group-hover:h-[200%] z-[0] ${
              loading ? 'opacity-0' : backgroundColor
            }`}
          />
          {loading && (
            <div className='absolute inset-0 flex justify-center items-center z-[10]'>
              <Spinner />
            </div>
          )}
        </>
      }
    </button>
  );
};

export default Button;
