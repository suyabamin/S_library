import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Book,
  Category,
  BorrowRequest,
  Loan,
  NotificationItem,
  ChatMessage,
  ChatConversation,
  AuditLog,
  PickupLocation,
  UserPosition,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  INITIAL_HISTORY_ARTICLES,
  INITIAL_NOTIFICATIONS,
  INITIAL_REQUESTS,
} from '../lib/seedData';
import { generateId } from '../lib/utils';
import { validateAndCanonicalizeBook, sanitizeFirestorePayload } from '../lib/bookValidation';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface LibraryContextType {
  books: Book[];
  categories: Category[];
  requests: BorrowRequest[];
  loans: Loan[];
  notifications: NotificationItem[];
  chatConversations: ChatConversation[];
  activeChatMessages: Record<string, ChatMessage[]>;
  auditLogs: AuditLog[];
  unreadNotificationCount: number;

  // Actions
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Book>;
  updateBook: (id: string, book: Partial<Book>) => Promise<Book>;
  deleteBook: (id: string) => void;
  submitBorrowRequest: (params: {
    bookId: string;
    borrowerName: string;
    address: string;
    position: UserPosition;
    borrowDate: string;
    dueDate: string;
    pickupLocation: PickupLocation;
    pickupLocationDetails?: string;
  }) => Promise<BorrowRequest>;
  approveBorrowRequest: (requestId: string, reason?: string) => Promise<void>;
  rejectBorrowRequest: (requestId: string, reason: string) => Promise<void>;
  confirmAdminHandover: (requestId: string) => Promise<void>;
  confirmBorrowerReceipt: (requestId: string) => Promise<void>;
  confirmBorrowerReturn: (loanId: string) => Promise<void>;
  confirmAdminReturnReceipt: (loanId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  getBookById: (id: string) => Book | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('shibir_library_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [requests, setRequests] = useState<BorrowRequest[]>(() => {
    const saved = localStorage.getItem('shibir_library_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('shibir_library_loans');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('shibir_library_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('shibir_library_chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeChatMessages, setActiveChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('shibir_library_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('shibir_library_audits');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist state updates
  useEffect(() => {
    try {
      localStorage.setItem('shibir_library_books', JSON.stringify(books));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }, [books]);

  useEffect(() => {
    localStorage.setItem('shibir_library_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('shibir_library_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('shibir_library_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('shibir_library_chats', JSON.stringify(chatConversations));
  }, [chatConversations]);

  useEffect(() => {
    localStorage.setItem('shibir_library_messages', JSON.stringify(activeChatMessages));
  }, [activeChatMessages]);

  useEffect(() => {
    localStorage.setItem('shibir_library_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Synchronize books collection with Cloud Firestore in real-time
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const booksColRef = collection(db, 'books');
    const unsubscribe = onSnapshot(
      booksColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedBooks: Book[] = [];
          snapshot.forEach((d) => {
            loadedBooks.push({ id: d.id, ...(d.data() as any) });
          });
          setBooks((prevBooks) => {
            const combinedMap = new Map<string, Book>();
            // Keep local books that might have just been added
            prevBooks.forEach((b) => combinedMap.set(b.id, b));
            // Merge in server books
            loadedBooks.forEach((b) => combinedMap.set(b.id, b));
            const allBooks = Array.from(combinedMap.values());
            allBooks.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            return allBooks;
          });
        } else {
          // Initialize cloud collection with seed books
          INITIAL_BOOKS.forEach((ib) => {
            setDoc(doc(db, 'books', ib.id), sanitizeFirestorePayload(ib)).catch(() => {});
          });
        }
      },
      (err) => {
        console.warn('Firestore books listener error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const unreadNotificationCount = notifications.filter((n) => {
    if (n.read) return false;
    if (n.recipientUid === 'all') return true;
    if (user && n.recipientUid === user.uid) return true;
    if (user?.role === 'admin' && (n.recipientUid === 'admin' || n.recipientUid === 'all')) return true;
    return false;
  }).length;

  const getBookById = (id: string) => books.find((b) => b.id === id);
  const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug || c.id === slug);

  const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> => {
    // 1. Strict schema validation & canonicalization before any write
    const { valid, errors, sanitized } = validateAndCanonicalizeBook(bookData, true);
    if (!valid) {
      throw new Error(errors.join(' | '));
    }

    const newBook: Book = {
      ...sanitized,
      id: generateId('book'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(user?.uid ? { createdBy: user.uid } : {}),
    } as Book;

    if (isFirebaseConfigured) {
      // 2. Strict recursive sanitization: completely omits any undefined properties
      const firestorePayload = sanitizeFirestorePayload(newBook);
      // Direct await ensures the book actually persists to Firestore before confirming success.
      // Throws on permission denied, invalid data, or network failure so the caller can alert the user honestly.
      await setDoc(doc(db, 'books', newBook.id), firestorePayload);
    }

    setBooks((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);

    // Add audit log
    if (user) {
      setAuditLogs((prev) => [
        {
          id: generateId('audit'),
          action: 'CREATE_BOOK',
          actorUid: user.uid,
          actorName: user.displayName,
          actorRole: user.role,
          entityType: 'book',
          entityId: newBook.id,
          details: `বই যোগ করা হয়েছে: ${newBook.title}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    return newBook;
  };

  const updateBook = async (id: string, updates: Partial<Book>): Promise<Book> => {
    const existing = books.find((b) => b.id === id);
    if (!existing) {
      throw new Error('বইটি খুঁজে পাওয়া যায়নি');
    }

    const merged = { ...existing, ...updates };
    const { valid, errors, sanitized } = validateAndCanonicalizeBook(merged, false);
    if (!valid) {
      throw new Error(errors.join(' | '));
    }

    const updatedBook: Book = {
      ...sanitized,
      id,
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(user?.uid ? { updatedBy: user.uid } : {}),
    } as Book;

    if (isFirebaseConfigured) {
      const firestorePayload = sanitizeFirestorePayload(updatedBook);
      await updateDoc(doc(db, 'books', id), firestorePayload);
    }

    setBooks((prev) =>
      prev.map((b) => (b.id === id ? updatedBook : b))
    );

    if (user) {
      setAuditLogs((prev) => [
        {
          id: generateId('audit'),
          action: 'UPDATE_BOOK',
          actorUid: user.uid,
          actorName: user.displayName,
          actorRole: user.role,
          entityType: 'book',
          entityId: id,
          details: `বই সম্পাদনা করা হয়েছে: ${updatedBook.title}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    return updatedBook;
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (isFirebaseConfigured) {
      deleteDoc(doc(db, 'books', id)).catch((err) => {
        console.warn('Error deleting book in Firestore:', err);
      });
    }
  };

  const submitBorrowRequest = async (params: {
    bookId: string;
    borrowerName: string;
    address: string;
    position: UserPosition;
    borrowDate: string;
    dueDate: string;
    pickupLocation: PickupLocation;
    pickupLocationDetails?: string;
  }): Promise<BorrowRequest> => {
    const book = getBookById(params.bookId);
    if (!book) throw new Error('বই খুঁজে পাওয়া যায়নি');

    const newReq: BorrowRequest = {
      id: generateId('req'),
      borrowerUid: user?.uid || 'guest-user',
      borrowerName: params.borrowerName,
      borrowerEmail: user?.email,
      borrowerPhone: user?.phone,
      bookId: params.bookId,
      bookTitle: book.title,
      bookCover: book.coverImage,
      address: params.address,
      position: params.position,
      borrowDate: params.borrowDate,
      dueDate: params.dueDate,
      pickupLocation: params.pickupLocation,
      pickupLocationDetails: params.pickupLocationDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);

    // Create confirmation notification for borrower
    const notif: NotificationItem = {
      id: generateId('notif'),
      recipientUid: newReq.borrowerUid,
      type: 'request_approved',
      title: 'ধার নেওয়ার আবেদন গৃহীত হয়েছে',
      body: `"${book.title}" বইটির জন্য আপনার আবেদন জমা হয়েছে। পর্যালোচনার পর জানানো হবে।`,
      relatedType: 'request',
      relatedId: newReq.id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newReq;
  };

  const createActiveLoanRecord = (req: BorrowRequest) => {
    const newLoan: Loan = {
      id: generateId('loan'),
      requestId: req.id,
      borrowerUid: req.borrowerUid,
      borrowerName: req.borrowerName,
      bookId: req.bookId,
      bookTitle: req.bookTitle,
      bookCover: req.bookCover,
      borrowDate: req.borrowDate,
      dueDate: req.dueDate,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLoans((prev) => [newLoan, ...prev.filter((l) => l.requestId !== req.id)]);

    // Notify borrower that loan is officially active in "আমার সক্রিয় ধার"
    const now = new Date().toISOString();
    setNotifications((prev) => [
      {
        id: generateId('notif'),
        recipientUid: req.borrowerUid,
        type: 'request_approved',
        title: 'বইয়ের ধার এখন সক্রিয়! 📚',
        body: `উভয় পক্ষ নিশ্চিত করায় "${req.bookTitle}" বইটি আপনার "আমার সক্রিয় ধার"-এ সংরক্ষিত হয়েছে। ফেরত দেওয়ার তারিখ: ${req.dueDate}`,
        relatedType: 'loan',
        relatedId: newLoan.id,
        createdAt: now,
        read: false,
      },
      {
        id: generateId('notif'),
        recipientUid: 'admin',
        type: 'request_approved',
        title: 'বই হস্তান্তর সফলভাবে সম্পন্ন হয়েছে ✅',
        body: `${req.borrowerName}-কে "${req.bookTitle}" বইটির সফল হস্তান্তর নিশ্চিত করা হয়েছে।`,
        relatedType: 'loan',
        relatedId: newLoan.id,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);
  };

  const approveBorrowRequest = async (requestId: string, reason?: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const chatId = req.chatId || generateId('chat');

    // 1. Update Request - wait for physical handover confirmations before activating loan
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              decisionReason: reason || 'অনুমোদন দেওয়া হয়েছে। বই হস্তান্তরের অপেক্ষায়।',
              chatId,
              adminHandoverConfirmed: false,
              borrowerReceivedConfirmed: false,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // 2. Reserve Physical Inventory
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === req.bookId && b.availablePhysicalCopies && b.availablePhysicalCopies > 0) {
          return { ...b, availablePhysicalCopies: b.availablePhysicalCopies - 1 };
        }
        return b;
      })
    );

    // 3. Activate Chat Conversation
    const newChat: ChatConversation = {
      id: chatId,
      requestId,
      bookTitle: req.bookTitle,
      borrowerUid: req.borrowerUid,
      borrowerName: req.borrowerName,
      participantAdminUids: [user?.uid || 'admin-1'],
      active: true,
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: 'আসসালামু আলাইকুম। আপনার রিকোয়েস্টটি অনুমোদিত হয়েছে।',
      unreadCount: 1,
      createdAt: new Date().toISOString(),
    };
    setChatConversations((prev) => [newChat, ...prev.filter((c) => c.id !== chatId)]);

    // Initial message
    setActiveChatMessages((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] || []),
        {
          id: generateId('msg'),
          chatId,
          senderUid: user?.uid || 'admin-1',
          senderName: user?.displayName || 'লাইব্রেরি দায়িত্বশীল',
          senderRole: 'admin',
          text: `আসসালামু আলাইকুম ${req.borrowerName} ভাই। "${req.bookTitle}" বইটির জন্য আপনার ধার নেওয়ার আবেদনটি অনুমোদিত হয়েছে। দয়া করে বই গ্রহণের স্থান ও সময় নিশ্চিত করুন। উভয় পক্ষ নিশ্চিত করলে বইটি সক্রিয় ধারে যুক্ত হবে।`,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    // 4. Notify Borrower
    setNotifications((prev) => [
      {
        id: generateId('notif'),
        recipientUid: req.borrowerUid,
        type: 'request_approved',
        title: 'বই রিকোয়েস্ট অনুমোদিত হয়েছে! 🎉',
        body: `"${req.bookTitle}" বইটি অনুমোদিত হয়েছে। বই হাতে পাওয়ার পর "বইটি হাতে পেয়েছি" চেপে নিশ্চিত করুন।`,
        relatedType: 'request',
        relatedId: requestId,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);

    // 5. Audit Log
    setAuditLogs((prev) => [
      {
        id: generateId('audit'),
        action: 'APPROVE_REQUEST',
        actorUid: user?.uid || 'admin-1',
        actorName: user?.displayName || 'এডমিন',
        actorRole: 'admin',
        entityType: 'request',
        entityId: requestId,
        details: `আবেদন অনুমোদন করা হয়েছে। উভয় পক্ষের হস্তান্তর নিশ্চিতকরণের অপেক্ষা।`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const confirmAdminHandover = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const isBothConfirmed = req.borrowerReceivedConfirmed === true;
    const now = new Date().toISOString();

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          adminHandoverConfirmed: true,
          adminHandoverConfirmedAt: now,
          status: isBothConfirmed ? 'borrowed' : r.status,
          updatedAt: now,
        };
      })
    );

    if (isBothConfirmed) {
      createActiveLoanRecord(req);
    } else {
      setNotifications((prev) => [
        {
          id: generateId('notif'),
          recipientUid: req.borrowerUid,
          type: 'request_approved',
          title: 'এডমিন বই হস্তান্তর নিশ্চিত করেছেন',
          body: `দায়িত্বশীল ভাই "${req.bookTitle}" বইটি হস্তান্তর করেছেন। আপনি বইটি গ্রহণ করে থাকলে "বইটি হাতে পেয়েছি" চাপুন।`,
          relatedType: 'request',
          relatedId: requestId,
          createdAt: now,
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const confirmBorrowerReceipt = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const isBothConfirmed = req.adminHandoverConfirmed === true;
    const now = new Date().toISOString();

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          borrowerReceivedConfirmed: true,
          borrowerReceivedConfirmedAt: now,
          status: isBothConfirmed ? 'borrowed' : r.status,
          updatedAt: now,
        };
      })
    );

    if (isBothConfirmed) {
      createActiveLoanRecord(req);
    } else {
      setNotifications((prev) => [
        {
          id: generateId('notif'),
          recipientUid: 'admin',
          type: 'request_approved',
          title: 'পাঠক বই পাওয়ার কথা জানিয়েছেন',
          body: `পাঠক ${req.borrowerName} "${req.bookTitle}" বইটি হাতে পাওয়ার নিশ্চিতকরণ দিয়েছেন। আপনার হস্তান্তর নিশ্চিত করুন।`,
          relatedType: 'request',
          relatedId: requestId,
          createdAt: now,
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const rejectBorrowRequest = async (requestId: string, reason: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              decisionReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Notify Borrower
    setNotifications((prev) => [
      {
        id: generateId('notif'),
        recipientUid: req.borrowerUid,
        type: 'request_rejected',
        title: 'বই রিকোয়েস্ট প্রত্যাখ্যাত হয়েছে',
        body: `কারণ: ${reason}`,
        relatedType: 'request',
        relatedId: requestId,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  // Two-party Return: Step 1 - Borrower Confirmation
  const confirmBorrowerReturn = async (loanId: string) => {
    setLoans((prev) =>
      prev.map((loan) => {
        if (loan.id === loanId) {
          const now = new Date().toISOString();
          const bothConfirmed = Boolean(loan.adminReturnConfirmedAt);
          return {
            ...loan,
            borrowerReturnConfirmedAt: now,
            borrowerReturnConfirmedBy: user?.uid,
            status: bothConfirmed ? 'returned' : 'return_requested',
            completedAt: bothConfirmed ? now : undefined,
            updatedAt: now,
          };
        }
        return loan;
      })
    );
  };

  // Two-party Return: Step 2 - Admin Confirmation & Idempotent Inventory Release
  const confirmAdminReturnReceipt = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = new Date().toISOString();
    const isBorrowerConfirmed = Boolean(loan.borrowerReturnConfirmedAt);

    // Release inventory only once
    if (!loan.inventoryReleasedAt) {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === loan.bookId) {
            const current = b.availablePhysicalCopies || 0;
            const total = b.totalPhysicalCopies || current;
            return {
              ...b,
              availablePhysicalCopies: Math.min(total, current + 1),
            };
          }
          return b;
        })
      );
    }

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              adminReturnConfirmedAt: now,
              adminReturnConfirmedBy: user?.uid || 'admin-1',
              inventoryReleasedAt: l.inventoryReleasedAt || now,
              status: isBorrowerConfirmed ? 'returned' : 'return_requested',
              completedAt: isBorrowerConfirmed ? now : undefined,
              updatedAt: now,
            }
          : l
      )
    );

    // Notify borrower
    setNotifications((prev) => [
      {
        id: generateId('notif'),
        recipientUid: loan.borrowerUid,
        type: 'return_confirmed',
        title: 'বই ফেরত গ্রহণ নিশ্চিত করা হয়েছে',
        body: `"${loan.bookTitle}" বইটি লাইব্রেরিতে জমা নেওয়া সম্পন্ন হয়েছে। জাযাকুমুল্লাহু খাইরান।`,
        relatedType: 'loan',
        relatedId: loanId,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);
  };

  const sendMessage = async (chatId: string, text: string) => {
    if (!text.trim() || !user) return;

    const newMsg: ChatMessage = {
      id: generateId('msg'),
      chatId,
      senderUid: user.uid,
      senderName: user.displayName,
      senderRole: user.role,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setActiveChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    setChatConversations((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessageAt: newMsg.createdAt,
              lastMessagePreview: newMsg.text,
            }
          : c
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        categories,
        requests,
        loans,
        notifications,
        chatConversations,
        activeChatMessages,
        auditLogs,
        unreadNotificationCount,
        addBook,
        updateBook,
        deleteBook,
        submitBorrowRequest,
        approveBorrowRequest,
        rejectBorrowRequest,
        confirmAdminHandover,
        confirmBorrowerReceipt,
        confirmBorrowerReturn,
        confirmAdminReturnReceipt,
        sendMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getBookById,
        getCategoryBySlug,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};
