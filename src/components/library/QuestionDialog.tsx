import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Minus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuestionLibrary } from "@/stores/useQuestionLibrary";
import { QuestionType, questionTypeLabels } from "@/types/questionnaire";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  type: z.string().min(1, "Question type is required"),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  facilityNumber: z.string().optional(),
  bulletPoints: z.array(z.object({
    text: z.string().min(1, "Bullet point cannot be empty")
  })).optional(),
  options: z.array(z.object({
    text: z.string().min(1, "Option cannot be empty")
  })).optional(),
  tableColumns: z.array(z.object({
    text: z.string().min(1, "Column header cannot be empty")
  })).optional(),
  tableRowHeaders: z.array(z.object({
    text: z.string().min(1, "Row header cannot be empty")
  })).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraryId: string;
  sectionId: string;
  editingQuestion?: any;
}

export function QuestionDialog({ open, onOpenChange, libraryId, sectionId, editingQuestion }: QuestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addQuestion, updateQuestion } = useQuestionLibrary();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingQuestion?.title || "",
      description: editingQuestion?.description || "",
      type: editingQuestion?.type || "",
      required: editingQuestion?.required || false,
      placeholder: editingQuestion?.placeholder || "",
      facilityNumber: editingQuestion?.facilityNumber || "",
      bulletPoints: editingQuestion?.bulletPoints?.map((text: string) => ({ text })) || [],
      options: editingQuestion?.options?.map((text: string) => ({ text })) || [],
      tableColumns: editingQuestion?.tableColumns?.map((text: string) => ({ text })) || [],
      tableRowHeaders: editingQuestion?.tableRowHeaders?.map((text: string) => ({ text })) || [],
    },
  });

  const bulletPointsFields = useFieldArray({
    control: form.control,
    name: "bulletPoints",
  });

  const optionsFields = useFieldArray({
    control: form.control,
    name: "options",
  });

  const tableColumnsFields = useFieldArray({
    control: form.control,
    name: "tableColumns",
  });

  const tableRowHeadersFields = useFieldArray({
    control: form.control,
    name: "tableRowHeaders",
  });

  const selectedType = form.watch("type") as QuestionType;
  const showOptions = selectedType === "choice" || selectedType === "choices";
  const showTable = selectedType === "table";

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (editingQuestion) {
        updateQuestion(libraryId, sectionId, editingQuestion.id, {
          title: data.title,
          description: data.description || undefined,
          type: data.type as QuestionType,
          required: data.required,
          placeholder: data.placeholder || undefined,
          facilityNumber: data.facilityNumber,
          bulletPoints: data.bulletPoints?.map(bp => bp.text).filter(Boolean),
          options: showOptions ? data.options?.map(opt => opt.text).filter(Boolean) : undefined,
          tableColumns: showTable ? data.tableColumns?.map(col => col.text).filter(Boolean) : undefined,
          tableRowHeaders: showTable ? data.tableRowHeaders?.map(rh => rh.text).filter(Boolean) : undefined,
          tableRows: showTable && editingQuestion.tableRows ? editingQuestion.tableRows : showTable ? [data.tableColumns?.map(() => "").filter(() => true) || []] : undefined,
        });
        toast.success("Question updated successfully!");
      } else {
        addQuestion(libraryId, sectionId, {
          title: data.title,
          description: data.description || undefined,
          type: data.type as QuestionType,
          required: data.required,
          placeholder: data.placeholder || undefined,
          facilityNumber: data.facilityNumber,
          bulletPoints: data.bulletPoints?.map(bp => bp.text).filter(Boolean),
          options: showOptions ? data.options?.map(opt => opt.text).filter(Boolean) : undefined,
          tableColumns: showTable ? data.tableColumns?.map(col => col.text).filter(Boolean) : undefined,
          tableRowHeaders: showTable ? data.tableRowHeaders?.map(rh => rh.text).filter(Boolean) : undefined,
          tableRows: showTable ? [data.tableColumns?.map(() => "").filter(() => true) || []] : undefined,
          hidden: false
        });
        toast.success("Question created successfully!");
      }
      
      form.reset();
      onOpenChange(false);
      // Force UI refresh by triggering a re-render
      window.dispatchEvent(new CustomEvent('questionLibraryUpdate'));
    } catch (error) {
      toast.error(`Failed to ${editingQuestion ? 'update' : 'create'} question`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{editingQuestion ? 'Edit Question' : 'Create Question'}</DialogTitle>
          <DialogDescription>
            {editingQuestion ? 'Update the question details and format.' : 'Add a new question to this section with multiple formats and options.'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter question title..." {...field} />
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
                        placeholder="Optional description or instructions..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facilityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facility Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., F001, BLDG-A, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {Object.entries(questionTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Required</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Must be answered
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placeholder</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter placeholder text..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bullet Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Bullet Points (Optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bulletPointsFields.append({ text: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Point
                  </Button>
                </div>
                {bulletPointsFields.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`bulletPoints.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Enter bullet point..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => bulletPointsFields.remove(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Options for choice questions */}
              {showOptions && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Answer Options</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => optionsFields.append({ text: "" })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  {optionsFields.fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Enter option..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => optionsFields.remove(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {optionsFields.fields.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add at least one option for choice questions
                    </p>
                  )}
                </div>
              )}

              {/* Table configuration */}
              {showTable && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Table Columns</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => tableColumnsFields.append({ text: "" })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Column
                      </Button>
                    </div>
                    {tableColumnsFields.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`tableColumns.${index}.text`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Enter column header..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => tableColumnsFields.remove(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {tableColumnsFields.fields.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Add at least one column for table questions
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Table Row Headers (Optional)</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => tableRowHeadersFields.append({ text: "" })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Row Header
                      </Button>
                    </div>
                    {tableRowHeadersFields.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`tableRowHeaders.${index}.text`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Enter row header..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => tableRowHeadersFields.remove(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading}
          >
            {isLoading ? (editingQuestion ? "Updating..." : "Creating...") : (editingQuestion ? "Update Question" : "Create Question")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}