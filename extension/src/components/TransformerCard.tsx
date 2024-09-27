import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Edit2, Check } from "lucide-react";
import { Transformer } from '../types';

interface TransformerCardProps {
  transformer: Transformer;
  onLike: (id: string) => void;
  onEdit: (id: string) => void;
  onSelect: (id: string) => void;
  isLiked: boolean;
  isSelected: boolean;
  likesCount: number;
  currentUserId: string;
}

export function TransformerCard({ 
  transformer, 
  onLike, 
  onEdit, 
  onSelect, 
  isLiked, 
  isSelected, 
  likesCount, 
  currentUserId 
}: TransformerCardProps) {
  const isUserCreated = transformer.authorId === currentUserId;

  return (
    <Card className={`w-full ${isSelected ? 'border-2 border-primary' : ''}`}>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">{transformer.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{transformer.content.substring(0, 100)}...</p>
        <span className={`text-xs ${isUserCreated ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
          Author: {transformer.authorId}
        </span>
        {transformer.categories && (
          <div className="flex flex-wrap gap-1 mt-2">
            {transformer.categories.map((category, index) => (
              <span key={index} className="text-xs bg-gray-200 rounded-full px-2 py-1">
                {category}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            onClick={() => onLike(transformer.id)}
            variant="ghost"
            size="sm"
            className="p-0"
          >
            <Heart
              className={`h-5 w-5 ${isLiked ? 'text-red-600' : 'text-gray-400'}`}
              fill={isLiked ? 'currentColor' : 'none'}
            />
            <span className="ml-2">{likesCount}</span>
          </Button>
          {isUserCreated && (
            <Button
              onClick={() => onEdit(transformer.id)}
              variant="ghost"
              size="sm"
              className="p-0"
            >
              <Edit2 className="h-5 w-5 text-gray-400" />
            </Button>
          )}
        </div>
        <Button
          onClick={() => onSelect(transformer.id)}
          variant={isSelected ? "default" : "outline"}
          size="sm"
        >
          {isSelected ? <Check className="h-4 w-4 mr-2" /> : null}
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  );
}