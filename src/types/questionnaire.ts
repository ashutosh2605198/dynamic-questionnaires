export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  bulletPoints?: string[];
  facilityNumber?: string;
  order: number;
  hidden: boolean;
  tableColumns?: string[];
  tableRowHeaders?: string[];
  tableRows?: string[][];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  order: number;
  hidden: boolean;
}

export interface QuestionLibrary {
  id: string;
  name: string;
  description?: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HeaderFooter {
  id: string;
  name: string;
  content: string; // Rich text content
  type: 'header' | 'footer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  headerId?: string;
  footerId?: string;
  sections: Section[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: Date;
}

export interface QuestionResponse {
  questionId: string;
  value: any;
}

export interface FormSubmission {
  id: string;
  questionnaireId: string;
  clientId?: string;
  responses: QuestionResponse[];
  submittedAt: Date;
}

export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'phone'
  | 'richtext'
  | 'choice'
  | 'number'
  | 'decimal'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'choices'
  | 'boolean'
  | 'file'
  | 'image'
  | 'ticker'
  | 'table';

export const questionTypeLabels: Record<QuestionType, string> = {
  text: 'Single Line Text',
  textarea: 'Multiple Line Text',
  email: 'Email Address',
  url: 'URL',
  phone: 'Phone Number',
  richtext: 'Rich Text',
  choice: 'Single Choice',
  number: 'Whole Number',
  decimal: 'Decimal Number',
  currency: 'Currency',
  date: 'Date Only',
  datetime: 'Date and Time',
  choices: 'Multiple Choice',
  boolean: 'Yes/No',
  file: 'File Upload',
  image: 'Image Upload',
  ticker: 'Ticker Symbol',
  table: 'Table'
};