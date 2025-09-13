import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Layout, Library, Hash } from "lucide-react";
import { HeaderFooter, Section } from "@/types/questionnaire";
import { useHeaderFooter } from "@/stores/useHeaderFooter";
import { useQuestionLibrary } from "@/stores/useQuestionLibrary";

interface QuestionnaireBuilderFlowProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (selections: {
    headerId?: string;
    sectionIds: string[];
    footerId?: string;
  }) => void;
}

type FlowStep = 'headers' | 'library' | 'footers' | 'complete';

export function QuestionnaireBuilderFlow({ 
  isOpen, 
  onOpenChange, 
  onComplete 
}: QuestionnaireBuilderFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('headers');
  const [selectedHeader, setSelectedHeader] = useState<string | undefined>();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedFooter, setSelectedFooter] = useState<string | undefined>();
  
  const { headers, footers } = useHeaderFooter();
  const { libraries } = useQuestionLibrary();

  const steps = [
    { key: 'headers', title: 'Select Header', icon: Layout, description: 'Choose a header for your questionnaire' },
    { key: 'library', title: 'Add Questions', icon: Library, description: 'Select sections from question library' },
    { key: 'footers', title: 'Select Footer', icon: Hash, description: 'Choose a footer for your questionnaire' },
    { key: 'complete', title: 'Complete', icon: ArrowRight, description: 'Review and finish' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleNext = () => {
    if (currentStep === 'headers') {
      setCurrentStep('library');
    } else if (currentStep === 'library') {
      setCurrentStep('footers');
    } else if (currentStep === 'footers') {
      setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    if (currentStep === 'library') {
      setCurrentStep('headers');
    } else if (currentStep === 'footers') {
      setCurrentStep('library');
    } else if (currentStep === 'complete') {
      setCurrentStep('footers');
    }
  };

  const handleComplete = () => {
    onComplete({
      headerId: selectedHeader,
      sectionIds: selectedSections,
      footerId: selectedFooter
    });
    
    // Reset state
    setCurrentStep('headers');
    setSelectedHeader(undefined);
    setSelectedSections([]);
    setSelectedFooter(undefined);
    onOpenChange(false);
  };

  const handleSkipStep = () => {
    if (currentStep === 'headers') {
      setSelectedHeader(undefined);
      setCurrentStep('library');
    } else if (currentStep === 'footers') {
      setSelectedFooter(undefined);
      setCurrentStep('complete');
    }
  };

  const toggleSectionSelection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const canProceed = () => {
    if (currentStep === 'library') {
      return selectedSections.length > 0;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Build Your Questionnaire</DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.slice(0, 3).map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.key === currentStep;
            const isCompleted = currentStepIndex > index;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 2 && (
                  <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        <Separator className="mb-6" />

        {/* Step Content */}
        <div className="flex-1 overflow-auto">
          {currentStep === 'headers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Choose a Header (Optional)</h3>
                <Button variant="outline" size="sm" onClick={handleSkipStep}>
                  Skip Headers
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {headers.map((header) => (
                  <Card 
                    key={header.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedHeader === header.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedHeader(header.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{header.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: header.content }}
                      />
                    </CardContent>
                  </Card>
                ))}
                {headers.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No headers available. You can create them from the Headers page.
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'library' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Question Sections</h3>
              <div className="space-y-6">
                {libraries.map((library) => (
                  <div key={library.id}>
                    <h4 className="font-medium mb-3">{library.name}</h4>
                    <div className="space-y-2">
                      {library.sections.map((section) => (
                        <Card key={section.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedSections.includes(section.id)}
                              onCheckedChange={() => toggleSectionSelection(section.id)}
                            />
                            <div className="flex-1">
                              <h5 className="font-medium">{section.title}</h5>
                              {section.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {section.description}
                                </p>
                              )}
                              <Badge variant="outline" className="mt-2">
                                {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
                {libraries.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No question libraries available. Create some from the Question Library page.
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'footers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Choose a Footer (Optional)</h3>
                <Button variant="outline" size="sm" onClick={handleSkipStep}>
                  Skip Footers
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {footers.map((footer) => (
                  <Card 
                    key={footer.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedFooter === footer.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedFooter(footer.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{footer.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: footer.content }}
                      />
                    </CardContent>
                  </Card>
                ))}
                {footers.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No footers available. You can create them from the Footers page.
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Selections</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Header</h4>
                  {selectedHeader ? (
                    <p className="text-sm text-muted-foreground">
                      {headers.find(h => h.id === selectedHeader)?.name || 'Selected header'}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No header selected</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Question Sections</h4>
                  {selectedSections.length > 0 ? (
                    <div className="space-y-1">
                      {selectedSections.map(sectionId => {
                        const section = libraries.flatMap(lib => lib.sections).find(s => s.id === sectionId);
                        return section ? (
                          <p key={sectionId} className="text-sm text-muted-foreground">
                            • {section.title} ({section.questions.length} questions)
                          </p>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sections selected</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Footer</h4>
                  {selectedFooter ? (
                    <p className="text-sm text-muted-foreground">
                      {footers.find(f => f.id === selectedFooter)?.name || 'Selected footer'}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No footer selected</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 'headers'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep === 'complete' ? (
              <Button onClick={handleComplete}>
                Complete Setup
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}