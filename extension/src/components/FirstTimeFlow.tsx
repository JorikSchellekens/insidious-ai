import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Login } from './Login';
import { InstantReactWeb } from '@instantdb/react';
import { DBSchema } from '@/types';

interface FirstTimeFlowProps {
  db: InstantReactWeb<DBSchema>;
}

const FirstTimeFlow: React.FC<FirstTimeFlowProps> = ({ db }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem('sentEmail');
    if (storedEmail) {
      setStep(2); // Skip to login step if we have a stored email
    } else {
      const timer = setTimeout(() => {
        if (step < 2) {
          setStep(prevStep => prevStep + 1);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    const handleInteraction = () => {
      if (step < 2) {
        setStep(2);
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [step]);

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className="flex items-center justify-center bg-white min-h-[400px] min-w-[300px] p-4">
      <AnimatePresence mode="wait">
        {step === 0 && !localStorage.getItem('sentEmail') && (
          <motion.h1
            key="title"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            className="text-4xl font-bold text-black"
          >
            Insidious AI
          </motion.h1>
        )}
        {step === 1 && !localStorage.getItem('sentEmail') && (
          <motion.h2
            key="subtitle"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            className="text-2xl font-semibold text-black"
          >
            Control your reality
          </motion.h2>
        )}
        {step === 2 && (
          <motion.div
            key="login"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
          >
            <Login db={db}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstTimeFlow;