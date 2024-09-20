import { Edit2, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

interface TransformerListItemProps {
  transformer: {
    id: string;
    title: string;
    updatedAt: number;
    categories?: string[];
    authorId: string; // Add authorId to the transformer object
  };
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  onSelect: (id: string) => void;
  likesCount: number;
  isLikedByUser: boolean;
  isSelected: boolean;
  currentUserId: string;
}

export function TransformerListItem({ 
  transformer, 
  onDelete, 
  onEdit, 
  onLike,
  onUnlike,
  onSelect,
  likesCount, 
  isLikedByUser,
  isSelected,
  currentUserId
}: TransformerListItemProps) {
  const isUserCreated = transformer.authorId === currentUserId;

  return (
    <li 
      className={`p-2 rounded-md hover:bg-accent group relative cursor-pointer ${
        isSelected ? 'bg-accent border-l-4 border-primary' : ''
      }`}
      onClick={() => onSelect(transformer.id)}
    >
      {/* Edit and Delete buttons pinned to top right */}
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(transformer.id);
          }}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200" // Updated background color
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(transformer.id);
          }}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="pr-20"> {/* Add right padding to prevent overlap with buttons */}
        <span className="text-sm font-medium truncate block">
          {transformer.title}
        </span>
        <span className="text-xs text-gray-500 block">
          {format(transformer.updatedAt, 'MMM d, yyyy')}
        </span>
        <span className={`text-xs ${isUserCreated ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
          Author: {transformer.authorId}
        </span>
        {transformer.categories && transformer.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {transformer.categories.map((category, index) => (
              <span key={index} className="text-xs bg-gray-200 rounded-full px-2 py-1">
                {category}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center mt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              isLikedByUser ? onUnlike(transformer.id) : onLike(transformer.id);
            }}
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
      </div>
    </li>
  );
}