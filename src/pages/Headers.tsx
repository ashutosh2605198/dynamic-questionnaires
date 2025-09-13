import { useState } from "react";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHeaderFooter } from "@/stores/useHeaderFooter";
import { HeaderFooterDialog } from "@/components/library/HeaderFooterDialog";
import { HeaderFooter } from "@/types/questionnaire";

export default function Headers() {
  const { headers, createHeader, updateHeader, deleteHeader } = useHeaderFooter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHeader, setEditingHeader] = useState<HeaderFooter | null>(null);

  const handleSave = (data: { name: string; content: string }) => {
    if (editingHeader) {
      updateHeader(editingHeader.id, data);
      setEditingHeader(null);
    } else {
      createHeader(data);
    }
  };

  const handleEdit = (header: HeaderFooter) => {
    setEditingHeader(header);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteHeader(id);
  };

  const handleCreateNew = () => {
    setEditingHeader(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Headers</h1>
            <p className="text-muted-foreground">
              Create and manage reusable headers for your questionnaires
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Header
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {headers.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No headers yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first header to get started
                    </p>
                    <Button onClick={handleCreateNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Header
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            headers.map((header) => (
              <Card key={header.id} className="group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{header.name}</CardTitle>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(header)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(header.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Created {new Date(header.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none text-sm text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: header.content || 'No content' }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <HeaderFooterDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          type="header"
          onSave={handleSave}
          editItem={editingHeader}
        />
      </div>
    </div>
  );
}