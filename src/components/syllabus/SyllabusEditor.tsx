import React, { useState, useCallback } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Save, Eye, EyeOff, GripVertical,
  BookOpen, Target, List, AlertTriangle, CheckCircle, X,
} from 'lucide-react';
import { Syllabus, SyllabusSection, SyllabusResourceGroup, SyllabusResource, Book } from '../../types';
import { isValidUrl } from '../../lib/syllabusValidation';
import { generateId } from '../../lib/utils';
import { useLibrary } from '../../context/LibraryContext';

const CATEGORY_OPTIONS = [
  { value: 'school-syllabus', label: 'স্কুল সিলেবাস' },
  { value: 'kormi-syllabus', label: 'কর্মী সিলেবাস' },
  { value: 'sathi-syllabus', label: 'সাথী সিলেবাস' },
  { value: 'shodosho-syllabus', label: 'সদস্য সিলেবাস' },
  { value: 'higher-syllabus', label: 'উচ্চতর সিলেবাস' },
  { value: 'syllabus-books', label: 'সিলেবাস বই' },
];

interface SyllabusEditorProps {
  initialSyllabus?: Syllabus;
  onSave: (data: Partial<Syllabus>) => Promise<Syllabus>;
  onCancel: () => void;
}

// ─── Empty Builders ──────────────────────────────────────────────────────────

const newSection = (order: number): SyllabusSection => ({
  id: `sec-new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  description: '',
  objectives: [''],
  studyInstructions: '',
  notes: '',
  resourceGroups: [],
  order,
});

const newGroup = (order: number): SyllabusResourceGroup => ({
  id: `grp-new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: 'অধ্যয়ন',
  description: '',
  items: [],
  order,
});

