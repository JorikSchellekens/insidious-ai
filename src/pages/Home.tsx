import { AddPrompt } from '../components/AddPrompt';
import { PromptList } from '../components/PromptList';
import { PromptProvider } from '../contexts/PromptContext';
import { usePluginState } from '../hooks/usePluginState';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HomeProps {
  db: IDBDatabase;
}

export function Home({ db }: HomeProps) {
  const { pluginState, updatePluginState } = usePluginState(db);

  return (
    <PromptProvider db={db}>
      <div className="flex flex-col gap-4 p-4 w-full">
        <h1 className="text-3xl font-bold text-center font-sans">InsidiousAI</h1>
        
        <div className="flex flex-col gap-4">
          <PromptList
            pluginState={pluginState}
            updatePluginState={updatePluginState}
          />
          <div className="flex flex-col gap-2 items-center">
            <Label htmlFor="paragraphCount">Paragraph Count:</Label>
            <Input
              id="paragraphCount"
              type="number"
              value={pluginState.paragraphLimit || 1}
              onChange={(e) => {
                const newCount = parseInt(e.target.value, 10);
                updatePluginState({ paragraphLimit: newCount });
              }}
            />
          </div>
        </div>
      </div>
    </PromptProvider>
  );
}