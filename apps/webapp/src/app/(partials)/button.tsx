import { FC, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import RightArrow from "@/public/general/icons/right-arrow.jsx";

interface ButtonProps {
  onClick?: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  TextColor?: string;
  upload?: boolean;
  download?: boolean;
  backgroundColor?: string;
  variant?: "front" | "back";
  className?: string;
}

const Spinner = () => (
  <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
);

const Button: FC<ButtonProps> = ({
  onClick,
  children,
  upload = false,
  download = false,
  disabled = false,
  loading = false,
  TextColor = "text-white group-hover:text-black",
  backgroundColor = "bg-white",
  variant = "front",
  className = "",
}) => {
  const isBack = variant === "back";

  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${className}
        max-w-fit z-[2] group relative inline-flex items-center justify-center px-4 py-2 rounded-full font-medium overflow-hidden transition-all duration-300 ease-in-out
        ${disabled || loading ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <div className={`flex items-center ${isBack ? "flex-row-reverse" : ""}`}>
        <span
          className={`
            relative z-10 transition-colors duration-300 ease-in-out whitespace-nowrap
            ${loading ? "opacity-0" : TextColor}
          `}
        >
          {!loading && children}
        </span>
        <span
          className={`
            ${isBack ? "mr-4" : "ml-4"}
            w-8 h-8 rounded-full flex justify-center items-center transition-all duration-300 ease-in-out group-hover:bg-transparent z-[1]
            ${loading ? "opacity-0" : backgroundColor}
          `}
        >
          {!loading && (
            <div
              className={`${
                isBack ? "transform rotate-180" :
                download ? "transform rotate-90" :
                upload ? "transform -rotate-90" : ""
              }`}
            >
              <RightArrow />
            </div>
          )}
        </span>
      </div>
      <span
        className={`
          absolute top-1/2 ${
            isBack ? "left-8 -translate-x-1/2" : "right-8 translate-x-1/2"
          }
          transform -translate-y-1/2 w-8 h-8 rounded-full transition-all duration-300 ease-in-out
          group-hover:w-[200%] group-hover:h-[200%] z-[0]
          ${loading ? "opacity-0" : backgroundColor}
        `}
      />
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center z-[10]">
          <Spinner />
        </div>
      )}
    </button>
  );
};

export default Button;
