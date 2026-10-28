import React, { createContext, useContext, useState, useEffect } from 'react';
import { Syllabus } from '../types';
import { INITIAL_SYLLABUSES } from '../lib/syllabusSeedData';
import { canonicalizeSyllabus, validateSyllabus, sanitizeFirestorePayload } from '../lib/syllabusValidation';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface SyllabusContextType {
  syllabuses: Syllabus[];
  loading: boolean;
  error: string | null;
  getSyllabusByCategorySlug: (categorySlug: string) => Syllabus | undefined;
  getSyllabusById: (id: string) => Syllabus | undefined;
  saveSyllabus: (syllabusData: Partial<Syllabus>) => Promise<Syllabus>;
  deleteSyllabus: (id: string) => Promise<void>;
  togglePublishStatus: (id: string) => Promise<void>;
}

const SyllabusContext = createContext<SyllabusContextType | undefined>(undefined);

export const SyllabusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(() => {
    const saved = localStorage.getItem('shibir_library_syllabuses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SYLLABUSES;
      }
    }
    return INITIAL_SYLLABUSES;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize with Cloud Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    setLoading(true);
    const colRef = collection(db, 'syllabuses');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Syllabus[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...(d.data() as any) });
          });
          setSyllabuses(loaded);
          try {
            localStorage.setItem('shibir_library_syllabuses', JSON.stringify(loaded));
          } catch {
            // ignore
          }
        } else {
          // If Firestore collection is empty, seed it with the initial authentic syllabuses
          INITIAL_SYLLABUSES.forEach((syl) => {
            const clean = canonicalizeSyllabus(syl);
            setDoc(doc(db, 'syllabuses', syl.id), clean).catch(() => {});
          });
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore syllabuses listener error:', err);
        setError('সিলেবাস ডেটা লোড করতে সমস্যা হয়েছে।');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shibir_library_syllabuses', JSON.stringify(syllabuses));
    } catch {
      // ignore
    }
  }, [syllabuses]);

  const getSyllabusByCategorySlug = (categorySlug: string): Syllabus | undefined => {
    const cleanSlug = categorySlug.trim().toLowerCase();
    const match = syllabuses.find((s) => s.categorySlug?.toLowerCase() === cleanSlug || s.slug?.toLowerCase() === cleanSlug);
    if (!match) return undefined;
    // Non-admin visitors may only view published syllabuses
    if (!isAdmin && match.status !== 'published') {
      return undefined;
    }
    return match;
  };

  const getSyllabusById = (id: string): Syllabus | undefined => {
    const match = syllabuses.find((s) => s.id === id);
    if (!match) return undefined;
    if (!isAdmin && match.status !== 'published') {
      return undefined;
    }
    return match;
  };

  const saveSyllabus = async (syllabusData: Partial<Syllabus>): Promise<Syllabus> => {
    if (!isAdmin) {
      throw new Error('অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন সিলেবাস পরিচালনা করতে পারেন।');
    }

    const errors = validateSyllabus(syllabusData);
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    const cleanSyllabus = canonicalizeSyllabus({
      ...syllabusData,
      updatedBy: user?.uid,
      createdBy: syllabusData.createdBy || user?.uid,
    });

    if (isFirebaseConfigured) {
      const docRef = doc(db, 'syllabuses', cleanSyllabus.id);
      await setDoc(docRef, sanitizeFirestorePayload(cleanSyllabus));
    }

    setSyllabuses((prev) => {
      const index = prev.findIndex((s) => s.id === cleanSyllabus.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = cleanSyllabus;
        return copy;
      }
      return [cleanSyllabus, ...prev];
    });

    return cleanSyllabus;
  };

  const deleteSyllabus = async (id: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিন সিলেবাস মুছতে পারেন।');
    }

    if (isFirebaseConfigured) {
      const docRef = doc(db, 'syllabuses', id);
      await deleteDoc(docRef);
    }

    setSyllabuses((prev) => prev.filter((s) => s.id !== id));
  };

  const togglePublishStatus = async (id: string): Promise<void> => {
    const existing = syllabuses.find((s) => s.id === id);
    if (!existing) return;

    const nextStatus = existing.status === 'published' ? 'draft' : 'published';
    await saveSyllabus({
      ...existing,
      status: nextStatus,
      publishedAt: nextStatus === 'published' ? (existing.publishedAt || new Date().toISOString()) : undefined,
    });
  };

  return (
    <SyllabusContext.Provider
      value={{
        syllabuses,
        loading,
        error,
        getSyllabusByCategorySlug,
        getSyllabusById,
        saveSyllabus,
        deleteSyllabus,
        togglePublishStatus,
      }}
    >
      {children}
    </SyllabusContext.Provider>
  );
};

export const useSyllabus = () => {
  const context = useContext(SyllabusContext);
  if (!context) {
    throw new Error('useSyllabus must be used within a SyllabusProvider');
  }
  return context;
};
