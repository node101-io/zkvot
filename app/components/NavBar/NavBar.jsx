"use client";
import React, { useEffect, useState } from "react";
import WalletButton from "../common/WalletButton";
import { motion } from "framer-motion";
import Image from "next/image";
import ZKVot from "@/assets/Logo/ZKVot.svg";
import ZKVotDot from "@/assets/Logo/ZKVotDot.svg";
import Link from "next/link";

const Navbar = () => {
  const navItems = [
    { name: "How it works?", href: "/" },
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
      href: "/createAnElection",
    },
    {
      name: (
        <>
          <span className="group-hover:opacity-75 text-white">Become a </span>
          <span className="group-hover:opacity-75 text-green">Sequencer</span>
        </>
      ),
      href: "#",
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
              layout="fill"
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
        <a
          key={index}
          href={item.href}
          className="group text-white hover:opacity-75 whitespace-nowrap"
        >
          {item.name}
        </a>
      ))}

      <WalletButton />
    </nav>
  );
};

export default Navbar;
