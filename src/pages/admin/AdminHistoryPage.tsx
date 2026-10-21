import React, { useState } from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { INITIAL_HISTORY_ARTICLES } from '../../lib/seedData';
import { HistoryArticle } from '../../types';
import { ScrollText, Plus, Edit, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react';

export const AdminHistoryPage: React.FC = () => {
  const [articles, setArticles] = useState<HistoryArticle[]>(INITIAL_HISTORY_ARTICLES);
  const [showForm, setShowForm] = useState(false);

  // New Article Form
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('২০২৪');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newArt: HistoryArticle = {
      id: `hist-${Date.now()}`,
      title: title.trim(),
      slug: `history-${Date.now()}`,
      summary: summary.trim(),
      body: body.trim(),
      imageUrls: ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop'],
      featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
      year,
      sources: [{ label: 'শাখা আর্কাইভ', url: '#' }],
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setArticles([newArt, ...articles]);
    setShowForm(false);
    setTitle('');
    setSummary('');
    setBody('');
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি এই ইতিহাস নিবন্ধটি মুছে ফেলতে চান?')) {
      setArticles(articles.filter((a) => a.id !== id));
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" />
              <span>সংগঠনের ইতিহাস CMS</span>
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              UIU শাখা শিবিরের ঐতিহাসিক ঘটনা, বিবরণী ও স্থিরচিত্র প্রকাশনা
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm self-start flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> নতুন নিবন্ধ লিখুন
          </button>
        </div>

        {/* Create History Article Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="p-5 rounded-xl border border-brand-border bg-gray-50/70 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-brand-text">নতুন ঐতিহাসিক নিবন্ধ প্রকাশ করুন</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block font-bold text-brand-text mb-1">শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: ক্যাম্পাসে ছাত্রকল্যাণমূলক কার্যক্রম"
                  className="w-full p-2.5 rounded-lg border border-brand-border bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-text mb-1">বর্ষ / সাল</label>
                <input
                  type="text"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="যেমন: ২০২৪"
                  className="w-full p-2.5 rounded-lg border border-brand-border bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">সারসংক্ষেপ</label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="সংক্ষিপ্ত সারসংক্ষেপ..."
                className="w-full p-2.5 rounded-lg border border-brand-border bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text mb-1">মূল বক্তব্য / পূর্ণ বিবরণ</label>
              <textarea
                rows={4}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="ঐতিহাসিক তথ্য ও বিবরণ লিখুন..."
                className="w-full p-2.5 rounded-lg border border-brand-border bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-brand-border font-semibold hover:bg-gray-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-sm"
              >
                প্রকাশ করুন
              </button>
            </div>
          </form>
        )}

        {/* Articles Table */}
        <div className="overflow-x-auto border border-brand-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="p-3">শিরোনাম</th>
                <th className="p-3">বর্ষ</th>
                <th className="p-3">স্ট্যাটাস</th>
                <th className="p-3 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3">
                    <p className="font-bold text-brand-text">{art.title}</p>
                    <p className="text-[11px] text-brand-muted line-clamp-1">{art.summary}</p>
                  </td>
                  <td className="p-3 font-semibold text-primary">{art.year}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      প্রকাশিত
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1.5 rounded text-rose-600 hover:bg-rose-50"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};
