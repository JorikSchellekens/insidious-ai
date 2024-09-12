import { PromptList } from '../components/PromptList';
import { TransformerProvider } from '../contexts/TransfomerContext';
import { DisabledBanner } from '../components/DisabledBanner';
import { InstantReactWeb, User, tx } from '@instantdb/react';
import { DBSchema } from '@/types';

interface HomeProps {
  db: InstantReactWeb<DBSchema, {}, false>;
  user: User;
}

export function Home({ db, user }: HomeProps) {
  const { isLoading, error, data: userData } = db.useQuery({ userSettings: { $: { where: { id: user.id } } } });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!userData || !userData.userSettings || userData.userSettings.length === 0 ) {
    return <div>No user data</div>;
  }

  const userSettings = userData.userSettings[0];
  console.log('userSettings', userSettings);

  const handleEnable = () => {
    db.transact([
      tx.users[user.id].merge({ pluginActive: true })
    ]);
  };

  return (
    <TransformerProvider db={db}>
      <div className="flex flex-col h-full overflow-hidden">
        <DisabledBanner onEnable={handleEnable} isDisabled={!userSettings.pluginActive} />
        <h1 className="text-3xl font-bold text-center font-sans p-4">InsidiousAI</h1>
        
        <div className="flex-1 overflow-y-auto p-4">
          <PromptList
            userSettings={userSettings}
            db={db}
            user={user}
          />
        </div>
      </div>
    </TransformerProvider>
  );
}