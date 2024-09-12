import { useState } from "react";
import { PlusCircle, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InstantReactWeb, tx, User } from "@instantdb/react";
import { DBSchema } from "../types";
import { format } from 'date-fns'; // Add this import for date formatting

interface TransformerListProps {
  db: InstantReactWeb<DBSchema>;
  user: User;
}

export function TransformerList({ db, user }: TransformerListProps) {
  const { data } = db.useQuery({ transformers: {} });
  const { data: userSettingsData } = db.useQuery({ userSettings: {$: {where: {id: user.id}}} });
  const [editingTransformer, setEditingTransformer] = useState<{ id: string; title: string; content: string } | null>(null);
  const [newTransformerTitle, setNewTransformerTitle] = useState("");
  const [newTransformerContent, setNewTransformerContent] = useState("");

  if (!userSettingsData) {
    return <div>Loading...</div>;
  }
  if (userSettingsData.userSettings.length === 0) {
    return <div>No user settings found</div>;
  }
  const userSettings = userSettingsData.userSettings[0];
  console.log("userSettings help me god this baby is loud", userSettings);

  const handleSelect = (id: string) => {
    console.log("Selecting transformer:", id);
    db.transact([
      tx.userSettings[user.id].merge({ transformerSelected: id })
    ]);
  };

  const handleEdit = (transformer: { id: string; title: string; content: string }) => {
    setEditingTransformer(transformer);
    setNewTransformerTitle(transformer.title);
    setNewTransformerContent(transformer.content);
  };

  const handleSaveEdit = () => {
    if (editingTransformer) {
      db.transact([
        tx.transformers[editingTransformer.id].update({
          id: editingTransformer.id,
          title: newTransformerTitle,
          content: newTransformerContent,
          updatedAt: Date.now(),
          authorId: user.id
        })
      ]);
      setEditingTransformer(null);
      setNewTransformerTitle("");
      setNewTransformerContent("");
    }
  };

  const handleDelete = (id: string) => {
    db.transact([tx.transformers[id].delete()]);
    if (userSettings.transformerSelected === id) {
      db.transact([tx.userSettings[user.id].merge({ transformerSelected: undefined })]);
    }
  };

  const handleCreateNew = () => {
    setEditingTransformer({ id: crypto.randomUUID(), title: "", content: "" });
    setNewTransformerTitle("");
    setNewTransformerContent("");
  };

  if (editingTransformer) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
        <Button
          onClick={() => setEditingTransformer(null)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Prompts
        </Button>
        <h2 className="text-2xl font-bold mb-4">
          {editingTransformer.id ? "Edit Transformer" : "Create New Transformer"}
        </h2>
        <div className="space-y-4">
          <Input
            value={newTransformerTitle}
            onChange={(e) => setNewTransformerTitle(e.target.value)}
            placeholder="Enter title"
          />
          <Textarea
            value={newTransformerContent}
            onChange={(e) => setNewTransformerContent(e.target.value)}
            placeholder="Enter transformer content"
            rows={5}
          />
          <Button onClick={handleSaveEdit} className="w-full">
            {editingTransformer.id ? "Save Changes" : "Create Transformer"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Content Transformers</h2>
      <ul className="space-y-2">
        {data?.transformers.map(transformer => (
          <li
            key={transformer.id}
            className={`p-2 rounded-r-md hover:bg-accent group border-l-4 relative ${
              userSettings.transformerSelected === transformer.id ? 'border-primary bg-accent' : 'border-transparent'
            }`}
            onClick={() => handleSelect(transformer.id)}
          >
            <span className="text-sm font-medium truncate block">{transformer.title}</span>
            <span className="text-xs text-gray-500 block">
              User ID: {transformer.authorId.slice(0, 8)}...{transformer.authorId.slice(-8)}
            </span>
            <span className="text-xs text-gray-500 block">
              {format(transformer.updatedAt, 'MMM d, yyyy')}
            </span>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(transformer);
                }}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(transformer.id);
                }}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button onClick={handleCreateNew} className="mt-4 w-full">
        <PlusCircle className="w-4 h-4 mr-2" /> Create New Content Transformer
      </Button>
    </div>
  );
}