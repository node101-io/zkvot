import React from "react";

function Icon(className) {
  return (
    <div className={`${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="12"
        fill="none"
        viewBox="0 0 12 8"
      >
        <circle
          cx="1.25"
          cy="4"
          r="0.5"
          fill="#000"
        ></circle>
        <circle
          cx="3.25"
          cy="4"
          r="0.5"
          fill="#000"
        ></circle>
        <path
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 4h5.75m-3 3.5l3.5-3.5L7.75.5"
        ></path>
      </svg>
    </div>
  );
}

export default Icon;
