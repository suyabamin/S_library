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
import { useAuth } from './AuthContext';

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
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
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
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('shibir_library_loans');
    if (saved) return JSON.parse(saved);
    // Initial loan from approved request
    return [
      {
        id: 'loan-1',
        requestId: 'req-1',
        borrowerUid: 'demo-user-1',
        borrowerName: 'রাফি হাসান',
        bookId: 'book-1',
        bookTitle: 'তাফসীর ইবনে কাসীর (১ম খণ্ড)',
        bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
        borrowDate: '2026-03-12',
        dueDate: '2026-03-26',
        status: 'active',
        createdAt: '2026-03-12T10:30:00Z',
        updatedAt: '2026-03-12T10:30:00Z',
      },
    ];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('shibir_library_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([
    {
      id: 'chat-1',
      requestId: 'req-1',
      bookTitle: 'তাফসীর ইবনে কাসীর (১ম খণ্ড)',
      borrowerUid: 'demo-user-1',
      borrowerName: 'রাফি হাসান',
      participantAdminUids: ['admin-1'],
      active: true,
      lastMessageAt: '2026-03-12T11:05:00Z',
      lastMessagePreview: 'ঠিক আছে ভাই। নিয়ে আসার সময় আমাকে জানাবেন।',
      unreadCount: 1,
      createdAt: '2026-03-12T10:30:00Z',
    },
  ]);

  const [activeChatMessages, setActiveChatMessages] = useState<Record<string, ChatMessage[]>>({
    'chat-1': [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        senderUid: 'admin-1',
        senderName: 'আব্দুর রহমান (দায়িত্বশীল)',
        senderRole: 'admin',
        text: 'আসসালামু আলাইকুম। আপনার রিকোয়েস্টটি অনুমোদিত হয়েছে। আপনি কি থানার বাসা থেকে বইটি নিতে পারবেন?',
        createdAt: '2026-03-12T10:35:00Z',
      },
      {
        id: 'msg-2',
        chatId: 'chat-1',
        senderUid: 'demo-user-1',
        senderName: 'রাফি হাসান',
        senderRole: 'user',
        text: 'ওয়ালাইকুম আসসালাম ভাই, আমি এখনই নিতে পারছি। ধন্যবাদ।',
        createdAt: '2026-03-12T10:50:00Z',
      },
      {
        id: 'msg-3',
        chatId: 'chat-1',
        senderUid: 'admin-1',
        senderName: 'আব্দুর রহমান (দায়িত্বশীল)',
        senderRole: 'admin',
        text: 'ঠিক আছে ভাই। নিয়ে আসার সময় আমাকে জানাবেন।',
        createdAt: '2026-03-12T11:05:00Z',
      },
    ],
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'audit-1',
      action: 'APPROVE_REQUEST',
      actorUid: 'admin-1',
      actorName: 'আব্দুর রহমান',
      actorRole: 'admin',
      entityType: 'request',
      entityId: 'req-1',
      details: 'রিকোয়েস্ট অনুমোদন করা হয়েছে এবং ১টি কপি রিজার্ভ করা হয়েছে।',
      createdAt: '2026-03-12T10:30:00Z',
    },
  ]);

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('shibir_library_books', JSON.stringify(books));
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

  const unreadNotificationCount = notifications.filter(
    (n) => !n.read && (!user || n.recipientUid === user.uid)
  ).length;

  const getBookById = (id: string) => books.find((b) => b.id === id);
  const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug || c.id === slug);

  const addBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBook: Book = {
      ...bookData,
      id: generateId('book'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.uid,
    };
    setBooks((prev) => [newBook, ...prev]);

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
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
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

  const approveBorrowRequest = async (requestId: string, reason?: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const chatId = generateId('chat');

    // 1. Update Request
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              decisionReason: reason || 'অনুমোদন দেওয়া হয়েছে।',
              chatId,
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

    // 3. Create Loan Record
    const newLoan: Loan = {
      id: generateId('loan'),
      requestId,
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
    setLoans((prev) => [newLoan, ...prev]);

    // 4. Activate Chat Conversation
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
    setChatConversations((prev) => [newChat, ...prev]);

    // Initial message
    setActiveChatMessages((prev) => ({
      ...prev,
      [chatId]: [
        {
          id: generateId('msg'),
          chatId,
          senderUid: user?.uid || 'admin-1',
          senderName: user?.displayName || 'লাইব্রেরি দায়িত্বশীল',
          senderRole: 'admin',
          text: `আসসালামু আলাইকুম ${req.borrowerName} ভাই। "${req.bookTitle}" বইটির জন্য আপনার ধার নেওয়ার আবেদনটি অনুমোদিত হয়েছে। দয়া করে বই গ্রহণের স্থান ও সময় নিশ্চিত করুন।`,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    // 5. Notify Borrower
    setNotifications((prev) => [
      {
        id: generateId('notif'),
        recipientUid: req.borrowerUid,
        type: 'request_approved',
        title: 'আপনার বই রিকোয়েস্ট অনুমোদিত হয়েছে! 🎉',
        body: `"${req.bookTitle}" বইটি অনুমোদিত হয়েছে। দায়িত্বশীল ভাইয়ের সাথে চ্যাটে যোগাযোগ করে বইটি সংগ্রহ করুন।`,
        relatedType: 'request',
        relatedId: requestId,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);

    // 6. Audit Log
    setAuditLogs((prev) => [
      {
        id: generateId('audit'),
        action: 'APPROVE_REQUEST',
        actorUid: user?.uid || 'admin-1',
        actorName: user?.displayName || 'এডমিন',
        actorRole: 'admin',
        entityType: 'request',
        entityId: requestId,
        details: `আবেদন অনুমোদন করা হয়েছে। ঋণ আইডি: ${newLoan.id}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
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
