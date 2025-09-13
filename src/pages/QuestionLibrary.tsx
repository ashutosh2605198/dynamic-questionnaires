import { useState, useEffect } from "react";
import { Plus, Library, Edit2, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Copy } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuestionLibrary } from "@/stores/useQuestionLibrary";
import { QuestionLibrary as LibraryType, Section, Question } from "@/types/questionnaire";
import { LibraryDialog } from "@/components/library/LibraryDialog";
import { SectionDialog } from "@/components/library/SectionDialog";
import { QuestionDialog } from "@/components/library/QuestionDialog";
import { QuestionPreview } from "@/components/library/QuestionPreview";
import { CreateDemoLibrary } from "@/components/library/CreateDemoLibrary";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SearchFilter } from "@/components/ui/search-filter";
import { useSearchFilter } from "@/hooks/use-search-filter";

// Sortable Section Component
function SortableSection({ 
  section, 
  sectionIndex, 
  sectionNumber,
  selectedLibrary, 
  expandedSections, 
  onToggleSection, 
  onEditSection,
  onDeleteSection, 
  onToggleVisibility, 
  onAddQuestion, 
  onEditQuestion,
  onDeleteQuestion, 
  onToggleQuestionVisibility,
  onQuestionDragEnd,
  onCopySection,
  onCopyQuestion,
  onUpdateQuestion,
}: {
  section: Section;
  sectionIndex: number;
  sectionNumber: number;
  selectedLibrary: LibraryType;
  expandedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
  onToggleVisibility: (sectionId: string, currentHidden: boolean) => void;
  onAddQuestion: (sectionId: string) => void;
  onEditQuestion: (sectionId: string, question: Question) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  onToggleQuestionVisibility: (sectionId: string, questionId: string, currentHidden: boolean) => void;
  onQuestionDragEnd: (event: DragEndEvent, sectionId: string) => void;
  onCopySection?: (sectionId: string) => void;
  onCopyQuestion?: (sectionId: string, questionId: string) => void;
  onUpdateQuestion?: (libraryId: string, sectionId: string, questionId: string, updates: Partial<Question>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sortedQuestions = [...section.questions].sort((a, b) => a.order - b.order);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Collapsible
        open={expandedSections.has(section.id)}
        onOpenChange={() => onToggleSection(section.id)}
      >
        <div className="border rounded-lg">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <div {...listeners} className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div>
                  <h3 className="font-medium">
                    {sectionNumber}. {section.title}
                  </h3>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {section.questions.length} questions
                </Badge>
                {section.hidden && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Hidden
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSection(section);
                    }}
                    title="Edit section"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(section.id, section.hidden);
                    }}
                    title={section.hidden ? "Show section" : "Hide section"}
                  >
                    {section.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section.id);
                    }}
                    title="Delete section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopySection?.(section.id);
                    }}
                    title="Copy section"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddQuestion(section.id);
                    }}
                    title="Add question"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t p-4 space-y-3">
              {section.questions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    No questions in this section
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddQuestion(section.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={useSensors(
                    useSensor(PointerSensor),
                    useSensor(KeyboardSensor, {
                      coordinateGetter: sortableKeyboardCoordinates,
                    })
                  )}
                  collisionDetection={closestCenter}
                  onDragEnd={(event: DragEndEvent) => onQuestionDragEnd(event, section.id)}
                >
                  <SortableContext 
                    items={sortedQuestions.map(q => q.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedQuestions.map((question, questionIndex) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        questionIndex={questionIndex}
                        questionNumber={questionIndex + 1}
                        sectionId={section.id}
                        onEdit={onEditQuestion}
                        onDelete={onDeleteQuestion}
                        onToggleVisibility={onToggleQuestionVisibility}
                        onCopy={(sid, qid) => onCopyQuestion?.(sid, qid)}
                        onUpdate={onUpdateQuestion ? (sectionId, questionId, updates) => {
                          onUpdateQuestion(selectedLibrary.id, sectionId, questionId, updates);
                        } : undefined}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

// Sortable Question Component
function SortableQuestion({ 
  question, 
  questionIndex, 
  questionNumber,
  sectionId, 
  onEdit, 
  onDelete, 
  onToggleVisibility, 
  onCopy,
  onUpdate,
}: {
  question: Question;
  questionIndex: number;
  questionNumber: number;
  sectionId: string;
  onEdit: (sectionId: string, question: Question) => void;
  onDelete: (sectionId: string, questionId: string) => void;
  onToggleVisibility: (sectionId: string, questionId: string, currentHidden: boolean) => void;
  onCopy?: (sectionId: string, questionId: string) => void;
  onUpdate?: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="border rounded p-4 bg-card space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-mono text-xs">
                Q{questionNumber}
              </Badge>
              <Badge variant="outline">{question.type}</Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              {question.hidden && (
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  Hidden
                </Badge>
              )}
              {question.facilityNumber && (
                <Badge variant="secondary" className="text-xs">
                  Facility: {question.facilityNumber}
                </Badge>
              )}
            </div>
            <QuestionPreview 
              question={question} 
              sectionId={sectionId}
              onUpdate={question.type === 'table' && onUpdate ? onUpdate : undefined}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(sectionId, question)}
            title="Edit question"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleVisibility(sectionId, question.id, question.hidden)}
            title={question.hidden ? "Show question" : "Hide question"}
          >
            {question.hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy?.(sectionId, question.id)}
            title="Copy question"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(sectionId, question.id)}
            title="Delete question"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionLibrary() {
  const { 
    libraries, 
    currentLibrary,
    setCurrentLibrary, 
    deleteLibrary, 
    deleteSection, 
    updateSection, 
    updateQuestion, 
    deleteQuestion,
    copySection,
    copyQuestion,
    reorderSections,
    reorderQuestions 
  } = useQuestionLibrary();
  
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryType | null>(null);

  // Auto-sync selectedLibrary with currentLibrary from store
  const actualSelectedLibrary = selectedLibrary ? 
    libraries.find(lib => lib.id === selectedLibrary.id) || selectedLibrary : 
    null;
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for library updates to refresh UI
  useEffect(() => {
    const handleLibraryUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
      if (actualSelectedLibrary) {
        const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
        if (updatedLibrary) {
          setSelectedLibrary(updatedLibrary);
        }
      }
    };

    window.addEventListener('questionLibraryUpdate', handleLibraryUpdate);
    return () => window.removeEventListener('questionLibraryUpdate', handleLibraryUpdate);
  }, [actualSelectedLibrary, libraries]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Search and filter for libraries
  const {
    searchValue,
    setSearchValue,
    filteredItems: filteredLibraries
  } = useSearchFilter({
    items: libraries,
    searchFields: ['name', 'description'],
    sortFunction: (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  });

  const handleLibrarySelect = (library: LibraryType) => {
    setSelectedLibrary(library);
    setCurrentLibrary(library);
  };

  const handleDeleteLibrary = (libraryId: string) => {
    deleteLibrary(libraryId);
    if (selectedLibrary?.id === libraryId) {
      setSelectedLibrary(null);
      setCurrentLibrary(null);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddSection = () => {
    setIsSectionDialogOpen(true);
    setSelectedSectionId(null);
    setEditingSection(null);
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setSelectedSectionId(section.id);
    setIsSectionDialogOpen(true);
  };

  const handleAddQuestion = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedQuestionId(null);
    setEditingQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (sectionId: string, question: Question) => {
    setSelectedSectionId(sectionId);
    setSelectedQuestionId(question.id);
    setEditingQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!actualSelectedLibrary) return;
    if (confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
      deleteSection(actualSelectedLibrary.id, sectionId);
      // Force refresh of selectedLibrary
      const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
      if (updatedLibrary) {
        setSelectedLibrary(updatedLibrary);
      }
    }
  };

  const handleToggleSectionVisibility = (sectionId: string, currentHidden: boolean) => {
    if (!actualSelectedLibrary) return;
    updateSection(actualSelectedLibrary.id, sectionId, { hidden: !currentHidden });
    // Force refresh of selectedLibrary
    const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
    if (updatedLibrary) {
      setSelectedLibrary(updatedLibrary);
    }
  };

  const handleToggleQuestionVisibility = (sectionId: string, questionId: string, currentHidden: boolean) => {
    if (!actualSelectedLibrary) return;
    updateQuestion(actualSelectedLibrary.id, sectionId, questionId, { hidden: !currentHidden });
    // Force refresh of selectedLibrary
    const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
    if (updatedLibrary) {
      setSelectedLibrary(updatedLibrary);
    }
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    if (!actualSelectedLibrary) return;
    if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      deleteQuestion(actualSelectedLibrary.id, sectionId, questionId);
      // Force refresh of selectedLibrary
      const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
      if (updatedLibrary) {
        setSelectedLibrary(updatedLibrary);
      }
    }
  };

  const handleCopySection = (sectionId: string) => {
    if (!actualSelectedLibrary) return;
    copySection(actualSelectedLibrary.id, sectionId);
    // Force refresh of selectedLibrary
    const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
    if (updatedLibrary) {
      setSelectedLibrary(updatedLibrary);
    }
  };

  const handleCopyQuestion = (sectionId: string, questionId: string) => {
    if (!actualSelectedLibrary) return;
    copyQuestion(actualSelectedLibrary.id, sectionId, questionId);
    // Force refresh of selectedLibrary
    const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
    if (updatedLibrary) {
      setSelectedLibrary(updatedLibrary);
    }
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && actualSelectedLibrary) {
      const sortedSections = [...actualSelectedLibrary.sections].sort((a, b) => a.order - b.order);
      const oldIndex = sortedSections.findIndex(section => section.id === active.id);
      const newIndex = sortedSections.findIndex(section => section.id === over?.id);
      
      const newOrder = arrayMove(sortedSections, oldIndex, newIndex);
      reorderSections(actualSelectedLibrary.id, newOrder.map(s => s.id));
      // Force refresh of selectedLibrary
      const updatedLibrary = libraries.find(lib => lib.id === actualSelectedLibrary.id);
      if (updatedLibrary) {
        setSelectedLibrary(updatedLibrary);
      }
    }
  };

  const handleQuestionDragEnd = (event: DragEndEvent, sectionId: string) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && selectedLibrary) {
      const section = selectedLibrary.sections.find(s => s.id === sectionId);
      if (section) {
        const sortedQuestions = [...section.questions].sort((a, b) => a.order - b.order);
        const oldIndex = sortedQuestions.findIndex(q => q.id === active.id);
        const newIndex = sortedQuestions.findIndex(q => q.id === over?.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(sortedQuestions, oldIndex, newIndex);
          reorderQuestions(selectedLibrary.id, sectionId, newOrder.map(q => q.id));
        }
      }
    }
  };

  const sortedSections = selectedLibrary ? [...selectedLibrary.sections].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Question Library</h1>
            <p className="text-sm text-muted-foreground">
              Manage your question templates and sections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateDemoLibrary />
            <Button onClick={() => setIsLibraryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Library
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Libraries Sidebar */}
        <div className="w-80 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Library className="h-5 w-5" />
              <span className="font-medium">Libraries</span>
            </div>
            <SearchFilter
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              placeholder="Search libraries..."
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {libraries.length === 0 ? (
              <div className="text-center py-8">
                <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No libraries yet. Create your first one!
                </p>
                <CreateDemoLibrary />
              </div>
            ) : filteredLibraries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No libraries match your search
              </p>
            ) : (
              <div className="space-y-1">
                {filteredLibraries.map((library) => (
                  <div
                    key={library.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedLibrary?.id === library.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => handleLibrarySelect(library)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {library.name}
                        </h3>
                        <p className="text-xs opacity-75 mt-1">
                          {library.sections.length} sections
                        </p>
                        {library.description && (
                          <p className="text-xs opacity-60 mt-1 line-clamp-2">
                            {library.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLibrary(library.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 shrink-0 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedLibrary ? (
            <>
              <div className="border-b border-border p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedLibrary.name}</h2>
                    {selectedLibrary.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedLibrary.description}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleAddSection} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {selectedLibrary.sections.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-muted-foreground mb-4 text-lg">
                        No sections in this library yet
                      </p>
                      <Button onClick={handleAddSection}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Section
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleSectionDragEnd}
                    >
                      <SortableContext 
                        items={sortedSections.map(s => s.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        {sortedSections.map((section, sectionIndex) => (
                          <SortableSection
                            key={section.id}
                            section={section}
                            sectionIndex={sectionIndex}
                            sectionNumber={sectionIndex + 1}
                            selectedLibrary={selectedLibrary}
                            expandedSections={expandedSections}
                            onToggleSection={toggleSection}
                            onEditSection={handleEditSection}
                            onDeleteSection={handleDeleteSection}
                            onToggleVisibility={handleToggleSectionVisibility}
                            onAddQuestion={handleAddQuestion}
                            onEditQuestion={handleEditQuestion}
                            onDeleteQuestion={handleDeleteQuestion}
                            onToggleQuestionVisibility={handleToggleQuestionVisibility}
                            onQuestionDragEnd={handleQuestionDragEnd}
                            onCopySection={handleCopySection}
                            onCopyQuestion={handleCopyQuestion}
                            onUpdateQuestion={(libraryId, sectionId, questionId, updates) => {
                              updateQuestion(libraryId, sectionId, questionId, updates);
                            }}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Library className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">
                  Select a library to get started
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a library from the sidebar to view and edit its sections and questions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <LibraryDialog
        open={isLibraryDialogOpen}
        onOpenChange={setIsLibraryDialogOpen}
      />
      
      {selectedLibrary && (
        <>
          <SectionDialog
            open={isSectionDialogOpen}
            onOpenChange={setIsSectionDialogOpen}
            libraryId={selectedLibrary.id}
            editingSection={editingSection}
          />
          
          {selectedSectionId && (
            <QuestionDialog
              open={isQuestionDialogOpen}
              onOpenChange={setIsQuestionDialogOpen}
              libraryId={selectedLibrary.id}
              sectionId={selectedSectionId}
              editingQuestion={editingQuestion}
            />
          )}
        </>
      )}
    </div>
  );
}