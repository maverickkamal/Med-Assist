import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface VoiceInputProps {
  onVoiceClick: () => void;
}

export function VoiceInput({ onVoiceClick }: VoiceInputProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onVoiceClick}
      className="text-zinc-400 hover:text-zinc-200"
      title="Voice Input (Coming Soon)"
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
} 