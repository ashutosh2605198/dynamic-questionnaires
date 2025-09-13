import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuestionLibrary, Section, Question } from '@/types/questionnaire';

interface QuestionLibraryStore {
  libraries: QuestionLibrary[];
  currentLibrary: QuestionLibrary | null;
  
  // Library actions
  createLibrary: (library: Omit<QuestionLibrary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLibrary: (id: string, updates: Partial<QuestionLibrary>) => void;
  deleteLibrary: (id: string) => void;
  setCurrentLibrary: (library: QuestionLibrary | null) => void;
  
  // Section actions
  addSection: (libraryId: string, section: Omit<Section, 'id' | 'questions' | 'order'>) => void;
  updateSection: (libraryId: string, sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (libraryId: string, sectionId: string) => void;
  copySection: (libraryId: string, sectionId: string) => void;
  reorderSections: (libraryId: string, sectionIds: string[]) => void;
  
  // Question actions
  addQuestion: (libraryId: string, sectionId: string, question: Omit<Question, 'id' | 'order'>) => void;
  updateQuestion: (libraryId: string, sectionId: string, questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (libraryId: string, sectionId: string, questionId: string) => void;
  copyQuestion: (libraryId: string, sectionId: string, questionId: string) => void;
  reorderQuestions: (libraryId: string, sectionId: string, questionIds: string[]) => void;
}

export const useQuestionLibrary = create<QuestionLibraryStore>()(
  persist(
    (set, get) => ({
      libraries: [],
      currentLibrary: null,

      createLibrary: (libraryData) => {
        const newLibrary: QuestionLibrary = {
          ...libraryData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          sections: []
        };
        
        set((state) => ({
          libraries: [...state.libraries, newLibrary]
        }));
      },

      updateLibrary: (id, updates) => {
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === id
              ? { ...lib, ...updates, updatedAt: new Date() }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === id
            ? { ...state.currentLibrary, ...updates, updatedAt: new Date() }
            : state.currentLibrary
        }));
      },

      deleteLibrary: (id) => {
        set((state) => ({
          libraries: state.libraries.filter((lib) => lib.id !== id),
          currentLibrary: state.currentLibrary?.id === id ? null : state.currentLibrary
        }));
      },

      setCurrentLibrary: (library) => {
        set({ currentLibrary: library });
      },

      addSection: (libraryId, sectionData) => {
        const library = get().libraries.find(lib => lib.id === libraryId);
        const maxOrder = library?.sections.reduce((max, section) => Math.max(max, section.order), 0) || 0;
        
        const newSection: Section = {
          ...sectionData,
          id: crypto.randomUUID(),
          questions: [],
          order: maxOrder + 1,
          hidden: false
        };

        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: [...lib.sections, newSection],
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: [...state.currentLibrary.sections, newSection],
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      },

      updateSection: (libraryId, sectionId, updates) => {
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: lib.sections.map((section) =>
                    section.id === sectionId ? { ...section, ...updates } : section
                  ),
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: state.currentLibrary.sections.map((section) =>
                  section.id === sectionId ? { ...section, ...updates } : section
                ),
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      },

      deleteSection: (libraryId, sectionId) => {
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: lib.sections.filter((section) => section.id !== sectionId),
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: state.currentLibrary.sections.filter((section) => section.id !== sectionId),
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      },

      copySection: (libraryId, sectionId) => {
        const state = get();
        const library = state.libraries.find((lib) => lib.id === libraryId);
        const section = library?.sections.find((s) => s.id === sectionId);
        if (!library || !section) return;

        const maxOrder = library.sections.reduce((max, s) => Math.max(max, s.order), 0) || 0;

        const newSectionId = crypto.randomUUID();
        const newSection: Section = {
          id: newSectionId,
          title: `${section.title} (Copy)`,
          description: section.description,
          questions: section.questions
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((q, idx) => ({
              ...q,
              id: crypto.randomUUID(),
              order: idx + 1,
            })),
          order: maxOrder + 1,
          hidden: section.hidden,
        };

        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: [...lib.sections, newSection],
                  updatedAt: new Date(),
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: [...state.currentLibrary.sections, newSection],
                updatedAt: new Date(),
              }
            : state.currentLibrary,
        }));
      },

      addQuestion: (libraryId, sectionId, questionData) => {
        const library = get().libraries.find(lib => lib.id === libraryId);
        const section = library?.sections.find(sec => sec.id === sectionId);
        const maxOrder = section?.questions.reduce((max, question) => Math.max(max, question.order), 0) || 0;
        
        const newQuestion: Question = {
          ...questionData,
          id: crypto.randomUUID(),
          order: maxOrder + 1,
          hidden: false
        };

        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: lib.sections.map((section) =>
                    section.id === sectionId
                      ? { ...section, questions: [...section.questions, newQuestion] }
                      : section
                  ),
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: state.currentLibrary.sections.map((section) =>
                  section.id === sectionId
                    ? { ...section, questions: [...section.questions, newQuestion] }
                    : section
                ),
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      },

      updateQuestion: (libraryId, sectionId, questionId, updates) => {
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: lib.sections.map((section) =>
                    section.id === sectionId
                      ? {
                          ...section,
                          questions: section.questions.map((question) =>
                            question.id === questionId ? { ...question, ...updates } : question
                          )
                        }
                      : section
                  ),
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: state.currentLibrary.sections.map((section) =>
                  section.id === sectionId
                    ? {
                        ...section,
                        questions: section.questions.map((question) =>
                          question.id === questionId ? { ...question, ...updates } : question
                        )
                      }
                    : section
                ),
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      },

      deleteQuestion: (libraryId, sectionId, questionId) => {
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: lib.sections.map((section) =>
                    section.id === sectionId
                      ? {
                          ...section,
                          questions: section.questions.filter((question) => question.id !== questionId)
                        }
                      : section
                  ),
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: state.currentLibrary.sections.map((section) =>
                  section.id === sectionId
                    ? {
                        ...section,
                        questions: section.questions.filter((question) => question.id !== questionId)
                      }
                    : section
                ),
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      },

      copyQuestion: (libraryId, sectionId, questionId) => {
        const state = get();
        const library = state.libraries.find((lib) => lib.id === libraryId);
        const section = library?.sections.find((s) => s.id === sectionId);
        const question = section?.questions.find((q) => q.id === questionId);
        if (!section || !question) return;

        const maxOrder = section.questions.reduce((max, q) => Math.max(max, q.order), 0) || 0;
        const newQuestion: Question = {
          ...question,
          id: crypto.randomUUID(),
          title: `${question.title} (Copy)`,
          order: maxOrder + 1,
        };

        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: lib.sections.map((s) =>
                    s.id === sectionId
                      ? { ...s, questions: [...s.questions, newQuestion] }
                      : s
                  ),
                  updatedAt: new Date(),
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: state.currentLibrary.sections.map((s) =>
                  s.id === sectionId
                    ? { ...s, questions: [...s.questions, newQuestion] }
                    : s
                ),
                updatedAt: new Date(),
              }
            : state.currentLibrary,
        }));
      },

      reorderSections: (libraryId, sectionIds) => {
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: sectionIds.map((id, index) => {
                    const section = lib.sections.find(s => s.id === id);
                    return section ? { ...section, order: index + 1 } : section;
                  }).filter(Boolean) as Section[],
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: sectionIds.map((id, index) => {
                  const section = state.currentLibrary!.sections.find(s => s.id === id);
                  return section ? { ...section, order: index + 1 } : section;
                }).filter(Boolean) as Section[],
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      },

      reorderQuestions: (libraryId, sectionId, questionIds) => {
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === libraryId
              ? {
                  ...lib,
                  sections: lib.sections.map((section) =>
                    section.id === sectionId
                      ? {
                          ...section,
                          questions: questionIds.map((id, index) => {
                            const question = section.questions.find(q => q.id === id);
                            return question ? { ...question, order: index + 1 } : question;
                          }).filter(Boolean) as Question[]
                        }
                      : section
                  ),
                  updatedAt: new Date()
                }
              : lib
          ),
          currentLibrary: state.currentLibrary?.id === libraryId
            ? {
                ...state.currentLibrary,
                sections: state.currentLibrary.sections.map((section) =>
                  section.id === sectionId
                    ? {
                        ...section,
                        questions: questionIds.map((id, index) => {
                          const question = section.questions.find(q => q.id === id);
                          return question ? { ...question, order: index + 1 } : question;
                        }).filter(Boolean) as Question[]
                      }
                    : section
                ),
                updatedAt: new Date()
              }
            : state.currentLibrary
        }));
      }
    }),
    {
      name: 'question-library-store'
    }
  )
);