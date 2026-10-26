import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ArrowLeft,
  BookOpen,
  LayoutGrid,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { Book } from '../../types';
import { toBengaliNumber } from '../../lib/utils';
import { storageService } from '../../lib/storage';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfReaderProps {
  book: Book;
}

export const PdfReader: React.FC<PdfReaderProps> = ({ book }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(book.pageCount || 1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const rawPdf = book.pdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
    const pdfUrl = storageService.resolveUrl(rawPdf);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/cmaps/',
      cMapPacked: true,
    });

    loadingTask.promise
      .then((loadedPdf) => {
        if (!isMounted) return;
        setPdfDoc(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('PDF.js loading fallback triggered:', err);
        // Soft fallback for demo or CORS-restricted URLs
        setLoading(false);
        setError(null);
      });

    return () => {
      isMounted = false;
      loadingTask.destroy?.();
    };
  }, [book.pdfUrl]);

  // Render Page on Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isRendering = true;
    pdfDoc.getPage(currentPage).then((page) => {
      if (!isRendering) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const viewport = page.getViewport({ scale: zoom * 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      page.render(renderContext).promise.catch(() => {});
    });

    return () => {
      isRendering = false;
    };
  }, [pdfDoc, currentPage, zoom]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6));
  const handleFitWidth = () => setZoom(1.0);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-[#1F2937] text-white overflow-hidden">
      {/* Top Header & Reader Toolbar matching Reference Screen */}
      <header className="h-14 bg-[#111827] border-b border-gray-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            title="ফিরে যান"
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/assets/logo.webp" alt="লোগো" className="w-6 h-6 object-contain" />
            <h1 className="text-sm font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-md">
              {book.title}
            </h1>
          </div>
        </div>

        {/* Page Nav Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono bg-gray-800 px-2.5 py-1 rounded">
            {toBengaliNumber(currentPage)} / {toBengaliNumber(totalPages)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Utility Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="পৃষ্ঠা প্রিভিউ"
            className={`p-1.5 rounded hover:bg-gray-800 ${showThumbnails ? 'text-primary' : 'text-gray-400'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            title="জুম আউট"
            className="p-1.5 rounded hover:bg-gray-800 text-gray-300"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono hidden sm:inline-block w-12 text-center text-gray-400">
            {toBengaliNumber(Math.round(zoom * 100))}%
          </span>
          <button
            onClick={handleZoomIn}
            title="জুম ইন"
            className="p-1.5 rounded hover:bg-gray-800 text-gray-300"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="ফুলস্ক্রিন"
            className="p-1.5 rounded hover:bg-gray-800 text-gray-300 hidden sm:inline-flex"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <a
            href={storageService.resolveUrl(book.pdfUrl) || '#'}
            target="_blank"
            rel="noreferrer"
            title="ব্রাউজারে সরাসরি পিডিএফ খুলুন"
            className="p-1.5 rounded hover:bg-gray-800 text-gray-300 transition"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {book.downloadAllowed && (
            <a
              href={storageService.resolveUrl(book.pdfUrl) || '#'}
              download={`${book.title}.pdf`}
              target="_blank"
              rel="noreferrer"
              title="পিডিএফ ডাউনলোড করুন"
              className="p-1.5 rounded bg-primary text-white hover:bg-primary-hover transition ml-1"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
      </header>

      {/* Main Reader Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnail Drawer */}
        {showThumbnails && (
          <aside className="w-48 bg-[#182234] border-r border-gray-800 overflow-y-auto p-3 space-y-3 hidden md:block shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              পৃষ্ঠাসমূহ ({toBengaliNumber(totalPages)})
            </p>
            {Array.from({ length: Math.min(totalPages, 30) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-full p-2 rounded border text-center transition flex flex-col items-center ${
                  currentPage === pg
                    ? 'border-primary bg-primary-950/40 text-emerald-300 font-bold'
                    : 'border-gray-800 bg-[#1F2937] text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="w-24 h-32 bg-white rounded shadow-inner mb-1.5 flex flex-col items-center justify-center p-2 text-gray-800">
                  <span className="text-[10px] font-bold text-gray-500 line-clamp-1">{book.title}</span>
                  <div className="w-16 h-0.5 bg-gray-200 my-1" />
                  <div className="w-12 h-0.5 bg-gray-200 mb-1" />
                  <span className="text-xs font-mono font-bold text-emerald-800 mt-2">{pg}</span>
                </div>
                <span className="text-xs">পৃষ্ঠা {toBengaliNumber(pg)}</span>
              </button>
            ))}
          </aside>
        )}

        {/* Center Canvas / Viewer Area */}
        <main className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#2B3544]">
          {loading ? (
            <div className="text-center text-gray-300">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm">পিডিএফ লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
            </div>
          ) : pdfDoc ? (
            <div className="shadow-2xl rounded-sm bg-white overflow-hidden my-auto">
              <canvas ref={canvasRef} className="max-w-full h-auto block" />
            </div>
          ) : (
            /* Fallback Clean Reading View with Bengali Typography matching reference */
            <div className="max-w-2xl w-full bg-white text-gray-900 rounded-lg shadow-2xl p-8 sm:p-12 my-auto font-bengali">
              <div className="text-center border-b border-gray-200 pb-6 mb-6">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  {book.categoryName} • ডিজিটাল রিডার
                </span>
                <h2 className="text-2xl font-bold mt-2 text-gray-900">{book.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{book.author || 'লেখক অনুল্লেখিত'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{book.publicationInfo}</p>
              </div>

              <div className="prose max-w-none text-gray-800 text-base leading-relaxed space-y-4">
                <p className="font-semibold text-lg text-emerald-900">
                  বিসমিল্লাহির রাহমানির রাহিম
                </p>
                <p>{book.description}</p>
                <p>
                  পবিত্র কুরআনের আয়াত ও সহীহ সুন্নাহর আলোকে এই গ্রন্থটি দ্বীনের মৌলিক জ্ঞানার্জনে অনন্য ভূমিকা পালন করে। শিক্ষার্থী ও পাঠকদের সুবিধার জন্য শিবির লাইব্রেরি UIU থানা শাখার অধীনে এই বইটি সংরক্ষিত রয়েছে।
                </p>
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                  <p className="font-bold mb-1">পাঠকের প্রতি দৃষ্টি আকর্ষণ:</p>
                  <p>
                    আপনি চাইলে এই বইটি অনলাইনে পড়তে পারেন অথবা লাইব্রেরি থেকে সরাসরি ফিজিক্যাল হার্ড কপিও ধার নিতে পারেন।
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>শিবির লাইব্রেরি, UIU থানা</span>
                <span>পৃষ্ঠা: {toBengaliNumber(currentPage)} / {toBengaliNumber(totalPages)}</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
