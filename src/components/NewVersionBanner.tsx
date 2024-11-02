import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NewVersionBannerProps {
  onClose: () => void;
}

export const NewVersionBanner = ({ onClose }: NewVersionBannerProps) => {
  return (
    <div className="bg-purple-900/20 p-4 flex items-center justify-between">
      <div>
        <span className="bg-purple-600 text-xs px-2 py-1 rounded-full mr-2">NEW</span>
        Introducing the upgraded Claude 3.5 Sonnet
        <p className="text-sm text-zinc-400 mt-1">
          A new version with broad improvements, especially for coding and complex reasoning
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};