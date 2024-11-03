import React from "react";

const TopSection = () => {
  return (
    <div className=" flex w-full justify-center pb-[74px]">
      <div className="h-auto flex flex-col justify-center items-center max-w-[760px]  ">
        <h1 className="text-[64px] md:text-6xl font-montserrat font-medium text-center text-green leading-[1] italic">
          <span className="text-green">How far </span>
          <span className="text-white">can it go?</span>
        </h1>
        <p className="mt-4 text-center font-hyperlegible text-lightGray text-[16px] leading-[1.375] px-4">
          With zkVot, we reexplore boundaries of the Internet. Using some of the
          best technologies out there, zkVot enables censorship-resistant
          anonymous voting online. Welcome to a new world, where there is no
          trust.
        </p>
      </div>
    </div>
  );
};

export default TopSection;
