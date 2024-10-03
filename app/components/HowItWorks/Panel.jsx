import React, { forwardRef, useState } from "react";
import Button from "../common/Button";
import blueFrame from "../../assets/blueframe.png";

const Panel = forwardRef(
  (
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
    },
    ref
  ) => {
    const [hovered, setHovered] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const isActive = activePanel === type;
    const isOtherPanelActive = activePanel && activePanel !== type;

    const handleInputChange = (event) => {
      const value = event.target.value;
      setInputValue(value);
      if (onInputChange) onInputChange(value);
    };

    return (
      <div
        ref={ref}
        className={`relative flex h-fit flex-col items-start p-[50px_25px] gap-10 rounded-[30px] overflow-hidden transition-transform duration-700 ease-in-out ${
          isActive ? "w-[665px] scale-105 z-10" : "w-[521px]"
        } ${
          isOtherPanelActive
            ? "max-w-[280px] scale-95 mt-52 bg-[#242424]"
            : "w-[521px]"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out bg-cover bg-center z-[1] ${
            hovered && !isActive ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${blueFrame.src})` }}
        />
        <h2 className="z-[2] text-[40px] leading-[48px] font-normal text-white font-hyperlegible">
          {title}
        </h2>
        {!activePanel && (
          <p className="z-[2] text-[18px] leading-[30px] font-normal text-white font-montserrat">
            {description}
          </p>
        )}
        {isActive ? (
          <>
            <p className="z-[2] text-[18px] leading-[30px] font-normal text-white font-montserrat">
              {fullDescription}
            </p>
            <p className="z-[2] text-[18px] leading-[30px] font-normal text-white font-montserrat">
              {fullDescription2}
            </p>
            {inputPlaceholder && (
              <div className="flex flex-row items-center w-full">
                <input
                  type="text"
                  placeholder={inputPlaceholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  className="z-[2] text-white w-[50%] p-3 px-4 rounded-full border bg-transparent border-gray-300 focus:border-green focus:ring focus:ring-green mr-4"
                />
                <Button
                  TextColor="text-green group-hover:text-black"
                  backgroundColor="bg-green"
                  onClick={handleJoinClick}
                >
                  {buttonText}
                </Button>
              </div>
            )}
            {!inputPlaceholder && (
              <Button
                TextColor="text-green group-hover:text-black"
                backgroundColor="bg-green"
                onClick={handleWalletConnect}
                disabled={walletAddress}
              >
                {buttonText}
              </Button>
            )}
          </>
        ) : (
          <Button onClick={handleClick}>Learn More</Button>
        )}
      </div>
    );
  }
);

Panel.displayName = "Panel";
export default Panel;
