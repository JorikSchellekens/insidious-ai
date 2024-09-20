import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Transformer } from '../types';

interface TransformerCardProps {
  transformer: Transformer;
  onLike: (id: string) => void;
}

export function TransformerCard({ transformer, onLike }: TransformerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{transformer.title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {transformer.authorId}</p>
      </CardHeader>
      <CardContent>
        <p>{transformer.content}</p>
        <div className="mt-2">
          {transformer.categories.map(category => (
            <span key={category} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              {category}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onLike(transformer.id)}
          className={transformer.isLiked ? "text-red-500" : ""}
        >
          <Heart className="mr-2 h-4 w-4" />
          {transformer.likes} Likes
        </Button>
        <span className="text-sm text-muted-foreground">
          {transformer.isLiked ? "You liked this" : ""}
        </span>
      </CardFooter>
    </Card>
  );
}