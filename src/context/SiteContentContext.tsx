import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Edit3, Check, X, Pencil } from 'lucide-react';

interface SiteContentContextType {
  editMode: boolean;
  toggleEditMode: () => void;
  getContent: (key: string, defaultValue: string) => string;
  updateContent: (key: string, value: string) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('shibir_library_site_content');
    return saved ? JSON.parse(saved) : {};
  });

  // Sync content with Firestore if configured
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const fetchRemoteContent = async () => {
      try {
        const docRef = doc(db, 'settings', 'site_content');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const remote = snap.data() as Record<string, string>;
          setContent((prev) => {
            const merged = { ...prev, ...remote };
            localStorage.setItem('shibir_library_site_content', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Could not sync remote site content:', err);
      }
    };

    fetchRemoteContent();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('shibir_library_site_content', JSON.stringify(content));
  }, [content]);

  // Turn off edit mode if admin logs out
  useEffect(() => {
    if (!isAdmin) {
      setEditMode(false);
    }
  }, [isAdmin]);

  const toggleEditMode = () => {
    if (!isAdmin) return;
    setEditMode((prev) => !prev);
  };

  const getContent = (key: string, defaultValue: string): string => {
    return content[key] !== undefined ? content[key] : defaultValue;
  };

  const updateContent = async (key: string, value: string) => {
    const updated = { ...content, [key]: value };
    setContent(updated);
    localStorage.setItem('shibir_library_site_content', JSON.stringify(updated));

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, 'settings', 'site_content');
        await setDoc(docRef, updated, { merge: true });
      } catch (err) {
        console.warn('Failed to save content to Firestore:', err);
      }
    }
  };

  return (
    <SiteContentContext.Provider
      value={{
        editMode: isAdmin && editMode,
        toggleEditMode,
        getContent,
        updateContent,
      }}
    >
      {children}
      {isAdmin && <AdminEditModeToolbar editMode={editMode} toggleEditMode={toggleEditMode} />}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error('useSiteContent must be used within SiteContentProvider');
  return context;
};

// Floating Admin Bar to toggle Edit Mode
const AdminEditModeToolbar: React.FC<{ editMode: boolean; toggleEditMode: () => void }> = ({
  editMode,
  toggleEditMode,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <button
        onClick={toggleEditMode}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold transition-all border ${
          editMode
            ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 ring-4 ring-amber-400/30'
            : 'bg-primary-900/95 hover:bg-primary text-white border-primary-700/80 backdrop-blur-md'
        }`}
      >
        <Edit3 className="w-4 h-4" />
        <span>{editMode ? 'এডিট মোড চালু (বন্ধ করুন)' : 'এডিট মোড চালু করুন'}</span>
        {editMode && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
      </button>
    </div>
  );
};

// Reusable EditableText Component
interface EditableTextProps {
  contentKey: string;
  defaultText: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  defaultText,
  as: Component = 'span',
  className = '',
  multiline = false,
}) => {
  const { editMode, getContent, updateContent } = useSiteContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentText = getContent(contentKey, defaultText);
  const [editText, setEditText] = useState(currentText);

  useEffect(() => {
    setEditText(currentText);
  }, [currentText]);

  const handleSave = async () => {
    await updateContent(contentKey, editText);
    setIsModalOpen(false);
  };

  return (
    <>
      <Component className={`${className} ${editMode ? 'relative group/edit inline-flex items-center gap-1.5' : ''}`}>
        <span>{currentText}</span>
        {editMode && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditText(currentText);
              setIsModalOpen(true);
            }}
            title="এই লেখাটি এডিট করুন"
            className="inline-flex items-center justify-center p-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition scale-90 hover:scale-105"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </Component>

      {/* Inline Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Pencil className="w-4 h-4 text-amber-600" />
                <span>টেক্সট এডিট করুন</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-brand-muted hover:text-brand-text hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5">
                নতুন টেক্সট লিখুন:
              </label>
              {multiline ? (
                <textarea
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-brand-text"
                />
              ) : (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-brand-text"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-muted hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
