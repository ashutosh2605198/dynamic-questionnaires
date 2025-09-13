import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HeaderFooter } from '@/types/questionnaire';

interface HeaderFooterStore {
  headers: HeaderFooter[];
  footers: HeaderFooter[];
  
  // Header actions
  createHeader: (header: Omit<HeaderFooter, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => void;
  updateHeader: (id: string, updates: Partial<HeaderFooter>) => void;
  deleteHeader: (id: string) => void;
  
  // Footer actions
  createFooter: (footer: Omit<HeaderFooter, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => void;
  updateFooter: (id: string, updates: Partial<HeaderFooter>) => void;
  deleteFooter: (id: string) => void;
}

export const useHeaderFooter = create<HeaderFooterStore>()(
  persist(
    (set) => ({
      headers: [],
      footers: [],

      createHeader: (headerData) => {
        const newHeader: HeaderFooter = {
          ...headerData,
          id: crypto.randomUUID(),
          type: 'header',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          headers: [...state.headers, newHeader]
        }));
      },

      updateHeader: (id, updates) => {
        set((state) => ({
          headers: state.headers.map((header) =>
            header.id === id
              ? { ...header, ...updates, updatedAt: new Date() }
              : header
          )
        }));
      },

      deleteHeader: (id) => {
        set((state) => ({
          headers: state.headers.filter((header) => header.id !== id)
        }));
      },

      createFooter: (footerData) => {
        const newFooter: HeaderFooter = {
          ...footerData,
          id: crypto.randomUUID(),
          type: 'footer',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          footers: [...state.footers, newFooter]
        }));
      },

      updateFooter: (id, updates) => {
        set((state) => ({
          footers: state.footers.map((footer) =>
            footer.id === id
              ? { ...footer, ...updates, updatedAt: new Date() }
              : footer
          )
        }));
      },

      deleteFooter: (id) => {
        set((state) => ({
          footers: state.footers.filter((footer) => footer.id !== id)
        }));
      }
    }),
    {
      name: 'header-footer-store'
    }
  )
);