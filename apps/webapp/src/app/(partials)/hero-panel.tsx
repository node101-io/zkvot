import { forwardRef, useState, Ref } from 'react';
import { useRouter } from "next/navigation";

import Button from '@/app/(partials)/button.jsx';
import backgroundFrame from '@/public/hero/background-frame.png';

const Panel = forwardRef((
  {
    activePanel,
    handleJoinClick,
    handleWalletConnect,
    type,
    title,
    description,
    fullDescription,
    fullDescription2,
    buttonText,
    inputPlaceholder,
    handleClick,
    onInputChange,
    walletAddress,
    isAuroWalletInstalled,
    inputRef
  }: {
    activePanel?: string;
    handleJoinClick?: (target: EventTarget) => void;
    handleWalletConnect?: (target: EventTarget) => void;
    type: string;
    title: string;
    description: string;
    fullDescription: string;
    fullDescription2: string;
    buttonText: string;
    inputPlaceholder?: string;
    handleClick: (target: EventTarget) => void;
    onInputChange?: (value: string) => void;
    walletAddress?: string;
    isAuroWalletInstalled?: boolean;
    inputRef?: Ref<HTMLInputElement>;
  },
  ref: Ref<HTMLDivElement>
) => {
  const [hovered, setHovered] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const router = useRouter();

  const isActive = activePanel === type;
  const isOtherPanelActive = activePanel && activePanel !== type;

  const handleInputChange = (target: EventTarget & HTMLInputElement) => {
    const value = (target as HTMLInputElement).value;
    setInputValue(value);
    if (onInputChange) onInputChange(value);
  };

  const stateClasses = isActive
    ? 'w-[665px] scale-105 z-10 translate-y-0'
    : isOtherPanelActive
      ? 'w-[280px] scale-95 translate-y-[13rem] bg-[#242424]'
      : 'w-[521px] scale-100 translate-y-0 cursor-pointer';

  return (
    <div
      ref={ref}
      className={`
        relative flex h-fit flex-col items-start p-[50px_25px] gap-10 rounded-[30px] overflow-hidden
        transition-all duration-700 ease-in-out
        ${stateClasses}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={event => handleClick(event.target)}
    >
      <div
        className={`
          absolute inset-0 transition-all duration-500 ease-in-out bg-cover bg-center z-[1]
          ${hovered && !isActive ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ backgroundImage: `url(${backgroundFrame.src})` }}
      />
      <h2 className='z-[2] text-[40px] leading-[48px] font-normal text-white font-hyperlegible'>
        {title}
      </h2>
      {!activePanel && (
        <p className='z-[2] text-[18px] leading-[30px] font-normal text-white font-montserrat'>
          {description}
        </p>
      )}
      {isActive ? (
        <>
          <p className='z-[2] text-[18px] leading-[30px] font-normal text-white font-montserrat'>
            {fullDescription}
          </p>
          <p className='z-[2] text-[18px] leading-[30px] font-normal text-white font-montserrat'>
            {fullDescription2}
          </p>
          {inputPlaceholder && (
            <div className='flex flex-row items-center w-full'>
              <input
                ref={inputRef}
                type='text'
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={event => handleInputChange(event.target)}
                className='z-[2] text-white w-[50%] p-3 px-4 rounded-full border bg-transparent border-gray-300 focus:border-green focus:ring focus:ring-green mr-4'
              />
              <Button
                TextColor='text-green group-hover:text-black'
                backgroundColor='bg-green'
                onClick={event => {
                  if (handleJoinClick)
                    handleJoinClick(event.target);
                }}
              >
                {buttonText}
              </Button>
            </div>
          )}
          {!inputPlaceholder && (
            <Button
              TextColor='text-green group-hover:text-black'
              backgroundColor='bg-green'
              onClick={event => {
                if (isAuroWalletInstalled && !walletAddress && handleWalletConnect)
                  handleWalletConnect(event.target);
                else
                  router.push('/elections');
              }}
            >
              {buttonText}
            </Button>
          )}
        </>
      ) : (
        <Button onClick={event => handleClick(event.target)}>Learn More</Button>
      )}
    </div>
  );
});

Panel.displayName = 'Panel';
export default Panel;
