import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Login } from './Login';
import ModelAndApiKeyForm from './ModelAndApiKeyForm';
import { InstantReactWeb, User } from '@instantdb/react';
import { DBSchema } from '@/types';
import { useUserSettings } from '../hooks/useUserSettings';

interface FirstTimeFlowProps {
  onComplete: (model: string, apiKey: string, user: User) => void;
  db: InstantReactWeb<DBSchema>;
}

const FirstTimeFlow: React.FC<FirstTimeFlowProps> = ({ onComplete, db }) => {
  const [step, setStep] = useState(0);
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const { userSettings, updateUserSettings } = useUserSettings(db);

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

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    const { data } = await db.useQuery({ userSettings: { $: { where: { id: loggedInUser.id } } } });
    
    if (data && data.userSettings.length > 0) {
      // User exists, load settings and complete flow
      const settings = data.userSettings[0];
      onComplete(settings.selectedModel, settings.apiKey, loggedInUser);
    } else {
      // New user, continue to model selection
      setStep(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !apiKey) {
      setError('Please fill in all fields');
      return;
    }
    if (user) {
      updateUserSettings({ selectedModel: model, apiKey }, user);
      onComplete(model, apiKey, user);
    } else {
      setError('Please log in first');
    }
  };

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
        {step >= 2 && (
          <motion.div
            key="login"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
          >
            <Login db={db} onLogin={handleLogin} />
          </motion.div>
        )}
        {step === 4 && (
          <ModelAndApiKeyForm
            model={model}
            setModel={setModel}
            apiKey={apiKey}
            setApiKey={setApiKey}
            error={error}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstTimeFlow;