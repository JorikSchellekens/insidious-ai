import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DBSchema } from '@/types';
import { InstantReactWeb } from '@instantdb/react';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon

interface LoginProps {
  db: InstantReactWeb<DBSchema>;
}

export function Login({ db }: LoginProps) {
  const [sentEmail, setSentEmail] = useState('');
  const [showMagicCode, setShowMagicCode] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('sentEmail');
    if (storedEmail) {
      setSentEmail(storedEmail);
      setShowMagicCode(true);
    }
  }, []);

  const handleEmailSubmit = (email: string) => {
    setSentEmail(email);
    setShowMagicCode(true);
    localStorage.setItem('sentEmail', email);
  };

  const handleBack = () => {
    setShowMagicCode(false);
    setSentEmail('');
    localStorage.removeItem('sentEmail');
  };

  return (
    <>
      {!showMagicCode ? (
        <Email setSentEmail={handleEmailSubmit} db={db} />
      ) : (
        <MagicCode 
          sentEmail={sentEmail} 
          db={db} 
          onBack={handleBack} 
        />
      )}
    </>
  );
}

interface EmailProps {
  setSentEmail: (email: string) => void;
  db: InstantReactWeb<DBSchema>;
}

function Email({ setSentEmail, db }: EmailProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSentEmail(email);
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert('Uh oh :' + err.body?.message);
      setSentEmail('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Let's log you in!</h2>
      <Input
        placeholder="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" className="w-full">
        Send Code
      </Button>
    </form>
  );
}

interface MagicCodeProps {
  sentEmail: string;
  db: InstantReactWeb<DBSchema>;
  onBack: () => void;
}

function MagicCode({ sentEmail, db, onBack }: MagicCodeProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.auth.signInWithMagicCode({ email: sentEmail, code })
      .then((user) => {
        localStorage.removeItem('sentEmail');
      })
      .catch((err) => {
        alert('Uh oh :' + err.body?.message);
        setCode('');
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center mb-4">
        <Button type="button" onClick={onBack} variant="ghost" className="p-0 mr-2">
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">
          Enter the code sent to {sentEmail}
        </h2>
      </div>
      <Input
        type="text"
        placeholder="123456..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button type="submit" className="w-full">
        Verify
      </Button>
    </form>
  );
}