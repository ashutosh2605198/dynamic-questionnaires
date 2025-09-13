import { useState } from "react";
import { Plus, FileText, Edit2, Trash2, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuestionLibrary } from "@/stores/useQuestionLibrary";
import { useHeaderFooter } from "@/stores/useHeaderFooter";
import { Questionnaire, Section } from "@/types/questionnaire";
import { QuestionPreview } from "@/components/library/QuestionPreview";
import { QuestionnaireBuilderFlow } from "@/components/library/QuestionnaireBuilderFlow";
import { SearchFilter } from "@/components/ui/search-filter";
import { useSearchFilter } from "@/hooks/use-search-filter";

export default function Questionnaires() {
  const { libraries } = useQuestionLibrary();
  const { headers, footers } = useHeaderFooter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isBuilderFlowOpen, setIsBuilderFlowOpen] = useState(false);
  const [isNewSectionDialogOpen, setIsNewSectionDialogOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [newSectionData, setNewSectionData] = useState({
    title: "",
    description: ""
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    headerId: "",
    footerId: "",
    status: "draft" as const
  });
  const [editData, setEditData] = useState<{
    title: string;
    description: string;
    headerId: string;
    footerId: string;
    status: 'draft' | 'published' | 'archived';
  }>({
    title: "",
    description: "",
    headerId: "",
    footerId: "",
    status: "draft"
  });

  // Search and filter for questionnaires
  const {
    searchValue,
    setSearchValue,
    selectedFilters,
    setSelectedFilters,
    filteredItems: filteredQuestionnaires
  } = useSearchFilter({
    items: questionnaires,
    searchFields: ['title', 'description'],
    filterFunction: (item, filters) => {
      return filters.length === 0 || filters.includes(item.status);
    },
    sortFunction: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  });

  // Filter options for status
  const statusFilterOptions = [
    { key: 'draft', label: 'Draft', value: 'draft' },
    { key: 'published', label: 'Published', value: 'published' },
    { key: 'archived', label: 'Archived', value: 'archived' }
  ];

  const handleCreateQuestionnaire = () => {
    const newQuestionnaire: Questionnaire = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      headerId: formData.headerId === "none" ? undefined : formData.headerId || undefined,
      footerId: formData.footerId === "none" ? undefined : formData.footerId || undefined,
      sections: [],
      status: formData.status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setQuestionnaires([...questionnaires, newQuestionnaire]);
    setFormData({ title: "", description: "", headerId: "", footerId: "", status: "draft" });
    setIsCreateDialogOpen(false);
    
    // Open builder flow for the new questionnaire
    setSelectedQuestionnaire(newQuestionnaire);
    setIsBuilderFlowOpen(true);
  };

  const handleDeleteQuestionnaire = (id: string) => {
    if (confirm("Are you sure you want to delete this questionnaire? This action cannot be undone.")) {
      setQuestionnaires(questionnaires.filter(q => q.id !== id));
      if (selectedQuestionnaire?.id === id) {
        setSelectedQuestionnaire(null);
      }
    }
  };

  const handleDuplicateQuestionnaire = (questionnaire: Questionnaire) => {
    const duplicated: Questionnaire = {
      ...questionnaire,
      id: crypto.randomUUID(),
      title: `${questionnaire.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setQuestionnaires([...questionnaires, duplicated]);
  };

  const handleEditQuestionnaire = () => {
    if (!selectedQuestionnaire) return;
    
    const updatedQuestionnaire = {
      ...selectedQuestionnaire,
      title: editData.title,
      description: editData.description,
      headerId: editData.headerId === "none" ? undefined : editData.headerId || undefined,
      footerId: editData.footerId === "none" ? undefined : editData.footerId || undefined,
      status: editData.status,
      updatedAt: new Date()
    };
    
    setQuestionnaires(questionnaires.map(q => 
      q.id === selectedQuestionnaire.id ? updatedQuestionnaire : q
    ));
    setSelectedQuestionnaire(updatedQuestionnaire);
    setIsEditDialogOpen(false);
  };

  const handleAddFromLibrary = () => {
    if (!selectedQuestionnaire || selectedSections.length === 0) return;
    
    const sectionsToAdd: Section[] = [];
    selectedSections.forEach(sectionId => {
      libraries.forEach(library => {
        const section = library.sections.find(s => s.id === sectionId);
        if (section) {
          sectionsToAdd.push({
            ...section,
            id: crypto.randomUUID() // Create new ID for questionnaire copy
          });
        }
      });
    });
    
    const updatedQuestionnaire = {
      ...selectedQuestionnaire,
      sections: [...selectedQuestionnaire.sections, ...sectionsToAdd],
      updatedAt: new Date()
    };
    
    setQuestionnaires(questionnaires.map(q => 
      q.id === selectedQuestionnaire.id ? updatedQuestionnaire : q
    ));
    setSelectedQuestionnaire(updatedQuestionnaire);
    setSelectedSections([]);
    setIsLibraryDialogOpen(false);
  };

  const handleBuilderFlowComplete = (selections: {
    headerId?: string;
    sectionIds: string[];
    footerId?: string;
  }) => {
    if (!selectedQuestionnaire) return;
    
    // Add selected sections to questionnaire
    const sectionsToAdd: Section[] = [];
    selections.sectionIds.forEach(sectionId => {
      libraries.forEach(library => {
        const section = library.sections.find(s => s.id === sectionId);
        if (section) {
          sectionsToAdd.push({
            ...section,
            id: crypto.randomUUID() // Create new ID for questionnaire copy
          });
        }
      });
    });
    
    const updatedQuestionnaire = {
      ...selectedQuestionnaire,
      headerId: selections.headerId,
      footerId: selections.footerId,
      sections: [...selectedQuestionnaire.sections, ...sectionsToAdd],
      updatedAt: new Date()
    };
    
    setQuestionnaires(questionnaires.map(q => 
      q.id === selectedQuestionnaire.id ? updatedQuestionnaire : q
    ));
    setSelectedQuestionnaire(updatedQuestionnaire);
  };

  const handleCreateNewSection = () => {
    if (!selectedQuestionnaire || !newSectionData.title) return;
    
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: newSectionData.title,
      description: newSectionData.description,
      questions: [],
      order: selectedQuestionnaire.sections.length + 1,
      hidden: false
    };
    
    const updatedQuestionnaire = {
      ...selectedQuestionnaire,
      sections: [...selectedQuestionnaire.sections, newSection],
      updatedAt: new Date()
    };
    
    setQuestionnaires(questionnaires.map(q => 
      q.id === selectedQuestionnaire.id ? updatedQuestionnaire : q
    ));
    setSelectedQuestionnaire(updatedQuestionnaire);
    setNewSectionData({ title: "", description: "" });
    setIsNewSectionDialogOpen(false);
  };

  const openEditDialog = () => {
    if (selectedQuestionnaire) {
      setEditData({
        title: selectedQuestionnaire.title,
        description: selectedQuestionnaire.description || "",
        headerId: selectedQuestionnaire.headerId || "none",
        footerId: selectedQuestionnaire.footerId || "none",
        status: selectedQuestionnaire.status
      });
      setIsEditDialogOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'archived': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-blue-500/10 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Questionnaires</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage dynamic questionnaires for your clients
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Questionnaire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Questionnaire</DialogTitle>
                <DialogDescription>
                  Create a new questionnaire to collect responses from clients
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter questionnaire title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter questionnaire description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="header">Header (Optional)</Label>
                  <Select value={formData.headerId} onValueChange={(value) => setFormData({ ...formData, headerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a header" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Header</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header.id} value={header.id}>
                          {header.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="footer">Footer (Optional)</Label>
                  <Select value={formData.footerId} onValueChange={(value) => setFormData({ ...formData, footerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a footer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Footer</SelectItem>
                      {footers.map((footer) => (
                        <SelectItem key={footer.id} value={footer.id}>
                          {footer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Initial Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateQuestionnaire} disabled={!formData.title}>
                    Create Questionnaire
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Questionnaires Sidebar */}
        <div className="w-80 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Questionnaires</span>
            </div>
            <SearchFilter
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              filterOptions={statusFilterOptions}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
              placeholder="Search questionnaires..."
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {questionnaires.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No questionnaires yet. Create your first one!
                </p>
              </div>
            ) : filteredQuestionnaires.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No questionnaires match your search
              </p>
            ) : (
              <div className="space-y-1">
                {filteredQuestionnaires.map((questionnaire) => (
                  <div
                    key={questionnaire.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedQuestionnaire?.id === questionnaire.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedQuestionnaire(questionnaire)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {questionnaire.title}
                        </h3>
                        <p className="text-xs opacity-75 mt-1">
                          {questionnaire.sections.length} sections
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            className={`text-xs ${getStatusColor(questionnaire.status)}`}
                            variant="outline"
                          >
                            {questionnaire.status}
                          </Badge>
                          <span className="text-xs opacity-60">
                            {new Date(questionnaire.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateQuestionnaire(questionnaire);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestionnaire(questionnaire.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedQuestionnaire ? (
            <>
              <div className="border-b border-border p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedQuestionnaire.title}</h2>
                    {selectedQuestionnaire.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedQuestionnaire.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        className={`text-xs ${getStatusColor(selectedQuestionnaire.status)}`}
                        variant="outline"
                      >
                        {selectedQuestionnaire.status}
                      </Badge>
                      {selectedQuestionnaire.headerId && (
                        <Badge variant="secondary" className="text-xs">
                          Has Header
                        </Badge>
                      )}
                      {selectedQuestionnaire.footerId && (
                        <Badge variant="secondary" className="text-xs">
                          Has Footer
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setIsPreviewDialogOpen(true)} variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button onClick={openEditDialog} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button onClick={() => setIsBuilderFlowOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sections
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {selectedQuestionnaire.sections.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-muted-foreground mb-4 text-lg">
                        No sections in this questionnaire yet
                      </p>
                      <Button onClick={() => setIsBuilderFlowOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sections from Library
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedQuestionnaire.sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border rounded-lg">
                        <div className="p-4 border-b bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">
                                {sectionIndex + 1}. {section.title}
                              </h3>
                              {section.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {section.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {section.questions.length} questions
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          {section.questions.map((question, questionIndex) => (
                            <div key={question.id} className="border rounded p-4 bg-card">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="font-mono text-xs">
                                  Q{questionIndex + 1}
                                </Badge>
                                <Badge variant="outline">{question.type}</Badge>
                                {question.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                {question.facilityNumber && (
                                  <Badge variant="secondary" className="text-xs">
                                    Facility: {question.facilityNumber}
                                  </Badge>
                                )}
                              </div>
                              <QuestionPreview question={question} sectionId={section.id} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">
                  Select a questionnaire to get started
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a questionnaire from the sidebar to view and edit its content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <QuestionnaireBuilderFlow
        isOpen={isBuilderFlowOpen}
        onOpenChange={setIsBuilderFlowOpen}
        onComplete={handleBuilderFlowComplete}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Questionnaire</DialogTitle>
            <DialogDescription>
              Update questionnaire details and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-header">Header</Label>
              <Select value={editData.headerId} onValueChange={(value) => setEditData({ ...editData, headerId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Header</SelectItem>
                  {headers.map((header) => (
                    <SelectItem key={header.id} value={header.id}>
                      {header.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-footer">Footer</Label>
              <Select value={editData.footerId} onValueChange={(value) => setEditData({ ...editData, footerId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Footer</SelectItem>
                  {footers.map((footer) => (
                    <SelectItem key={footer.id} value={footer.id}>
                      {footer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editData.status} onValueChange={(value: any) => setEditData({ ...editData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditQuestionnaire}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}