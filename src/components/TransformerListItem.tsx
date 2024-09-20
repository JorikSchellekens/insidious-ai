import { Edit2, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

interface TransformerListItemProps {
  transformer: {
    id: string;
    title: string;
    updatedAt: number;
  };
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  likesCount: number;
  isLikedByUser: boolean;
}

export function TransformerListItem({ 
  transformer, 
  onDelete, 
  onEdit, 
  onLike,
  onUnlike,
  likesCount, 
  isLikedByUser 
}: TransformerListItemProps) {
  return (
    <li className="p-2 rounded-md hover:bg-accent group relative">
      <span className="text-sm font-medium truncate block">{transformer.title}</span>
      <span className="text-xs text-gray-500 block">
        {format(transformer.updatedAt, 'MMM d, yyyy')}
      </span>
      <div className="flex items-center mt-2">
        <Button
          onClick={() => isLikedByUser ? onUnlike(transformer.id) : onLike(transformer.id)}
          size="sm"
          variant="ghost"
          className="p-0"
        >
          <Heart
            className={`h-5 w-5 ${isLikedByUser ? 'text-red-600' : 'text-gray-400'}`}
            fill={isLikedByUser ? 'currentColor' : 'none'}
          />
        </Button>
        <span className="ml-2 text-sm">{likesCount} likes</span>
      </div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          onClick={() => onEdit(transformer.id)}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => onDelete(transformer.id)}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}