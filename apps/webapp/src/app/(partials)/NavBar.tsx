"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import WalletButton from "@/app/(partials)/WalletButton";

import ZKVot from "@/public/Logo/ZKVot.svg";
import ZKVotDot from "@/public/Logo/ZKVotDot.svg";

const Navbar = () => {
  const navItems = [
    { name: "How it works?", href: "/howitworks" },
    { name: "All Elections", href: "/elections" },
    {
      name: (
        <>
          <span className="inline-flex items-center">
            <svg
              className="w-4 h-4 mr-1 text-highlight"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="group-hover:opacity-75 text-white">Create </span>
            <span className="group-hover:opacity-75 text-highlight ml-1">
              New Election
            </span>
          </span>
        </>
      ),
      href: "/elections/create",
    },
    {
      name: (
        <>
          <span className="group-hover:opacity-75 text-white">Become a </span>
          <span className="group-hover:opacity-75 text-green">Sequencer</span>
        </>
      ),
      href: "https://github.com/node101-io/zkvot/tree/main/cli",
    },
  ];

  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setAnimationComplete(false);
  }, []);

  return (
    <nav className="bg-[#121315] p-4 flex items-center justify-between space-x-8 overflow-hidden px-8">
      <Link
        className="relative w-[120px] h-[25px]"
        href="/"
      >
        {!animationComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            onAnimationComplete={() => setAnimationComplete(true)}
            className="absolute inset-0"
          >
            <Image
              src={ZKVot}
              alt="ZKVot Logo"
              fill
              sizes="100%"
              priority
            />
          </motion.div>
        )}

        <motion.div
          initial={{ scale: 0.3 }}
          animate={{ scale: animationComplete ? 2 : 0.3 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute left-[44px] top-[2px]"
        >
          <Image
            src={ZKVotDot}
            alt="ZKVot Dot"
            priority
          />
        </motion.div>
      </Link>

      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="group text-white hover:opacity-75 whitespace-nowrap"
        >
          {item.name}
        </Link>
      ))}

      <WalletButton />
    </nav>
  );
};

export default Navbar;
