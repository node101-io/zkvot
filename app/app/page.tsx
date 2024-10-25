"use server";
import React from "react";
import HomeState from "../components/MainPages/HomeState";

const Home = () => {
  return (
    <div className="h-full flex flex-col relative">
      <HomeState />
    </div>
  );
};

export default Home;
