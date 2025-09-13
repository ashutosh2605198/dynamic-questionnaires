import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuestionLibrary } from "@/stores/useQuestionLibrary";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraryId: string;
  editingSection?: any;
}

export function SectionDialog({ open, onOpenChange, libraryId, editingSection }: SectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addSection, updateSection } = useQuestionLibrary();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingSection?.title || "",
      description: editingSection?.description || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (editingSection) {
        updateSection(libraryId, editingSection.id, {
          title: data.title,
          description: data.description || undefined,
        });
        toast.success("Section updated successfully!");
      } else {
        addSection(libraryId, {
          title: data.title,
          description: data.description || undefined,
          hidden: false
        });
        toast.success("Section created successfully!");
      }
      
      form.reset();
      onOpenChange(false);
      // Force UI refresh by triggering a re-render
      window.dispatchEvent(new CustomEvent('questionLibraryUpdate'));
    } catch (error) {
      toast.error(`Failed to ${editingSection ? 'update' : 'create'} section`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingSection ? 'Edit Section' : 'Create Section'}</DialogTitle>
          <DialogDescription>
            {editingSection ? 'Update the section details.' : 'Add a new section to organize related questions.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter section title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (editingSection ? "Updating..." : "Creating...") : (editingSection ? "Update Section" : "Create Section")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}