import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UsernameModalProps {
  open: boolean;
  onSave: (name: string) => void;
}

export const UsernameModal = ({ open, onSave }: UsernameModalProps) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">👋 Welcome to Hridaya Rakshak!</DialogTitle>
          <DialogDescription>
            What should we call you?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={!name.trim()}>
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