const newItem = (order: number): SyllabusResource => ({
  id: `item-new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  author: '',
  publisher: '',
  description: '',
  externalUrl: '',
  internalBookId: '',
  downloadUrl: '',
  resourceType: 'book',
  order,
});

// ─── Main Editor ─────────────────────────────────────────────────────────────

export const SyllabusEditor: React.FC<SyllabusEditorProps> = ({
  initialSyllabus,
  onSave,
  onCancel,
}) => {
  const [form, setForm] = useState<Partial<Syllabus>>({
    id: initialSyllabus?.id,
    title: initialSyllabus?.title || '',
    slug: initialSyllabus?.slug || '',
    categorySlug: initialSyllabus?.categorySlug || '',
    subtitle: initialSyllabus?.subtitle || '',
    description: initialSyllabus?.description || '',
    notice: initialSyllabus?.notice || '',
    bannerUrl: initialSyllabus?.bannerUrl || '',
    downloadUrl: initialSyllabus?.downloadUrl || '',
    lastUpdated: initialSyllabus?.lastUpdated || '',
    status: initialSyllabus?.status || 'draft',
    sections: initialSyllabus?.sections ? JSON.parse(JSON.stringify(initialSyllabus.sections)) : [],
    createdAt: initialSyllabus?.createdAt,
    createdBy: initialSyllabus?.createdBy,
    publishedAt: initialSyllabus?.publishedAt,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Field Handlers ─────────────────────────────────────────────────────────

  const setField = (field: keyof Syllabus, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Save Handler ───────────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (asStatus?: 'draft' | 'published') => {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const payload: Partial<Syllabus> = {
        ...form,
        status: asStatus ?? form.status ?? 'draft',
        slug: form.categorySlug || form.slug || '',
        sections: (form.sections || []).map((s, si) => ({
          ...s,
          order: si + 1,
          objectives: s.objectives.filter((o) => o.trim().length > 0),
          resourceGroups: s.resourceGroups.map((g, gi) => ({
            ...g,
            order: gi + 1,
            items: g.items.map((itm, ii) => ({
              ...itm,
              order: ii + 1,
              externalUrl: itm.externalUrl?.trim() || undefined,
              internalBookId: itm.internalBookId?.trim() || undefined,
              downloadUrl: itm.downloadUrl?.trim() || undefined,
              author: itm.author?.trim() || undefined,
              publisher: itm.publisher?.trim() || undefined,
              description: itm.description?.trim() || undefined,
            })),
          })),
        })),
      };

      try {
        const saved = await onSave(payload);
        setForm((prev) => ({ ...prev, id: saved.id, createdAt: saved.createdAt }));
        setSuccessMsg('সিলেবাস সফলভাবে সংরক্ষিত হয়েছে।');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (e: any) {
        setErrorMsg(e.message || 'সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      } finally {
        setSaving(false);
      }
    },
    [form, onSave]
  );

  // ── Section Handlers ───────────────────────────────────────────────────────

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection((prev.sections || []).length + 1)],
    }));
  };

  const removeSection = (idx: number) => {
    if (!confirm('এই সেকশনটি মুছে দিতে চান?')) return;
    setForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((_, i) => i !== idx),
    }));
  };

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    setForm((prev) => {
      const arr = [...(prev.sections || [])];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...prev, sections: arr };
    });
  };

  const updateSection = (idx: number, updates: Partial<SyllabusSection>) => {
    setForm((prev) => {
      const secs = [...(prev.sections || [])];
      secs[idx] = { ...secs[idx], ...updates };
      return { ...prev, sections: secs };
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── BASIC INFO ── */}
      <div className="bg-white rounded-card border border-brand-border p-5 space-y-4">
        <h3 className="font-bold text-sm text-brand-text border-b border-brand-border pb-2">সিলেবাসের মূল তথ্য</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-brand-text mb-1">শিরোনাম <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="যেমন: কর্মী সিলেবাস"
              className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-text mb-1">ক্যাটাগরি <span className="text-rose-500">*</span></label>
            <select
              value={form.categorySlug || ''}
              onChange={(e) => setField('categorySlug', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            >
              <option value="">ক্যাটাগরি নির্বাচন করুন...</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-brand-text mb-1">সাব-শিরোনাম</label>
            <input
              type="text"
              value={form.subtitle || ''}
              onChange={(e) => setField('subtitle', e.target.value)}
              placeholder="সংক্ষিপ্ত বিবরণ"
              className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-brand-text mb-1">বিবরণ</label>
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="সিলেবাসের উদ্দেশ্য ও প্রেক্ষাপট বর্ণনা করুন..."
              className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-brand-text mb-1">নোটিশ / ভূমিকাবাক্য</label>
            <textarea
              rows={2}
              value={form.notice || ''}
              onChange={(e) => setField('notice', e.target.value)}
              placeholder="সিলেবাসের উপর একটি বিশেষ বার্তা বা আয়াত..."
              className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-text mb-1">ডাউনলোড URL (সম্পূর্ণ সিলেবাস)</label>
            <input
              type="url"
              value={form.downloadUrl || ''}
              onChange={(e) => setField('downloadUrl', e.target.value)}
              placeholder="https://..."
              className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${form.downloadUrl && !isValidUrl(form.downloadUrl) ? 'border-rose-400' : 'border-brand-border'}`}
            />
            {form.downloadUrl && !isValidUrl(form.downloadUrl) && (
              <p className="text-rose-600 text-xs mt-1">সঠিক https:// লিংক দিন</p>
            )}
          </div>

          <div>
            <label className="block font-bold text-brand-text mb-1">ব্যানার ছবির URL</label>
            <input
              type="url"
              value={form.bannerUrl || ''}
              onChange={(e) => setField('bannerUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-text mb-1">সর্বশেষ আপডেট তারিখ</label>
            <input
              type="text"
              value={form.lastUpdated || ''}
              onChange={(e) => setField('lastUpdated', e.target.value)}
              placeholder="যেমন: ২০২৬-০১-১৫"
              className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── SECTIONS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-brand-text flex items-center gap-2">
            <List className="w-4 h-4 text-primary" />
            সেকশনসমূহ ({form.sections?.length || 0}টি)
          </h3>
          <button
            type="button"
            onClick={addSection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition"
          >
            <Plus className="w-4 h-4" />
            নতুন সেকশন
          </button>
        </div>

        {(form.sections || []).map((section, idx) => (
          <SectionEditor
            key={section.id}
            section={section}
            index={idx}
            total={(form.sections || []).length}
            onUpdate={(updates) => updateSection(idx, updates)}
            onRemove={() => removeSection(idx)}
            onMove={(dir) => moveSection(idx, dir)}
          />
        ))}

        {(form.sections || []).length === 0 && (
          <div className="text-center py-8 bg-white rounded-card border border-dashed border-brand-border text-brand-muted text-sm">
            "নতুন সেকশন" বোতাম দিয়ে সিলেবাসে বিষয় যোগ করুন।
          </div>
        )}
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-brand-border text-brand-text text-sm font-semibold hover:bg-gray-50 transition"
          disabled={saving}
        >
          বাতিল
        </button>
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400 text-amber-700 bg-amber-50 text-sm font-bold hover:bg-amber-100 transition"
        >
          <Save className="w-4 h-4" />
          ড্রাফট হিসেবে সংরক্ষণ
        </button>
        <button
          type="button"
          onClick={() => handleSave('published')}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm transition"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          প্রকাশ করুন
        </button>
      </div>
    </div>
  );
};

// ─── Section Editor ───────────────────────────────────────────────────────────

interface SectionEditorProps {
  section: SyllabusSection;
  index: number;
  total: number;
  onUpdate: (updates: Partial<SyllabusSection>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section, index, total, onUpdate, onRemove, onMove,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const addGroup = () => {
    onUpdate({
      resourceGroups: [...section.resourceGroups, newGroup(section.resourceGroups.length + 1)],
    });
  };

  const removeGroup = (gIdx: number) => {
    if (!confirm('এই গ্রুপটি মুছে দিতে চান?')) return;
    onUpdate({ resourceGroups: section.resourceGroups.filter((_, i) => i !== gIdx) });
  };

  const updateGroup = (gIdx: number, updates: Partial<SyllabusResourceGroup>) => {
    const groups = [...section.resourceGroups];
    groups[gIdx] = { ...groups[gIdx], ...updates };
    onUpdate({ resourceGroups: groups });
  };

  const moveGroup = (gIdx: number, dir: 'up' | 'down') => {
    const arr = [...section.resourceGroups];
    const target = dir === 'up' ? gIdx - 1 : gIdx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[gIdx], arr[target]] = [arr[target], arr[gIdx]];
    onUpdate({ resourceGroups: arr });
  };

  const updateObjective = (oIdx: number, val: string) => {
    const objs = [...section.objectives];
    objs[oIdx] = val;
    onUpdate({ objectives: objs });
  };

  const addObjective = () => {
    onUpdate({ objectives: [...section.objectives, ''] });
  };

  const removeObjective = (oIdx: number) => {
    onUpdate({ objectives: section.objectives.filter((_, i) => i !== oIdx) });
  };

  return (
    <div className="bg-white rounded-card border border-brand-border overflow-hidden">
      {/* Section header */}
      <div className="bg-primary-soft/40 px-4 py-3 flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-brand-muted shrink-0" />
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0">
          {index + 1}
        </span>
        <span className="text-sm font-bold text-brand-text flex-1 truncate">
          {section.title || '(শিরোনামহীন সেকশন)'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 rounded hover:bg-primary/10 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-primary/10 disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded hover:bg-primary/10 text-xs font-bold text-primary"
          >
            {collapsed ? 'খুলুন' : 'বন্ধ করুন'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded hover:bg-rose-50 text-rose-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4 text-xs">
          {/* Title & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-brand-text mb-1">সেকশন শিরোনাম <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="যেমন: আল কুরআন"
                className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-brand-text mb-1">সংক্ষিপ্ত বিবরণ</label>
              <input
                type="text"
                value={section.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="ঐচ্ছিক"
                className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-brand-text flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                শিক্ষণ উদ্দেশ্য
              </label>
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center gap-1 text-primary hover:text-primary-hover text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> যোগ করুন
              </button>
            </div>
            <div className="space-y-2">
              {section.objectives.map((obj, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => updateObjective(oIdx, e.target.value)}
                    placeholder="শিক্ষণ উদ্দেশ্য লিখুন..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(oIdx)}
                    className="p-1 rounded hover:bg-rose-50 text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Study Instructions & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-brand-text mb-1">অধ্যয়ন নির্দেশনা</label>
              <textarea
                rows={2}
                value={section.studyInstructions || ''}
                onChange={(e) => onUpdate({ studyInstructions: e.target.value })}
                placeholder="ঐচ্ছিক..."
                className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block font-bold text-brand-text mb-1">টীকা</label>
              <textarea
                rows={2}
                value={section.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="ঐচ্ছিক..."
                className="w-full px-3 py-2 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 text-sm resize-none"
              />
            </div>
          </div>

          {/* Resource Groups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-brand-text flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                রিসোর্স গ্রুপ ({section.resourceGroups.length}টি)
              </label>
              <button
                type="button"
                onClick={addGroup}
                className="flex items-center gap-1 text-primary hover:text-primary-hover text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> নতুন গ্রুপ
              </button>
            </div>

            <div className="space-y-3">
              {section.resourceGroups.map((group, gIdx) => (
                <ResourceGroupEditor
                  key={group.id}
                  group={group}
                  index={gIdx}
                  total={section.resourceGroups.length}
                  onUpdate={(u) => updateGroup(gIdx, u)}
                  onRemove={() => removeGroup(gIdx)}
                  onMove={(dir) => moveGroup(gIdx, dir)}
                />
              ))}
              {section.resourceGroups.length === 0 && (
                <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-brand-muted">
                  "নতুন গ্রুপ" দিয়ে পাঠ্যবই তালিকা যোগ করুন।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Resource Group Editor ────────────────────────────────────────────────────

interface ResourceGroupEditorProps {
  group: SyllabusResourceGroup;
  index: number;
  total: number;
  onUpdate: (updates: Partial<SyllabusResourceGroup>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

const ResourceGroupEditor: React.FC<ResourceGroupEditorProps> = ({
  group, index, total, onUpdate, onRemove, onMove,
}) => {
  const addItem = () => {
    onUpdate({ items: [...group.items, newItem(group.items.length + 1)] });
  };

  const removeItem = (iIdx: number) => {
    onUpdate({ items: group.items.filter((_, i) => i !== iIdx) });
  };

  const updateItem = (iIdx: number, updates: Partial<SyllabusResource>) => {
    const items = [...group.items];
    items[iIdx] = { ...items[iIdx], ...updates };
    onUpdate({ items });
  };

  const moveItem = (iIdx: number, dir: 'up' | 'down') => {
    const arr = [...group.items];
    const target = dir === 'up' ? iIdx - 1 : iIdx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[iIdx], arr[target]] = [arr[target], arr[iIdx]];
    onUpdate({ items: arr });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Group Header */}
      <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={group.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="গ্রুপের নাম (যেমন: পাঠ্যবই, অধ্যয়ন)"
            className="flex-1 px-2 py-1 rounded border border-brand-border text-xs focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove('up')} disabled={index === 0} className="p-1 disabled:opacity-30 hover:bg-gray-200 rounded">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => onMove('down')} disabled={index === total - 1} className="p-1 disabled:opacity-30 hover:bg-gray-200 rounded">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={addItem} className="p-1 hover:bg-primary/10 text-primary rounded">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onRemove} className="p-1 hover:bg-rose-50 text-rose-400 rounded">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="p-2 space-y-2">
        {group.items.map((item, iIdx) => (
          <ResourceItemEditor
            key={item.id}
            item={item}
            index={iIdx}
            total={group.items.length}
            onUpdate={(u) => updateItem(iIdx, u)}
            onRemove={() => removeItem(iIdx)}
            onMove={(dir) => moveItem(iIdx, dir)}
          />
        ))}
        {group.items.length === 0 && (
          <div className="text-center py-3 text-brand-muted text-xs">
            "+" বোতাম দিয়ে বই/রিসোর্স যোগ করুন।
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Resource Item Editor ─────────────────────────────────────────────────────

interface ResourceItemEditorProps {
  item: SyllabusResource;
  index: number;
  total: number;
  onUpdate: (updates: Partial<SyllabusResource>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

const ResourceItemEditor: React.FC<ResourceItemEditorProps> = ({
  item, index, total, onUpdate, onRemove, onMove,
}) => {
  const { books } = useLibrary();

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-brand-muted font-bold w-5">{index + 1}.</span>
        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="বই/রিসোর্সের নাম *"
          className="flex-1 px-2 py-1.5 rounded border border-brand-border text-xs focus:ring-2 focus:ring-primary/20"
        />
        <button type="button" onClick={() => onMove('up')} disabled={index === 0} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded">
          <ChevronUp className="w-3 h-3" />
        </button>
        <button type="button" onClick={() => onMove('down')} disabled={index === total - 1} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded">
          <ChevronDown className="w-3 h-3" />
        </button>
        <button type="button" onClick={onRemove} className="p-1 hover:bg-rose-50 text-rose-400 rounded">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-7">
        <input
          type="text"
          value={item.author || ''}
          onChange={(e) => onUpdate({ author: e.target.value })}
          placeholder="লেখক"
          className="px-2 py-1.5 rounded border border-brand-border text-xs focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="text"
          value={item.publisher || ''}
          onChange={(e) => onUpdate({ publisher: e.target.value })}
          placeholder="প্রকাশক"
          className="px-2 py-1.5 rounded border border-brand-border text-xs focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={item.internalBookId || ''}
          onChange={(e) => {
            const chosenId = e.target.value;
            const chosenBook = books.find((b) => b.id === chosenId);
            onUpdate({
              internalBookId: chosenId,
              title: item.title || chosenBook?.title || '',
              author: item.author || chosenBook?.author || '',
            });
          }}
          className="px-2 py-1.5 rounded border border-brand-border text-xs focus:ring-2 focus:ring-primary/20 bg-white"
        >
          <option value="">-- লাইব্রেরি বই লিংক (ঐচ্ছিক) --</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={item.externalUrl || ''}
          onChange={(e) => onUpdate({ externalUrl: e.target.value })}
          placeholder="অনলাইন পড়ার লিংক (https://...)"
          className={`px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-primary/20 col-span-2 ${item.externalUrl && !isValidUrl(item.externalUrl) ? 'border-rose-400' : 'border-brand-border'}`}
        />
        <input
          type="url"
          value={item.downloadUrl || ''}
          onChange={(e) => onUpdate({ downloadUrl: e.target.value })}
          placeholder="সরাসরি PDF / ডাউনলোড লিংক (ঐচ্ছিক)"
          className="px-2 py-1.5 rounded border border-brand-border text-xs focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="pl-7">
        <input
          type="text"
          value={item.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)"
          className="w-full px-2 py-1.5 rounded border border-brand-border text-xs focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};
