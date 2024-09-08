import { FaMasksTheater } from "react-icons/fa6";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AddPrompt } from '../components/AddPrompt';
import { PromptList } from '../components/PromptList';
import { PromptProvider } from '../contexts/PromptContext';
import { usePluginState } from '../hooks/usePluginState';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HomeProps {
  db: IDBDatabase;
}

export function Home({ db }: HomeProps) {
  const [enabled, setEnabled] = useLocalStorage("enabled", true);
  const { pluginState, updatePluginState } = usePluginState(db);

  return (
    <PromptProvider db={db}>
      <div className="flex flex-col gap-4 p-4 w-full">
        <FaMasksTheater className="mx-auto h-20 w-20" />
        <Button
          variant={enabled ? "default" : "outline"}
          onClick={() => {
            setEnabled(!enabled);
            updatePluginState({ pluginActive: !enabled });
          }}
          className="mx-auto"
        >
          <h2 className="text-2xl font-bold">INSIDIOUS</h2>
        </Button>
        
        <div className="flex flex-col gap-4">
          <PromptList
            pluginState={pluginState}
            updatePluginState={updatePluginState}
            db={db}
          />
          <AddPrompt />
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