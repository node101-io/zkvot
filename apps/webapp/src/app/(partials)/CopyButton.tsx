import { motion, useAnimation } from 'framer-motion';
import copy from 'copy-to-clipboard';

import CopyIcon from '@/public/election/card/CopyIcon.jsx';

const CopyButton = ({
  textToCopy,
  iconColor = '#B7B7B7',
  position = { top: -32, left: -38 },
  notificationStyle = {},
}: {
  textToCopy: string;
  iconColor?: string;
  position?: { top: number; left: number };
  notificationStyle?: object;
}) => {
  const controls = useAnimation();

  const handleCopy = () => {
    const successful = copy(textToCopy);
    if (successful) {
      controls.start({
        opacity: [0, 1, 0],
        y: [position.top, position.top - 16],
        transition: {
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: 0.6 },
        },
      });
    } else {
      console.log('Failed to copy!');
    }
  };

  return (
    <span
      className='cursor-pointer relative'
      onClick={handleCopy}
    >
      <CopyIcon color={iconColor} />
      <motion.div
        className='absolute text-center w-[82px] py-1 bg-[#383838] rounded-3xl font-light'
        style={{ top: position.top, left: position.left, ...notificationStyle }}
        initial={{ opacity: 0 }}
        animate={controls}
      >
        Copied
      </motion.div>
    </span>
  );
};

export default CopyButton;
