import { Star, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isStarred: boolean;
  onStarClick: () => void;
}

export const Header = ({ isStarred, onStarClick }: HeaderProps) => {
  return (
    <header className="border-b border-zinc-800 p-4 flex items-center justify-end max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onStarClick}
          className={isStarred ? "text-yellow-400" : ""}
        >
          <Star className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};