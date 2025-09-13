import { Button } from "@/components/ui/button";
import { useQuestionLibrary } from "@/stores/useQuestionLibrary";
import { toast } from "sonner";
import { QuestionType } from "@/types/questionnaire";

export function CreateDemoLibrary() {
  const { createLibrary, addSection, addQuestion } = useQuestionLibrary();

  const createDemoLibraryWithAllQuestionTypes = () => {
    // Create the demo library first
    const libraryData = {
      name: "All Question Types Demo",
      description: "A comprehensive collection of all available question types for reference and testing",
      sections: []
    };

    createLibrary(libraryData);

    // Get the created library to get its ID
    const store = useQuestionLibrary.getState();
    const createdLibrary = store.libraries.find(lib => lib.name === "All Question Types Demo");
    
    if (!createdLibrary) {
      toast.error("Failed to create demo library");
      return;
    }

    // Add section to the library
    addSection(createdLibrary.id, {
      title: "Complete Question Type Collection",
      description: "Examples of every available question type in FormCraft",
      hidden: false
    });

    // Get the updated library with the section
    const updatedStore = useQuestionLibrary.getState();
    const updatedLibrary = updatedStore.libraries.find(lib => lib.id === createdLibrary.id);
    
    if (!updatedLibrary || updatedLibrary.sections.length === 0) {
      toast.error("Failed to create demo section");
      return;
    }

    const section = updatedLibrary.sections[0];

    // Define all question types with examples
    const questionTypes: Array<{
      type: QuestionType;
      title: string;
      description: string;
      placeholder?: string;
      options?: string[];
      bulletPoints?: string[];
      required: boolean;
    }> = [
      {
        type: 'text',
        title: 'Single Line Text',
        description: 'For short text responses like names, titles, etc.',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'textarea',
        title: 'Multiple Line Text',
        description: 'For longer text responses like comments or descriptions',
        placeholder: 'Enter your detailed feedback...',
        required: false
      },
      {
        type: 'email',
        title: 'Email Address',
        description: 'Validates email format automatically',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'url',
        title: 'Website URL',
        description: 'For website addresses and links',
        placeholder: 'https://www.example.com',
        required: false
      },
      {
        type: 'phone',
        title: 'Phone Number',
        description: 'For telephone numbers with validation',
        placeholder: '+1 (555) 123-4567',
        required: false
      },
      {
        type: 'richtext',
        title: 'Rich Text Editor',
        description: 'Allows formatted text with bold, italic, links, etc.',
        placeholder: 'Enter formatted content...',
        required: false
      },
      {
        type: 'choice',
        title: 'Single Choice (Radio)',
        description: 'Choose exactly one option from the list',
        options: ['Option A', 'Option B', 'Option C', 'Other'],
        required: true
      },
      {
        type: 'choices',
        title: 'Multiple Choice (Checkboxes)',
        description: 'Select one or more options from the list',
        options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
        required: false
      },
      {
        type: 'number',
        title: 'Whole Number',
        description: 'For integers only (no decimals)',
        placeholder: '42',
        required: false
      },
      {
        type: 'decimal',
        title: 'Decimal Number',
        description: 'For numbers with decimal places',
        placeholder: '3.14159',
        required: false
      },
      {
        type: 'currency',
        title: 'Currency Amount',
        description: 'For monetary values with proper formatting',
        placeholder: '1,234.56',
        required: false
      },
      {
        type: 'date',
        title: 'Date Only',
        description: 'Select a specific date',
        required: false
      },
      {
        type: 'datetime',
        title: 'Date and Time',
        description: 'Select both date and specific time',
        required: false
      },
      {
        type: 'boolean',
        title: 'Yes/No Question',
        description: 'Simple true/false or yes/no response',
        required: false
      },
      {
        type: 'file',
        title: 'File Upload',
        description: 'Allow users to upload any type of file',
        bulletPoints: ['PDF documents', 'Word files', 'Spreadsheets', 'Any file type'],
        required: false
      },
      {
        type: 'image',
        title: 'Image Upload',
        description: 'Specifically for image file uploads',
        bulletPoints: ['JPG, PNG, GIF formats', 'Automatic image preview', 'Size validation'],
        required: false
      },
      {
        type: 'ticker',
        title: 'Stock Ticker Symbol',
        description: 'For financial stock symbols and codes',
        placeholder: 'AAPL',
        required: false
      },
      {
        type: 'table',
        title: 'Data Table',
        description: 'Structured data entry with customizable rows and columns',
        required: false
      }
    ];

    // Add all questions to the section
    questionTypes.forEach((questionData) => {
      const baseData = {
        title: questionData.title,
        description: questionData.description,
        type: questionData.type,
        placeholder: questionData.placeholder,
        options: questionData.options,
        bulletPoints: questionData.bulletPoints,
        required: questionData.required,
        hidden: false
      };

      // Add special data for table questions
      if (questionData.type === 'table') {
        addQuestion(createdLibrary.id, section.id, {
          ...baseData,
          tableColumns: ['Product', 'Quantity', 'Unit Price', 'Total'],
          tableRowHeaders: ['Item 1', 'Item 2', 'Item 3'],
          tableRows: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', '']
          ]
        });
      } else {
        addQuestion(createdLibrary.id, section.id, baseData);
      }
    });

    toast.success(`Demo library created with all ${questionTypes.length} question types!`);
  };

  return (
    <Button onClick={createDemoLibraryWithAllQuestionTypes} variant="outline">
      Create Demo Library (All Question Types)
    </Button>
  );
}