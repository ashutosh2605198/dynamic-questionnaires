import { Question, questionTypeLabels } from "@/types/questionnaire";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Plus, X, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface QuestionPreviewProps {
  question: Question;
  sectionId?: string;
  onUpdate?: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
}

export function QuestionPreview({ question, sectionId, onUpdate }: QuestionPreviewProps) {
  const [date, setDate] = useState<Date>();
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
  const [editingRowHeaderIndex, setEditingRowHeaderIndex] = useState<number | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [newRowHeaderName, setNewRowHeaderName] = useState("");

  const updateQuestion = (updates: Partial<Question>) => {
    if (onUpdate && sectionId) {
      onUpdate(sectionId, question.id, updates);
    }
  };

  const renderControl = () => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
      case 'ticker':
        return (
          <Input
            type={question.type === 'email' ? 'email' : question.type === 'url' ? 'url' : question.type === 'phone' ? 'tel' : 'text'}
            placeholder={question.placeholder || `Enter ${questionTypeLabels[question.type].toLowerCase()}`}
            disabled
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={question.placeholder || "Enter multiple lines of text"}
            disabled
            rows={3}
          />
        );

      case 'richtext':
        return (
          <div className="border rounded-md p-3 min-h-[100px] bg-muted text-muted-foreground">
            Rich text editor would appear here
          </div>
        );

      case 'number':
      case 'decimal':
        return (
          <Input
            type="number"
            step={question.type === 'decimal' ? '0.01' : '1'}
            placeholder={question.placeholder || `Enter ${questionTypeLabels[question.type].toLowerCase()}`}
            disabled
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              step="0.01"
              className="pl-8"
              placeholder={question.placeholder || "0.00"}
              disabled
            />
          </div>
        );

      case 'choice':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'choices':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`choice-${index}`}
                  checked={selectedChoices.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedChoices([...selectedChoices, option]);
                    } else {
                      setSelectedChoices(selectedChoices.filter(choice => choice !== option));
                    }
                  }}
                  disabled
                />
                <label htmlFor={`choice-${index}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch disabled />
            <label className="text-sm">Yes/No</label>
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'datetime':
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input type="time" disabled />
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {question.type === 'image' ? 'Click to upload image' : 'Click to upload file'}
            </p>
          </div>
        );

      case 'table':
        const updateQuestion = (updates: Partial<Question>) => {
          if (onUpdate) {
            onUpdate(sectionId, question.id, updates);
          }
        };

        const addColumn = () => {
          if (!newColumnName.trim()) return;
          const updatedColumns = [...(question.tableColumns || []), newColumnName.trim()];
          const updatedRows = (question.tableRows || []).map(row => [...row, '']);
          updateQuestion({ 
            tableColumns: updatedColumns,
            tableRows: updatedRows.length === 0 ? [new Array(updatedColumns.length).fill('')] : updatedRows
          });
          setNewColumnName("");
        };

        const deleteColumn = (index: number) => {
          const updatedColumns = question.tableColumns?.filter((_, i) => i !== index) || [];
          const updatedRows = (question.tableRows || []).map(row => row.filter((_, i) => i !== index));
          updateQuestion({ 
            tableColumns: updatedColumns,
            tableRows: updatedRows
          });
        };

        const updateColumn = (index: number, newName: string) => {
          const updatedColumns = [...(question.tableColumns || [])];
          updatedColumns[index] = newName;
          updateQuestion({ tableColumns: updatedColumns });
          setEditingColumnIndex(null);
        };

        const addRowHeader = () => {
          if (!newRowHeaderName.trim()) return;
          const updatedRowHeaders = [...(question.tableRowHeaders || []), newRowHeaderName.trim()];
          const updatedRows = [...(question.tableRows || [])];
          if (updatedRows.length < updatedRowHeaders.length) {
            const columnsCount = question.tableColumns?.length || 1;
            updatedRows.push(new Array(columnsCount).fill(''));
          }
          updateQuestion({ 
            tableRowHeaders: updatedRowHeaders,
            tableRows: updatedRows
          });
          setNewRowHeaderName("");
        };

        const deleteRowHeader = (index: number) => {
          const updatedRowHeaders = question.tableRowHeaders?.filter((_, i) => i !== index) || [];
          const updatedRows = (question.tableRows || []).filter((_, i) => i !== index);
          updateQuestion({ 
            tableRowHeaders: updatedRowHeaders,
            tableRows: updatedRows
          });
        };

        const updateRowHeader = (index: number, newName: string) => {
          const updatedRowHeaders = [...(question.tableRowHeaders || [])];
          updatedRowHeaders[index] = newName;
          updateQuestion({ tableRowHeaders: updatedRowHeaders });
          setEditingRowHeaderIndex(null);
        };

        return (
          <div className="space-y-4">
            {onUpdate && (
              <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-2">Column Headers</h4>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Enter column name"
                      className="text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                    />
                    <Button onClick={addColumn} size="sm" disabled={!newColumnName.trim()}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-2">Row Headers</h4>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newRowHeaderName}
                      onChange={(e) => setNewRowHeaderName(e.target.value)}
                      placeholder="Enter row header name"
                      className="text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && addRowHeader()}
                    />
                    <Button onClick={addRowHeader} size="sm" disabled={!newRowHeaderName.trim()}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {question.tableRowHeaders && question.tableRowHeaders.length > 0 && (
                      <TableHead className="bg-muted/50 p-2">
                        <div className="font-medium text-xs">Row Headers</div>
                      </TableHead>
                    )}
                    {question.tableColumns?.map((column, index) => (
                      <TableHead key={index} className="p-2">
                        <div className="flex items-center gap-1">
                          {onUpdate && editingColumnIndex === index ? (
                            <Input
                              defaultValue={column}
                              autoFocus
                              className="text-sm h-6 p-1"
                              onBlur={(e) => updateColumn(index, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateColumn(index, e.currentTarget.value);
                                } else if (e.key === 'Escape') {
                                  setEditingColumnIndex(null);
                                }
                              }}
                            />
                          ) : (
                            <>
                              <span className="flex-1 text-sm font-medium">{column}</span>
                              {onUpdate && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={() => setEditingColumnIndex(index)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-destructive"
                                    onClick={() => deleteColumn(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {question.tableRows?.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {question.tableRowHeaders && question.tableRowHeaders.length > 0 && (
                        <TableCell className="bg-muted/30 p-2">
                          <div className="flex items-center gap-1">
                            {onUpdate && editingRowHeaderIndex === rowIndex ? (
                              <Input
                                defaultValue={question.tableRowHeaders[rowIndex] || `Row ${rowIndex + 1}`}
                                autoFocus
                                className="text-sm h-6 p-1 font-medium"
                                onBlur={(e) => updateRowHeader(rowIndex, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateRowHeader(rowIndex, e.currentTarget.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingRowHeaderIndex(null);
                                  }
                                }}
                              />
                            ) : (
                              <>
                                <span className="flex-1 text-sm font-medium">
                                  {question.tableRowHeaders[rowIndex] || `Row ${rowIndex + 1}`}
                                </span>
                                {onUpdate && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      onClick={() => setEditingRowHeaderIndex(rowIndex)}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 text-destructive"
                                      onClick={() => deleteRowHeader(rowIndex)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="p-2">
                          <Input
                            value={cell}
                            placeholder={`Enter ${question.tableColumns?.[cellIndex] || 'value'}`}
                            disabled
                            className="border-0 bg-transparent p-1 text-sm"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {(!question.tableRows || question.tableRows.length === 0) && question.tableColumns && (
                    <TableRow>
                      {question.tableRowHeaders && question.tableRowHeaders.length > 0 && (
                        <TableCell className="bg-muted/30 font-medium p-2">
                          <span className="text-sm">
                            {question.tableRowHeaders[0] || 'Row 1'}
                          </span>
                        </TableCell>
                      )}
                      {question.tableColumns.map((_, cellIndex) => (
                        <TableCell key={cellIndex} className="p-2">
                          <Input
                            placeholder={`Enter ${question.tableColumns?.[cellIndex] || 'value'}`}
                            disabled
                            className="border-0 bg-transparent p-1 text-sm"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      default:
        return (
          <Input
            placeholder={question.placeholder || "Input field"}
            disabled
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">
          {question.title}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </label>
        {question.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {question.description}
          </p>
        )}
        {question.bulletPoints && question.bulletPoints.length > 0 && (
          <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
            {question.bulletPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        )}
      </div>
      {renderControl()}
    </div>
  );
}