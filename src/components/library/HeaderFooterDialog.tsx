import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { HeaderFooter } from "@/types/questionnaire";

interface HeaderFooterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'header' | 'footer';
  onSave: (data: { name: string; content: string }) => void;
  editItem?: HeaderFooter | null;
}

export function HeaderFooterDialog({ 
  isOpen, 
  onOpenChange, 
  type, 
  onSave, 
  editItem 
}: HeaderFooterDialogProps) {
  const [formData, setFormData] = useState({
    name: editItem?.name || "",
    content: editItem?.content || ""
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    onSave(formData);
    setFormData({ name: "", content: "" });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({ name: "", content: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {editItem ? `Edit ${type}` : `Create New ${type}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">{type === 'header' ? 'Header' : 'Footer'} Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={`Enter ${type} name`}
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder={`Enter ${type} content...`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
              {editItem ? 'Update' : 'Create'} {type === 'header' ? 'Header' : 'Footer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}