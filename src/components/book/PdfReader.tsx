import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ArrowLeft,
  LayoutGrid,
  RotateCw,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Book } from '../../types';
import { toBengaliNumber } from '../../lib/utils';
import { storageService } from '../../lib/storage';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to use local production-ready asset first, with reliable CDN fallback
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfReaderProps {
  book: Book;
}

interface PageRenderItemProps {
  pageNumber: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  zoom: number;
}

const PageRenderItem: React.FC<PageRenderItemProps> = React.memo(({ pageNumber, pdfDoc, zoom }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<boolean>(false);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 800,
  });

  // Calculate base dimensions when pdfDoc is ready
  useEffect(() => {
    let active = true;
    pdfDoc.getPage(pageNumber).then((page) => {
      if (!active) return;
      const viewport = page.getViewport({ scale: 1.0 });
      setPageDimensions({ width: viewport.width, height: viewport.height });
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber]);

  // IntersectionObserver for lazy rendering pages as user scrolls
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            // Unload canvas bitmap if far away to conserve memory on mobile
            if (entry.boundingClientRect.top > window.innerHeight * 2 || entry.boundingClientRect.bottom < -window.innerHeight * 2) {
              setIsVisible(false);
              setIsRendered(false);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '400px 0px 400px 0px', // Pre-render 400px before appearing
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Render page when visible
  useEffect(() => {
    if (!isVisible || !pdfDoc) return;
    let cancelRender = false;
    let renderTask: any = null;

    pdfDoc.getPage(pageNumber).then((page) => {
      if (cancelRender) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Hi-DPI scaling for crisp text
      const dpr = window.devicePixelRatio || 1;
      const scale = zoom * 1.5;
      const viewport = page.getViewport({ scale });

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      renderTask = page.render(renderContext);
      renderTask.promise
        .then(() => {
          if (!cancelRender) {
            setIsRendered(true);
            setRenderError(false);
          }
        })
        .catch((err: any) => {
          if (err?.name !== 'RenderingCancelledException' && !cancelRender) {
            console.error(`Page ${pageNumber} render error:`, err);
            setRenderError(true);
          }
        })
        .finally(() => {
          ctx.restore();
        });
    }).catch(() => {
      if (!cancelRender) setRenderError(true);
    });

    return () => {
      cancelRender = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [isVisible, pdfDoc, pageNumber, zoom]);

  const targetWidth = Math.floor(pageDimensions.width * zoom * 1.5);
  const targetHeight = Math.floor(pageDimensions.height * zoom * 1.5);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="relative mx-auto my-4 bg-white shadow-xl rounded-sm transition-all duration-150 flex flex-col items-center justify-center border border-gray-300/40"
      style={{
        width: `${targetWidth}px`,
        maxWidth: '96vw',
        minHeight: `${Math.min(targetHeight, 350)}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        className={`max-w-full h-auto block ${isRendered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      />

      {/* Loading or placeholder indicator while rendering/scrolling */}
      {!isRendered && !renderError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 text-gray-500">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs font-mono font-medium">পৃষ্ঠা {toBengaliNumber(pageNumber)} লোড হচ্ছে...</span>
        </div>
      )}

      {renderError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-rose-600 p-4 text-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <span className="text-xs font-bold">পৃষ্ঠা {toBengaliNumber(pageNumber)} রেন্ডার করা যায়নি</span>
        </div>
      )}

      {/* Page indicator pill at bottom right */}
      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono pointer-events-none">
        {toBengaliNumber(pageNumber)}
      </span>
    </div>
  );
});

export const PdfReader: React.FC<PdfReaderProps> = ({ book }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(book.pageCount || 1);
  const [zoom, setZoom] = useState<number>(0.9);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setPdfDoc(null);

    // Prefer book.pdfUrl, fallback to placeholder demo if not uploaded
    const rawPdf = book.pdfUrl?.trim();
    if (!rawPdf) {
      setError('বইটির পিডিএফ ফাইল সংরক্ষিত নেই বা পাওয়া যায়নি।');
      setLoading(false);
      return;
    }

    // Resolve CORS-safe stream URL via proxy or direct URL
    const pdfUrl = storageService.resolvePdfStreamUrl(rawPdf);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/cmaps/',
      cMapPacked: true,
      withCredentials: false,
    });

    loadingTask.promise
      .then((loadedPdf) => {
        if (!isMounted) return;
        setPdfDoc(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(1);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('PDF.js loading failed:', err);

        // Try direct URL fallback if proxy was tried first, or report proper error
        if (pdfUrl.startsWith('/api/pdf-proxy') && rawPdf.startsWith('http')) {
          console.warn('Attempting direct stream as fallback...');
          const directTask = pdfjsLib.getDocument({
            url: rawPdf,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/cmaps/',
            cMapPacked: true,
          });
          directTask.promise
            .then((loadedDirect) => {
              if (!isMounted) return;
              setPdfDoc(loadedDirect);
              setTotalPages(loadedDirect.numPages);
              setCurrentPage(1);
              setLoading(false);
              setError(null);
            })
            .catch((directErr) => {
              if (!isMounted) return;
              console.error('Direct PDF loading also failed:', directErr);
              setLoading(false);
              setError('পিডিএফ ফাইলটি লোড করতে ব্যর্থ হয়েছে। নেটওয়ার্ক সংযোগ অথবা ফাইলের অনুমতি যাচাই করুন।');
            });
        } else {
          setLoading(false);
          setError('পিডিএফ ফাইলটি লোড করতে ব্যর্থ হয়েছে। নেটওয়ার্ক সংযোগ অথবা ফাইলের অনুমতি যাচাই করুন।');
        }
      });

    return () => {
      isMounted = false;
      try {
        loadingTask.destroy();
      } catch {}
    };
  }, [book.pdfUrl, reloadTrigger]);

  // Track active visible page while scrolling continuously
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !pdfDoc) return;

    const pageElements = container.querySelectorAll<HTMLElement>('[data-page-number]');
    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const centerLine = containerTop + containerHeight / 3;

    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i];
      const pageTop = el.offsetTop;
      const pageHeight = el.offsetHeight;

      if (centerLine >= pageTop && centerLine <= pageTop + pageHeight) {
        const pageNum = parseInt(el.getAttribute('data-page-number') || '1', 10);
        if (pageNum !== currentPage) {
          setCurrentPage(pageNum);
        }
        break;
      }
    }
  }, [pdfDoc, currentPage]);

  const scrollToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    const targetEl = document.getElementById(`pdf-page-${pageNum}`);
    if (targetEl && scrollContainerRef.current) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoom(0.9);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const directDownloadUrl = storageService.resolveUrl(book.pdfUrl);

  return (
    <div className="fixed inset-0 z-50 bg-[#1e2736] flex flex-col text-white font-bengali">
      {/* Top Header & Continuous Reader Toolbar */}
      <header className="h-14 bg-[#111827] border-b border-gray-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            title="ফিরে যান"
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <img src="/assets/logo.webp" alt="লোগো" className="w-6 h-6 object-contain shrink-0" />
            <h1 className="text-xs sm:text-sm font-semibold text-gray-200 truncate max-w-[140px] sm:max-w-md">
              {book.title}
            </h1>
          </div>
        </div>

        {/* Page Position Counter (Scroll Indicator) */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs">
          <span className="font-mono bg-gray-800/90 text-gray-200 px-2 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold border border-gray-700/60">
            পৃষ্ঠা {toBengaliNumber(currentPage)} / {toBengaliNumber(totalPages)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="সূচিপত্র ও পৃষ্ঠাসমূহ"
            className={`p-1.5 rounded transition ${
              showThumbnails ? 'bg-primary text-white' : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            title="ছোট করুন (Zoom Out)"
            className="p-1.5 rounded hover:bg-gray-800 text-gray-300 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            title="মূল সাইজ"
            className="px-2 py-1 rounded hover:bg-gray-800 text-gray-300 text-xs font-mono hidden sm:inline-flex"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            title="বড় করুন (Zoom In)"
            className="p-1.5 rounded hover:bg-gray-800 text-gray-300 transition"
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

          {directDownloadUrl && (
            <a
              href={directDownloadUrl}
              target="_blank"
              rel="noreferrer"
              title="ব্রাউজারে সরাসরি পিডিএফ খুলুন"
              className="p-1.5 rounded hover:bg-gray-800 text-gray-300 transition hidden sm:inline-flex"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {book.downloadAllowed && directDownloadUrl && (
            <a
              href={directDownloadUrl}
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnail Drawer (Click to jump to any page) */}
        {showThumbnails && (
          <aside className="w-48 sm:w-56 bg-[#182234] border-r border-gray-800 overflow-y-auto p-3 space-y-3 z-30 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                পৃষ্ঠাসমূহ ({toBengaliNumber(totalPages)})
              </p>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => scrollToPage(pg)}
                className={`w-full p-2 rounded border text-center transition flex flex-col items-center ${
                  currentPage === pg
                    ? 'border-primary bg-primary/20 text-cyan-300 font-bold'
                    : 'border-gray-800 bg-[#1F2937] text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="w-20 h-28 bg-white rounded shadow-inner mb-1.5 flex flex-col items-center justify-center p-2 text-gray-800">
                  <span className="text-[9px] font-bold text-gray-500 line-clamp-1">{book.title}</span>
                  <div className="w-12 h-0.5 bg-gray-200 my-1" />
                  <div className="w-8 h-0.5 bg-gray-200 mb-1" />
                  <span className="text-xs font-mono font-bold text-primary mt-2">{pg}</span>
                </div>
                <span className="text-xs">পৃষ্ঠা {toBengaliNumber(pg)}</span>
              </button>
            ))}
          </aside>
        )}

        {/* Center Continuous Vertical Scrolling Document Viewer */}
        <main
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-6 bg-[#2B3544] flex flex-col items-center"
        >
          {loading && (
            <div className="text-center text-gray-300 my-auto py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold">পিডিএফ লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
              <p className="text-xs text-gray-400 mt-1">ক্লাউড স্টোরেজ থেকে বইয়ের পৃষ্ঠাগুলো আনা হচ্ছে</p>
            </div>
          )}

          {!loading && error && (
            <div className="max-w-md w-full bg-white text-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 my-auto text-center space-y-4 border border-rose-200">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">পিডিএফ পড়তে সমস্যা হচ্ছে</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  {error}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setReloadTrigger((prev) => prev + 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা করুন
                </button>
                {directDownloadUrl && (
                  <a
                    href={directDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold border border-gray-300 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> সরাসরি খুলুন
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Continuous Pages Rendered from 1 to totalPages in natural vertical sequence */}
          {!loading && !error && pdfDoc && (
            <div className="w-full flex flex-col items-center py-2 space-y-4">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pg) => (
                <PageRenderItem
                  key={`page-${pg}`}
                  pageNumber={pg}
                  pdfDoc={pdfDoc}
                  zoom={zoom}
                />
              ))}

              <div className="py-8 text-center text-gray-400 text-xs">
                <span>— বইটির সমাপ্তি ({toBengaliNumber(totalPages)} টি পৃষ্ঠা) —</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
