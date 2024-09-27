import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DisabledBannerProps {
  onEnable: () => void;
  isDisabled: boolean;
}

export function DisabledBanner({ onEnable, isDisabled }: DisabledBannerProps) {
  if (!isDisabled) return null;

  return (
    <Alert className="bg-red-100 border-red-400 text-red-800 mb-4">
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-bold">InsidiousAI is currently disabled</span>
          <p className="text-sm">Enable it to start modifying content.</p>
        </div>
        <Button
          onClick={onEnable}
          variant="destructive"
          size="sm"
        >
          Enable
        </Button>
      </AlertDescription>
    </Alert>
  );
}