import { Button } from '@/components/ui/button';
import { Star, StarOff, Share2 } from 'lucide-react';

interface HeaderProps {
  isStarred: boolean;
  onStarClick: () => void;
  onShare: () => void;
}

export function Header({ isStarred, onStarClick, onShare }: HeaderProps) {
  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <div className="h-16 px-4 flex items-center justify-end">
        {/* Right side - Star and Share buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onStarClick}
            className="text-zinc-400 hover:text-yellow-400"
          >
            {isStarred ? (
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}