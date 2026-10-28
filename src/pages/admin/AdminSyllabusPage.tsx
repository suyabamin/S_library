import React, { useState } from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { SyllabusEditor } from '../../components/syllabus/SyllabusEditor';
import { useSyllabus } from '../../context/SyllabusContext';
import { Syllabus } from '../../types';
import {
  BookMarked, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, AlertTriangle, X, FileText,
} from 'lucide-react';

type AdminView = 'list' | 'create' | 'edit';

export const AdminSyllabusPage: React.FC = () => {
  const { syllabuses, saveSyllabus, deleteSyllabus, togglePublishStatus, loading } = useSyllabus();
  const [view, setView] = useState<AdminView>('list');
  const [editTarget, setEditTarget] = useState<Syllabus | undefined>(undefined);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (data: Partial<Syllabus>): Promise<Syllabus> => {
    const result = await saveSyllabus(data);
    setSuccessMsg('সিলেবাস সফলভাবে সংরক্ষিত হয়েছে।');
    setTimeout(() => setSuccessMsg(null), 3000);
    return result;
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" সিলেবাসটি স্থায়ীভাবে মুছে দিতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`)) {
      return;
    }
    try {
      await deleteSyllabus(id);
      setSuccessMsg('সিলেবাস সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const handleTogglePublish = async (syl: Syllabus) => {
    try {
      await togglePublishStatus(syl.id);
      const nextStatus = syl.status === 'published' ? 'ড্রাফট' : 'প্রকাশিত';
      setSuccessMsg(`সিলেবাসটি এখন "${nextStatus}" অবস্থায় রয়েছে।`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleEditClick = (syl: Syllabus) => {
    setEditTarget(syl);
    setView('edit');
  };

  const handleCreateClick = () => {
    setEditTarget(undefined);
    setView('create');
  };

  const handleCancel = () => {
    setEditTarget(undefined);
    setView('list');
  };

  const allSyllabuses = [...syllabuses].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  );

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border card-shadow">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-brand-border gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-primary" />
              সিলেবাস ব্যবস্থাপনা
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              সকল সিলেবাস দেখুন, তৈরি করুন, সম্পাদনা করুন ও প্রকাশ করুন
            </p>
          </div>

          {view === 'list' && (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm self-start"
            >
              <Plus className="w-4 h-4" />
              নতুন সিলেবাস
            </button>
          )}

          {view !== 'list' && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-border text-brand-text text-sm font-semibold hover:bg-gray-50 self-start"
            >
              <X className="w-4 h-4" />
              তালিকায় ফিরুন
            </button>
          )}
        </div>

        {/* Notifications */}
        {(successMsg || errorMsg) && (
          <div className="px-5 pt-4">
            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm mb-3">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{successMsg}</span>
                <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm mb-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)}><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* CREATE / EDIT VIEW */}
          {(view === 'create' || view === 'edit') && (
            <SyllabusEditor
              initialSyllabus={editTarget}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-12 text-brand-muted text-sm">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  লোড হচ্ছে...
                </div>
              )}

              {!loading && allSyllabuses.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-brand-muted mx-auto mb-3 opacity-40" />
                  <p className="text-brand-muted text-sm">কোনো সিলেবাস নেই।</p>
                  <button
                    onClick={handleCreateClick}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover"
                  >
                    প্রথম সিলেবাস তৈরি করুন
                  </button>
                </div>
              )}

              {!loading && allSyllabuses.map((syl) => (
                <div
                  key={syl.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-brand-border hover:border-primary/30 hover:bg-primary-soft/20 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-brand-text truncate">{syl.title}</h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          syl.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {syl.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-0.5">
                      ক্যাটাগরি: {syl.categorySlug} •{' '}
                      {syl.sections.length}টি সেকশন •{' '}
                      আপডেট: {new Date(syl.updatedAt).toLocaleDateString('bn-BD')}
                    </p>
                    {syl.subtitle && (
                      <p className="text-xs text-brand-text/60 mt-0.5 line-clamp-1">{syl.subtitle}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <a
                      href={`/categories/${syl.categorySlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-brand-border hover:bg-gray-50 text-brand-text transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      প্রিভিউ
                    </a>

                    <button
                      onClick={() => handleTogglePublish(syl)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        syl.status === 'published'
                          ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {syl.status === 'published' ? (
                        <><EyeOff className="w-3.5 h-3.5" /> আনপাবলিশ</>
                      ) : (
                        <><Eye className="w-3.5 h-3.5" /> প্রকাশ করুন</>
                      )}
                    </button>

                    <button
                      onClick={() => handleEditClick(syl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-brand-border hover:bg-gray-50 text-brand-text transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      সম্পাদনা
                    </button>

                    <button
                      onClick={() => handleDelete(syl.id, syl.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      মুছুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};
