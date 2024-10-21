import React from "react";

const ToolTip = ({
  children,
  content,
  className = "",
  showTooltip = true,
  position = "top",
  arrowPosition = "start",
}) => {
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
  };

  const alignmentClasses = {
    start: "left-2",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-2",
  };

  const arrowClasses = {
    top: "border-t-[#383838] border-t-8 border-r-8 border-l-8 border-r-transparent border-l-transparent top-full mt-[-4px]",
    bottom:
      "border-b-[#383838] border-b-8 border-r-8 border-l-8 border-r-transparent border-l-transparent bottom-full mb-[-4px]",
  };

  const tooltipPosition = positionClasses[position] || "bottom-full mb-2";
  const tooltipAlignment = alignmentClasses[arrowPosition] || "left-0";
  const arrowDirection = arrowClasses[position] || arrowClasses.top;

  return (
    <span className={`relative group ${className}`}>
      {children}
      {showTooltip && (
        <div
          className={`absolute ${tooltipPosition} ${tooltipAlignment} hidden group-hover:flex flex-col items-start z-50`}
        >
          <div className="relative bg-[#383838] text-[#EBF0FF] text-xs rounded-3xl px-3 py-2 shadow-lg text-center">
            <p>{content}</p>
            <div
              className={`absolute ${tooltipAlignment} w-0 h-0 ${arrowDirection}`}
            ></div>
          </div>
        </div>
      )}
    </span>
  );
};

export default ToolTip;
