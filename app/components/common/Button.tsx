import React from "react";
import RightArrow from "@/assets/RightArrow";

const Spinner = () => (
  <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
);

const Button = ({
  onClick,
  children,
  disabled = false,
  loading = false,
  TextColor = "text-white group-hover:text-black",
  backgroundColor = "bg-white",
}) => {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={`z-[2] group relative inline-flex items-center px-4 py-2 rounded-full font-medium overflow-hidden transition-all duration-300 ease-in-out ${
        disabled || loading ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span
        className={`relative z-10 transition-colors duration-300 ease-in-out ${
          loading ? "opacity-0" : TextColor
        }`}
      >
        {!loading && children}
      </span>
      <span
        className={`ml-4 w-8 h-8 rounded-full flex justify-center items-center transition-all duration-300 ease-in-out group-hover:bg-transparent z-[1] ${
          loading ? "opacity-0" : backgroundColor
        }`}
      >
        {!loading && <RightArrow />}
      </span>
      <span
        className={`absolute top-1/2 right-8 transform -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full transition-all duration-300 ease-in-out group-hover:w-[200%] group-hover:h-[200%] z-[0] ${
          loading ? "opacity-0" : backgroundColor
        }`}
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
