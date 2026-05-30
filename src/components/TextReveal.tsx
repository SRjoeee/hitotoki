import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface TextRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  key?: string | number | null;
}

export default function TextReveal({
  children,
  delay = 0.2,
  duration = 1.2,
  yOffset = 24,
  className = '',
}: TextRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom slow cinematic easeOutExpo curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CharacterRevealProps {
  text: string;
  delay?: number;
  className?: string;
}

export function CharacterReveal({ text, delay = 0.1, className = '' }: CharacterRevealProps) {
  const chars = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
      opacity: 1,
      transition: { 
        staggerChildren: 0.04, 
        delayChildren: delay,
      },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 80,
      },
    },
    hidden: {
      opacity: 0,
      y: 12,
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-5% 0px' }}
      className={`inline-block ${className}`}
    >
      {chars.map((char, index) => {
        // Render spaces accurately to maintain Japanese or raw formatting
        if (char === ' ') {
          return <span key={index} className="inline-block">&nbsp;</span>;
        }
        return (
          <motion.span
            key={index}
            variants={child}
            className="inline-block origin-bottom"
          >
            {char}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
