export type UserRole = 'user' | 'admin';

export type UserPosition = 'supporter' | 'well_wisher' | 'worker' | 'associate' | 'member';

export const USER_POSITION_LABELS: Record<UserPosition, string> = {
  supporter: 'সমর্থক',
  well_wisher: 'সুধী',
  worker: 'কর্মী',
  associate: 'সাথী',
  member: 'সদস্য',
};

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  position?: UserPosition;
  academicYear?: string;
  address?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameBn: string;
  slug: string;
  order: number;
  active: boolean;
  bookCount?: number;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  categoryId: string;
  categoryName?: string;
  description?: string;
  coverImage?: string; // URL or key
  coverObjectKey?: string;
  pdfUrl?: string; // Direct/signed URL or external
  pdfObjectKey?: string;
  externalPdfUrl?: string;
  fileSizeMb?: number;
  pageCount?: number;
  downloadAllowed: boolean;
  language: string;
  publicationInfo?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  isPhysicalAvailable?: boolean;
  availablePhysicalCopies?: number;
  totalPhysicalCopies?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PhysicalBook {
  id: string;
  digitalBookId?: string;
  title: string;
  author?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookCopy {
  id: string;
  physicalBookId: string;
  inventoryCode: string;
  status: 'available' | 'reserved' | 'borrowed' | 'damaged' | 'lost';
  location: string;
  activeLoanId?: string;
  updatedAt: string;
}

export type PickupLocation = 'house' | 'campus' | 'other';

export const PICKUP_LOCATION_LABELS: Record<PickupLocation, string> = {
  house: 'থানার বাসা',
  campus: 'ক্যাম্পাস',
  other: 'অন্য স্থান',
};

export type BorrowRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'ready_for_pickup'
  | 'borrowed'
  | 'return_requested'
  | 'returned'
  | 'cancelled'
  | 'overdue';

export const BORROW_STATUS_LABELS: Record<BorrowRequestStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'পেন্ডিং', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-300' },
  approved: { label: 'অনুমোদিত', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' },
  rejected: { label: 'প্রত্যাখ্যাত', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-300' },
  ready_for_pickup: { label: 'সংগ্রহের জন্য প্রস্তুত', color: 'text-teal-700', bg: 'bg-teal-100 border-teal-300' },
  borrowed: { label: 'ধার নেওয়া হয়েছে', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300' },
  return_requested: { label: 'ফেরত অনুরোধকৃত', color: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-300' },
  returned: { label: 'ফেরত সম্পন্ন', color: 'text-emerald-800', bg: 'bg-emerald-100 border-emerald-400' },
  cancelled: { label: 'বাতিল', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-300' },
  overdue: { label: 'মেয়াদোত্তীর্ণ', color: 'text-red-700', bg: 'bg-red-100 border-red-400' },
};

export interface BorrowRequest {
  id: string;
  borrowerUid: string;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  copyId?: string;
  address: string;
  position: UserPosition;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  pickupLocation: PickupLocation;
  pickupLocationDetails?: string;
  status: BorrowRequestStatus;
  adminUid?: string;
  decisionReason?: string;
  chatId?: string;
  adminHandoverConfirmed?: boolean;
  adminHandoverConfirmedAt?: string;
  borrowerReceivedConfirmed?: boolean;
  borrowerReceivedConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  requestId: string;
  borrowerUid: string;
  borrowerName: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  copyId?: string;
  borrowDate: string;
  dueDate: string;
  status: 'active' | 'return_requested' | 'returned' | 'overdue' | 'cancelled';
  borrowerReturnConfirmedAt?: string;
  borrowerReturnConfirmedBy?: string;
  adminReturnConfirmedAt?: string;
  adminReturnConfirmedBy?: string;
  completedAt?: string;
  inventoryReleasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
  readBy?: string[];
}

export interface ChatConversation {
  id: string;
  requestId: string;
  bookTitle: string;
  borrowerUid: string;
  borrowerName: string;
  participantAdminUids: string[];
  active: boolean;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  type: 'request_approved' | 'request_rejected' | 'due_reminder' | 'overdue' | 'new_message' | 'new_book' | 'return_confirmed';
  title: string;
  body: string;
  relatedType?: 'request' | 'loan' | 'chat' | 'book';
  relatedId?: string;
  createdAt: string;
  read: boolean;
  dedupeKey?: string;
}

export interface HistoryArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  imageUrls: string[];
  featuredImage?: string;
  eventDate?: string;
  year?: string;
  sources: { label: string; url?: string }[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  entityType: 'book' | 'request' | 'loan' | 'inventory' | 'history' | 'user';
  entityId: string;
  details: string;
  createdAt: string;
}
