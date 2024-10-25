"use client";
import React from "react";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
      <div className="w-fit px-24 bg-[#222] rounded-[40px] p-6 flex flex-col items-center">
        <h2 className="text-white text-lg  flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Generating zk Proof...
        </h2>
        {/* <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div className="w-full h-full bg-primary animate-progress"></div>
        </div> */}
        <p className="text-gray-300 mt-4">
          Please do not refresh or navigate away.
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
