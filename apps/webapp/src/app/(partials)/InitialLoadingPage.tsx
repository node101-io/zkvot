import React from 'react';
import Image from 'next/image.js';
import { motion } from 'framer-motion';

import Logo1 from '@/public/PoweredBy/1.svg';
import Logo2 from '@/public/PoweredBy/2.svg';
import Logo3 from '@/public/PoweredBy/3.svg';
import Logo4 from '@/public/PoweredBy/4.svg';
import Logo5 from '@/public/PoweredBy/5.svg';

const InitialLoadingPage = ({ isExiting }: { isExiting: boolean }) => {
  const logos = [Logo1, Logo2, Logo3, Logo4, Logo5];

  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }}
      animate={
        isExiting
          ? { scale: 0.8, y: '-100vh', opacity: 0 }
          : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 1 }}
      className='fixed top-0 left-0 w-screen h-screen flex flex-col justify-center items-center bg-[#141414] z-50 overflow-hidden'
    >
      <h1 className="text-[20px] font-[400] leading-[32px] text-[#F6F6F6] font-['Atkinson Hyperlegible'] mb-4">
        Powered by
      </h1>
      <div className='flex flex-row space-x-4'>
        {logos.map((logo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Image.default
              src={logo}
              alt={`Logo ${index + 1}`}
              width={43}
              height={43}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InitialLoadingPage;
