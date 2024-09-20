import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Transformer } from '../types';

interface TransformerCardProps {
  transformer: Transformer;
  onLike: (id: string) => void;
  isLiked: boolean;
  likesCount: number;
  currentUserId: string;
}

export function TransformerCard({ transformer, onLike, isLiked, likesCount, currentUserId }: TransformerCardProps) {
  const isUserCreated = transformer.authorId === currentUserId;

  return (
    <Card className="w-full">
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
      </CardFooter>
    </Card>
  );
}