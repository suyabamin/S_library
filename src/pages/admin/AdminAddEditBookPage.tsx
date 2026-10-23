import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import {
  Upload,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { storageService } from '../../lib/storage';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const AdminAddEditBookPage: React.FC = () => {
  const { categories, addBook } = useLibrary();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'quran');
  const [syllabusType, setSyllabusType] = useState('রেগুলার সিলেবাস');
  const [description, setDescription] = useState('');
  const [publicationInfo, setPublicationInfo] = useState('');
  const [language, setLanguage] = useState('বাংলা');
  const [totalCopies, setTotalCopies] = useState<number>(3);
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [featured, setFeatured] = useState(false);

  // File Upload State
  const [coverPreview, setCoverPreview] = useState<string>('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop');
  const [pdfFileName, setPdfFileName] = useState<string>('sample-book.pdf');
  const [pdfUrl, setPdfUrl] = useState<string>('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `books/covers/${Date.now()}_${safeName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          console.warn('Cover upload fallback:', error);
          setUploadingCover(false);
          const fallbackUrl = URL.createObjectURL(file);
          setCoverPreview(fallbackUrl);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setCoverPreview(downloadUrl);
          setUploadingCover(false);
        }
      );
    } catch {
      setUploadingCover(false);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setUploadingPdf(true);
    setUploadProgress(15);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `books/pdfs/${Date.now()}_${safeName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.warn('PDF upload fallback:', error);
          setUploadingPdf(false);
          const fallbackUrl = storageService.resolveUrl(`pdfs/${safeName}`);
          setPdfUrl(fallbackUrl);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setPdfUrl(downloadUrl);
          setUploadingPdf(false);
          setUploadProgress(100);
        }
      );
    } catch {
      setUploadingPdf(false);
      setPdfUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    const cat = categories.find((c) => c.id === categoryId);

    addBook({
      title: title.trim(),
      author: author.trim() || undefined,
      categoryId,
      categoryName: cat?.nameBn || 'সিলেবাস',
      description: description.trim(),
      publicationInfo: publicationInfo.trim() || undefined,
      language,
      coverImage: coverPreview,
      pdfUrl: pdfUrl,
      downloadAllowed,
      featured,
      status: 'published',
      isPhysicalAvailable: totalCopies > 0,
      totalPhysicalCopies: totalCopies,
      availablePhysicalCopies: totalCopies,
      fileSizeMb: 4.5,
      pageCount: 320,
    });

    setSubmitting(false);
    setSuccessMessage(true);
    setTimeout(() => {
      navigate('/admin/books');
    }, 1500);
  };

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 sm:p-8 card-shadow space-y-6">
        {/* Tabs matching Reference Screen */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === 'add'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              বই যোগ করুন
            </button>
            <button
              onClick={() => navigate('/admin/books')}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-brand-muted hover:text-brand-text transition"
            >
              বই তালিকা
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>নতুন বইটি লাইব্রেরিতে সফলভাবে যুক্ত হয়েছে! ক্যাটালগে স্থানান্তর করা হচ্ছে...</span>
          </div>
        )}

        {/* Add Book Form matching Reference Screen */}
        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                বইয়ের নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: তাফসীর ইবনে কাসীর"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                লেখকের নাম
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="যেমন: ইমাদ ইবনে কাসীর"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                ক্যাটাগরি <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameBn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                বইয়ের ধরন
              </label>
              <input
                type="text"
                value={syllabusType}
                onChange={(e) => setSyllabusType(e.target.value)}
                placeholder="যেমন: মৌলিক সিলেবাস / সাধারণ"
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                ফিজিক্যাল কপি সংখ্যা
              </label>
              <input
                type="number"
                min={0}
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              বিবরণ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="বইয়ের বিষয়বস্তু, সারসংক্ষেপ ও প্রাসঙ্গিক তথ্য লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          {/* Upload Drag & Drop Boxes matching Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cover Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-text">
                কভার ছবি <span className="text-rose-500">*</span>
              </label>
              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center hover:bg-emerald-50/30 transition flex flex-col items-center justify-center min-h-[160px] relative">
                {uploadingCover ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-primary">কভার ছবি আপলোড হচ্ছে...</p>
                  </div>
                ) : coverPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={coverPreview}
                      alt="কভার প্রিভিউ"
                      className="w-16 h-22 object-cover rounded shadow border"
                    />
                    <div className="text-left text-xs">
                      <p className="font-bold text-brand-text">কভার সিলেক্ট করা হয়েছে</p>
                      <label className="text-primary hover:underline font-bold cursor-pointer mt-1 block">
                        ছবি পরিবর্তন করুন
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs font-bold text-brand-text">ছবি আপলোড করুন</p>
                    <p className="text-[11px] text-brand-muted">Max 50MB (JPG, PNG)</p>
                    <label className="mt-2 px-3 py-1 bg-white border border-brand-border rounded text-xs font-semibold cursor-pointer hover:bg-gray-50">
                      ফাইল বেছে নিন
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
              <input
                type="text"
                value={coverPreview}
                onChange={(e) => setCoverPreview(e.target.value)}
                placeholder="অথবা কভার ছবির সরাসরি URL দিন"
                className="w-full px-3 py-1.5 rounded-lg border border-brand-border text-xs focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* PDF Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-text">
                PDF ফাইল <span className="text-rose-500">*</span>
              </label>
              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center hover:bg-emerald-50/30 transition flex flex-col items-center justify-center min-h-[160px] relative">
                {uploadingPdf ? (
                  <div className="space-y-2 w-full max-w-[200px]">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-primary">পিডিএফ আপলোড হচ্ছে ({uploadProgress}%)...</p>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs font-bold text-brand-text">
                      {pdfFileName ? pdfFileName : 'পিডিএফ আপলোড করুন'}
                    </p>
                    <p className="text-[11px] text-brand-muted">Max 50MB (Cloudflare R2 / Firebase স্টোরেজ)</p>
                    <label className="mt-2 px-3 py-1 bg-white border border-brand-border rounded text-xs font-semibold cursor-pointer hover:bg-gray-50">
                      ফাইল সিলেক্ট করুন
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="অথবা সরাসরি PDF / Cloudflare R2 লিংক দিন"
                className="w-full px-3 py-1.5 rounded-lg border border-brand-border text-xs focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-text">
              <input
                type="checkbox"
                checked={downloadAllowed}
                onChange={(e) => setDownloadAllowed(e.target.checked)}
                className="rounded border-brand-border text-primary focus:ring-primary/20"
              />
              <span>পাঠকদের জন্য সরাসরি ডাউনলোড উন্মুক্ত রাখুন</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-text">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-brand-border text-primary focus:ring-primary/20"
              />
              <span>হোমপেজে ফিচার্ড / নির্বাচিত বই হিসেবে দেখান</span>
            </label>
          </div>

          <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              className="px-5 py-2.5 rounded-lg border border-brand-border font-semibold text-brand-text hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
};
