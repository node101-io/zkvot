import { ReactNode } from 'react';

const ToolTip = ({
  children,
  content,
  showTooltip = true,
  position = 'top',
  arrowPosition = 'start',
}: {
  children: ReactNode;
  content: string;
  showTooltip?: boolean;
  position?: 'top' | 'bottom';
  arrowPosition?: 'start' | 'center';
}) => {
  const positionClasses = {
    top: 'bottom-full mb-3',
    bottom: 'top-full mt-2',
  };

  const alignmentClasses = {
    start: {
      tooltip: 'left-0',
      arrow: 'left-4',
    },
    center: {
      tooltip: 'left-1/2 transform -translate-x-1/2',
      arrow: 'left-1/2 transform -translate-x-1/2',
    },
  };

  const arrowClasses = {
    top: 'border-t-[#383838] border-t-8 border-r-8 border-l-8 border-r-transparent border-l-transparent',
    bottom:
      'border-b-[#383838] border-b-8 border-r-8 border-l-8 border-r-transparent border-l-transparent',
  };

  const tooltipAlignment = alignmentClasses[arrowPosition]?.tooltip || 'left-0';
  const arrowAlignment = alignmentClasses[arrowPosition]?.arrow || 'left-4';
  const arrowDirection = arrowClasses[position] || arrowClasses.top;
  const tooltipPosition = positionClasses[position] || 'bottom-full mt-2';

  return (
    <span className='relative group'>
      {children}
      {showTooltip && (
        <div
          className={`absolute ${tooltipPosition} ${tooltipAlignment} hidden group-hover:flex flex-col items-start z-50 w-[370px]`}
        >
          <div
            className={`${
              arrowPosition === 'start' ? '-left-4' : ''
            } relative bg-[#383838]  text-[#EBF0FF] text-[11px] rounded-2xl px-2 py-1 shadow-lg max-w-full text-center`}
          >
            <p>{content}</p>
            <div
              className={`absolute ${arrowAlignment} w-0 h-0 ${arrowDirection} ${
                position === 'top' ? 'top-[100%]' : 'bottom-[100%]'
              }`}
            ></div>
          </div>
        </div>
      )}
    </span>
  );
};

export default ToolTip;
