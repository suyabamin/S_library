import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { useLibrary } from '../../context/LibraryContext';
import { isValidUrl } from '../../lib/syllabusValidation';
import {
  Upload,
  BookOpen,
  CheckCircle2,
  FileText,
  Link2,
  Globe,
  Library,
  AlertCircle,
} from 'lucide-react';
import { BookSourceType } from '../../types';

export const AdminAddEditBookPage: React.FC = () => {
  const { categories, books, addBook, updateBook, getBookById } = useLibrary();
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId?: string }>();
  const isEdit = Boolean(bookId);

  // Creation mode: 'upload' (default PDF upload) or 'url' (Add Book by URL)
  const [entryMode, setEntryMode] = useState<'upload' | 'url'>('upload');
  const [urlSubtype, setUrlSubtype] = useState<'external_page' | 'external_pdf' | 'internal_book'>('external_page');

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

  // URL Mode States
  const [externalUrl, setExternalUrl] = useState('');
  const [internalBookId, setInternalBookId] = useState('');

  // File Upload State
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Load existing book data in Edit Mode
  useEffect(() => {
    if (bookId) {
      const existing = getBookById(bookId);
      if (existing) {
        setTitle(existing.title || '');
        setAuthor(existing.author || '');
        setCategoryId(existing.categoryId || categories[0]?.id || 'quran');
        setDescription(existing.description || '');
        setPublicationInfo(existing.publicationInfo || '');
        setLanguage(existing.language || 'বাংলা');
        setTotalCopies(existing.totalPhysicalCopies ?? 3);
        setDownloadAllowed(existing.downloadAllowed ?? true);
        setFeatured(existing.featured ?? false);
        setCoverPreview(existing.coverImage || '');
        setPdfUrl(existing.pdfUrl || '');
        setExternalUrl(existing.externalUrl || '');
        setInternalBookId(existing.internalBookId || '');

        if (existing.sourceType === 'external_page') {
          setEntryMode('url');
          setUrlSubtype('external_page');
        } else if (existing.sourceType === 'external_pdf') {
          setEntryMode('url');
          setUrlSubtype('external_pdf');
        } else if (existing.sourceType === 'internal_book') {
          setEntryMode('url');
          setUrlSubtype('internal_book');
        } else {
          setEntryMode('upload');
        }

        if (existing.pdfUrl) {
          const parts = existing.pdfUrl.split('/');
          setPdfFileName(decodeURIComponent(parts[parts.length - 1] || 'সংরক্ষিত পিডিএফ'));
        }
      }
    }
  }, [bookId, getBookById, categories]);

  // Robust direct upload to Cloudflare R2:
  // First attempts presigned PUT upload (handles up to 50MB, avoids server payload limits)
  // Falls back to streaming /api/upload
  const uploadFileToR2 = async (
    file: File,
    folder: 'covers' | 'pdfs',
    onProgress: (pct: number) => void
  ): Promise<string> => {
    // 1. Try presigned PUT upload
    try {
      const presignEndpoints = ['/api/presign', '/api/storage/presigned-upload'];
      let presignData: any = null;

      for (const endpoint of presignEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type || (folder === 'pdfs' ? 'application/pdf' : 'image/jpeg'),
              folder,
            }),
          });
          if (res.ok) {
            presignData = await res.json();
            if (presignData?.uploadUrl && presignData?.publicUrl) {
              break;
            }
          }
        } catch {
          // try next endpoint
        }
      }

      if (presignData?.uploadUrl && presignData?.publicUrl) {
        return await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', presignData.uploadUrl, true);
          xhr.setRequestHeader('Content-Type', file.type || (folder === 'pdfs' ? 'application/pdf' : 'image/jpeg'));

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(presignData.publicUrl);
            } else {
              reject(new Error(`Direct storage upload status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during direct storage upload'));
          xhr.ontimeout = () => reject(new Error('Storage upload timed out'));
          xhr.timeout = 180000;

          xhr.send(file);
        });
      }
    } catch (presignErr) {
      console.warn('Presigned upload failed, falling back to streaming endpoint:', presignErr);
    }

    // 2. Fallback to streaming upload
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('x-filename', encodeURIComponent(file.name));
      xhr.setRequestHeader('x-folder', folder);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) {
              resolve(data.url);
              return;
            }
          } catch {
            // parse error
          }
        }
        reject(new Error(`Upload failed with status ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.ontimeout = () => reject(new Error('Upload timed out'));
      xhr.timeout = 180000;

      xhr.send(file);
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) আপলোড করুন।');
      return;
    }

    // Temporary preview for instant UX
    const blobUrl = URL.createObjectURL(file);
    setCoverPreview(blobUrl);
    setUploadingCover(true);

    try {
      const permanentUrl = await uploadFileToR2(file, 'covers', () => {});
      if (permanentUrl) {
        URL.revokeObjectURL(blobUrl);
        setCoverPreview(permanentUrl);
      } else {
        throw new Error('সার্ভার থেকে সঠিক লিংক পাওয়া যায়নি');
      }
    } catch (err: any) {
      console.error('Cover upload to R2 failed:', err);
      URL.revokeObjectURL(blobUrl);
      setCoverPreview('');
      alert(`কভার ছবি আপলোড ব্যর্থ হয়েছে: ${err.message || 'নেটওয়ার্ক বা সার্ভার সমস্যা'}। দয়া করে পুনরায় চেষ্টা করুন।`);
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('অনুগ্রহ করে শুধুমাত্র PDF ফাইল আপলোড করুন।');
      return;
    }

    setPdfFileName(file.name);
    setUploadingPdf(true);
    setUploadProgress(5);
    setPdfUrl(''); // Invalidate previous URL until upload completes

    try {
      const permanentUrl = await uploadFileToR2(file, 'pdfs', (pct) => {
        setUploadProgress(Math.max(5, pct));
      });
      if (!permanentUrl || !permanentUrl.startsWith('http')) {
        throw new Error('সার্ভার থেকে স্থায়ী পিডিএফ লিংক পাওয়া যায়নি');
      }
      setPdfUrl(permanentUrl);
      setUploadProgress(100);
    } catch (err: any) {
      console.error('PDF upload error:', err);
      setPdfUrl('');
      setPdfFileName('');
      setUploadProgress(0);
      alert(`পিডিএফ ফাইল আপলোড ব্যর্থ হয়েছে: ${err.message || 'সার্ভার সমস্যা'}। ফাইলটি সঠিকভাবে আপলোড হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।`);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-side field validations with clear Bengali error alerts
    if (!title.trim()) {
      alert('অনুগ্রহ করে বইয়ের নাম প্রদান করুন');
      return;
    }

    if (!author.trim()) {
      alert('অনুগ্রহ করে লেখকের নাম প্রদান করুন');
      return;
    }

    if (uploadingPdf || uploadingCover) {
      alert('ফাইল আপলোড এখনও সম্পন্ন হয়নি, অনুগ্রহ করে অপেক্ষা করুন...');
      return;
    }

    let finalSourceType: BookSourceType = 'uploaded_pdf';
    let finalPdfUrl = pdfUrl.trim();
    let finalExternalUrl = externalUrl.trim();
    let finalInternalBookId = internalBookId.trim();

    if (entryMode === 'url') {
      if (urlSubtype === 'external_page') {
        finalSourceType = 'external_page';
        if (!finalExternalUrl) {
          alert('অনুগ্রহ করে বই বা পড়ার ওয়েব পেজের সরাসরি লিংক (URL) দিন।');
          return;
        }
        if (!isValidUrl(finalExternalUrl)) {
          alert('প্রদত্ত ওয়েব লিংকটি একটি সঠিক ও নিরাপদ URL (https://) হতে হবে।');
          return;
        }
        finalPdfUrl = finalExternalUrl; // Safe fallback so any reader view still gets the link
      } else if (urlSubtype === 'external_pdf') {
        finalSourceType = 'external_pdf';
        if (!finalPdfUrl) {
          alert('অনুগ্রহ করে সরাসরি পিডিএফ ফাইলের লিংক (URL) দিন।');
          return;
        }
        if (!isValidUrl(finalPdfUrl)) {
          alert('প্রদত্ত পিডিএফ লিংকটি একটি সঠিক ও নিরাপদ URL (https://) হতে হবে।');
          return;
        }
      } else if (urlSubtype === 'internal_book') {
        finalSourceType = 'internal_book';
        if (!finalInternalBookId) {
          alert('অনুগ্রহ করে লাইব্রেরির বিদ্যমান বই নির্বাচন করুন।');
          return;
        }
        const targetBook = books.find((b) => b.id === finalInternalBookId);
        if (targetBook) {
          finalPdfUrl = targetBook.pdfUrl || '';
        }
      }
    } else {
      // PDF Upload mode
      finalSourceType = 'uploaded_pdf';
      if (!finalPdfUrl || finalPdfUrl.startsWith('blob:') || finalPdfUrl.startsWith('data:')) {
        alert('অনুগ্রহ করে একটি বৈধ পিডিএফ ফাইল আপলোড সম্পন্ন হওয়া নিশ্চিত করুন অথবা সরাসরি ক্লাউড লিংক প্রদান করুন।');
        return;
      }
    }

    if (coverPreview && coverPreview.startsWith('blob:')) {
      alert('কভার ছবি আপলোড এখনও চলমান বা অসম্পূর্ণ। অনুগ্রহ করে আপলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const cat = categories.find((c) => c.id === categoryId);

      const payload = {
        title: title.trim(),
        author: author.trim(),
        categoryId,
        categoryName: cat?.nameBn || 'সিলেবাস',
        description: description.trim(),
        publicationInfo: publicationInfo.trim() || undefined,
        language,
        coverImage: coverPreview.trim() || undefined,
        pdfUrl: finalPdfUrl,
        sourceType: finalSourceType,
        externalUrl: finalExternalUrl || undefined,
        internalBookId: finalInternalBookId || undefined,
        downloadAllowed,
        featured,
        status: 'published' as const,
        isPhysicalAvailable: totalCopies > 0,
        totalPhysicalCopies: totalCopies,
        availablePhysicalCopies: totalCopies,
        fileSizeMb: finalSourceType === 'uploaded_pdf' ? 4.5 : undefined,
        pageCount: 320,
      };

      if (isEdit && bookId) {
        await updateBook(bookId, payload);
      } else {
        await addBook(payload);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/admin/books');
      }, 1000);
    } catch (err: any) {
      console.error('Save book error:', err);
      alert(`বই সংরক্ষণ করতে ব্যর্থ হয়েছে: ${err.message || 'ডাটাবেজ সমস্যা'}। পুনরায় চেষ্টা করুন।`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 sm:p-8 card-shadow space-y-6">
        {/* Tabs */}
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
              {isEdit ? 'বই সম্পাদনা করুন' : 'বই যোগ করুন'}
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
            <span>{isEdit ? 'বইটির তথ্য সফলভাবে আপডেট হয়েছে!' : 'নতুন বইটি লাইব্রেরিতে সফলভাবে যুক্ত হয়েছে!'} ক্যাটালগে স্থানান্তর করা হচ্ছে...</span>
          </div>
        )}

        {/* Entry Mode Selector: Upload PDF vs Add Book by URL */}
        <div className="bg-brand-bg/50 p-3.5 rounded-xl border border-brand-border space-y-2">
          <label className="block text-xs font-bold text-brand-text">
            বই যুক্ত করার মাধ্যম নির্বাচন করুন:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEntryMode('upload')}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition ${
                entryMode === 'upload'
                  ? 'border-primary bg-primary-soft text-primary font-bold shadow-sm'
                  : 'border-brand-border bg-white text-brand-text hover:bg-gray-50'
              }`}
            >
              <Upload className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold">পিডিএফ ফাইল আপলোড (PDF Upload)</p>
                <p className="text-[11px] text-brand-muted font-normal">ডিভাইস থেকে ক্লাউড স্টোরেজে ফাইল আপলোড করুন</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('url')}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition ${
                entryMode === 'url'
                  ? 'border-primary bg-primary-soft text-primary font-bold shadow-sm'
                  : 'border-brand-border bg-white text-brand-text hover:bg-gray-50'
              }`}
            >
              <Link2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold">লিংক / URL দিয়ে বই যোগ (Add by URL)</p>
                <p className="text-[11px] text-brand-muted font-normal">কোনো ফাইল আপলোড ছাড়া অনলাইন পেজ বা সরাসরি পিডিএফ লিংক দিন</p>
              </div>
            </button>
          </div>
        </div>

        {/* Add/Edit Book Form */}
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
                লেখকের নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
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
              বিবরণ
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="বইয়ের বিষয়বস্তু, সারসংক্ষেপ ও প্রাসঙ্গিক তথ্য লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              প্রকাশনা ও সংস্করণের তথ্য
            </label>
            <input
              type="text"
              value={publicationInfo}
              onChange={(e) => setPublicationInfo(e.target.value)}
              placeholder="যেমন: ইসলামিক ফাউন্ডেশন বাংলাদেশ, ৩য় সংস্করণ"
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          {/* Upload or URL Resource Configuration */}
          {entryMode === 'url' ? (
            <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sky-900">
                <Link2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-sm">URL ভিত্তিক বইয়ের উৎস কনফিগার করুন</h3>
              </div>

              {/* Sub-type radio choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                  urlSubtype === 'external_page'
                    ? 'bg-white border-primary text-primary font-bold shadow-xs'
                    : 'bg-white/60 border-brand-border text-brand-text hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="urlSubtype"
                    value="external_page"
                    checked={urlSubtype === 'external_page'}
                    onChange={() => setUrlSubtype('external_page')}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="block font-bold">অনলাইন পড়ার ওয়েব লিংক</span>
                    <span className="text-[11px] text-brand-muted font-normal">যেমন: icsbook.info বা অন্য যেকোনো বই পড়ার পেজ</span>
                  </div>
                </label>

                <label className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                  urlSubtype === 'external_pdf'
                    ? 'bg-white border-primary text-primary font-bold shadow-xs'
                    : 'bg-white/60 border-brand-border text-brand-text hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="urlSubtype"
                    value="external_pdf"
                    checked={urlSubtype === 'external_pdf'}
                    onChange={() => setUrlSubtype('external_pdf')}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="block font-bold">সরাসরি এক্সটার্নাল PDF URL</span>
                    <span className="text-[11px] text-brand-muted font-normal">ক্লাউড বা বাহ্যিক হোস্টে সংরক্ষিত সরাসরি .pdf লিংক</span>
                  </div>
                </label>

                <label className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                  urlSubtype === 'internal_book'
                    ? 'bg-white border-primary text-primary font-bold shadow-xs'
                    : 'bg-white/60 border-brand-border text-brand-text hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="urlSubtype"
                    value="internal_book"
                    checked={urlSubtype === 'internal_book'}
                    onChange={() => setUrlSubtype('internal_book')}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="block font-bold">লাইব্রেরির সংরক্ষিত বই</span>
                    <span className="text-[11px] text-brand-muted font-normal">বিদ্যমান কোনো বইয়ের সাথে সরাসরি লিংক করুন</span>
                  </div>
                </label>
              </div>

              {/* Dynamic inputs based on subtype */}
              {urlSubtype === 'external_page' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text">
                    অনলাইন পড়ার ওয়েব পেজের লিংক (URL) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://www.icsbook.info/..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                  />
                  <p className="text-[11px] text-brand-muted">
                    পাঠকরা এই বইটিতে ক্লিক করলে সরাসরি এই মূল ওয়েবসাইটে বই পড়ার পেজটি নতুন ট্যাবে নিরাপদভাবে উন্মুক্ত হবে।
                  </p>
                </div>
              )}

              {urlSubtype === 'external_pdf' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text">
                    সরাসরি পিডিএফ ফাইলের লিংক (PDF URL) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/books/sample.pdf"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                  />
                  <p className="text-[11px] text-brand-muted">
                    সিঙ্গেল ক্লিক পিডিএফ ভিউয়ারে লোড হবে, রিমোট সার্ভারের CORS অনুমতি সাপেক্ষে সরাসরি পড়া যাবে।
                  </p>
                </div>
              )}

              {urlSubtype === 'internal_book' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text">
                    বিদ্যমান বই সিলেক্ট করুন <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={internalBookId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setInternalBookId(id);
                      const chosen = books.find((b) => b.id === id);
                      if (chosen && !title) setTitle(chosen.title);
                      if (chosen && !author) setAuthor(chosen.author || '');
                      if (chosen?.coverImage && !coverPreview) setCoverPreview(chosen.coverImage);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                  >
                    <option value="">-- লাইব্রেরি থেকে একটি বই বেছে নিন --</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {b.author || 'অজানা লেখক'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cover Image Input for URL Mode */}
              <div className="pt-2 border-t border-sky-100">
                <label className="block text-xs font-bold text-brand-text mb-1">
                  কভার ছবি (ঐচ্ছিক URL)
                </label>
                <div className="flex gap-3 items-center">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="কভার প্রিভিউ"
                      className="w-12 h-16 object-cover rounded shadow border shrink-0"
                    />
                  )}
                  <input
                    type="url"
                    value={coverPreview}
                    onChange={(e) => setCoverPreview(e.target.value)}
                    placeholder="https://example.com/cover.jpg (বা খালি রাখুন)"
                    className="flex-1 px-3 py-2 rounded-lg border border-brand-border text-xs focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Upload Drag & Drop Boxes (Preserved existing flow) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cover Upload Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-text">
                  কভার ছবি
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
                      <p className="text-[11px] text-brand-muted">Max 50MB</p>
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
          )}

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
              {submitting ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
};
