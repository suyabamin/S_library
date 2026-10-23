import React, { useState, useEffect } from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { Users, Shield, ShieldCheck, ShieldAlert, UserCheck, AlertCircle, Search, UserPlus, CheckCircle2 } from 'lucide-react';
import { USER_POSITION_LABELS, UserPosition } from '../../types';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: UserPosition;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  borrowCount: number;
}

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [userList, setUserList] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('shibir_library_registered_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  // Fetch real users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const usersCol = collection(db, 'users');
        const snap = await getDocs(usersCol);
        if (!snap.empty) {
          const fetched: RegisteredUser[] = [];
          snap.forEach((d) => {
            const data = d.data() as any;
            fetched.push({
              id: d.id,
              name: data.displayName || data.name || 'ব্যবহারকারী',
              email: data.email || '',
              phone: data.phone || 'তথ্য নেই',
              position: data.position || 'worker',
              role: data.role === 'admin' ? 'admin' : 'user',
              status: data.status === 'suspended' ? 'suspended' : 'active',
              borrowCount: data.borrowCount || 0,
            });
          });
          setUserList(fetched);
          localStorage.setItem('shibir_library_registered_users', JSON.stringify(fetched));
        }
      }
    } catch (err) {
      console.warn('Could not fetch Firestore users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Promote to Admin
  const handlePromoteToAdmin = async (targetUser: RegisteredUser) => {
    if (targetUser.role === 'admin') return;
    const confirm = window.confirm(`আপনি কি নিশ্চিত যে "${targetUser.name}" (${targetUser.email})-কে এডমিন দায়িত্ব প্রদান করতে চান?`);
    if (!confirm) return;

    setPromotingId(targetUser.id);
    try {
      if (isFirebaseConfigured) {
        // 1. Update user role in Firestore
        const userRef = doc(db, 'users', targetUser.id);
        await updateDoc(userRef, { role: 'admin' });

        // 2. Add to admins collection for security rules
        const adminRef = doc(db, 'admins', targetUser.id);
        await setDoc(adminRef, {
          email: targetUser.email,
          name: targetUser.name,
          grantedAt: new Date().toISOString(),
          grantedBy: currentAdmin?.uid || 'super-admin',
        });
      }

      // Update local state
      const updated = userList.map((u) => (u.id === targetUser.id ? { ...u, role: 'admin' as const } : u));
      setUserList(updated);
      localStorage.setItem('shibir_library_registered_users', JSON.stringify(updated));

      setStatusMsg({
        text: `সফল! "${targetUser.name}"-কে এডমিন মর্যাদা দেওয়া হয়েছে। তিনি এখন এডমিন ড্যাশবোর্ড ব্যবহার করতে পারবেন।`,
        type: 'success',
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err) {
      setStatusMsg({ text: 'এডমিন মর্যাদা আপডেটে ত্রুটি হয়েছে।', type: 'error' });
    } finally {
      setPromotingId(null);
    }
  };

  // Demote / Remove Admin Role
  const handleRemoveAdmin = async (targetUser: RegisteredUser) => {
    if (targetUser.id === currentAdmin?.uid) {
      alert('আপনি নিজের এডমিন পদবি সরাতে পারবেন না!');
      return;
    }

    const confirm = window.confirm(`আপনি কি "${targetUser.name}"-এর এডমিন পদবি বাতিল করে সাধারণ পাঠকে পরিবর্তন করতে চান?`);
    if (!confirm) return;

    setPromotingId(targetUser.id);
    try {
      if (isFirebaseConfigured) {
        // 1. Update user role in Firestore
        const userRef = doc(db, 'users', targetUser.id);
        await updateDoc(userRef, { role: 'user' });

        // 2. Remove from admins collection
        const adminRef = doc(db, 'admins', targetUser.id);
        await deleteDoc(adminRef);
      }

      // Update local state
      const updated = userList.map((u) => (u.id === targetUser.id ? { ...u, role: 'user' as const } : u));
      setUserList(updated);
      localStorage.setItem('shibir_library_registered_users', JSON.stringify(updated));

      setStatusMsg({
        text: `সফল! "${targetUser.name}"-এর এডমিন দায়িত্ব প্রত্যাহার করা হয়েছে।`,
        type: 'success',
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err) {
      setStatusMsg({ text: 'এডমিন পদবি অপসারণে ত্রুটি হয়েছে।', type: 'error' });
    } finally {
      setPromotingId(null);
    }
  };

  // Toggle Suspended status
  const toggleStatus = async (id: string) => {
    const target = userList.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'suspended' : 'active';

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'users', id), { status: newStatus });
      } catch (e) {
        console.warn(e);
      }
    }

    const updated = userList.map((u) => (u.id === id ? { ...u, status: newStatus as any } : u));
    setUserList(updated);
    localStorage.setItem('shibir_library_registered_users', JSON.stringify(updated));
  };

  const filteredUsers = userList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>ব্যবহারকারী ও এডমিন ব্যবস্থাপনা</span>
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              নিবন্ধিত যেকাউকে এডমিন পদে উন্নীত বা প্রত্যাহার করার সুযোগ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-brand-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary w-52"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-2.5 top-2" />
            </div>

            <button
              onClick={fetchUsers}
              className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold hover:bg-gray-50 text-brand-text transition"
            >
              রিফ্রেশ
            </button>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="overflow-x-auto border border-brand-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="p-3">নাম ও যোগাযোগ</th>
                <th className="p-3">সাংগঠনিক মান</th>
                <th className="p-3">ভূমিকা (Role)</th>
                <th className="p-3">মোট ধার</th>
                <th className="p-3">স্ট্যাটাস</th>
                <th className="p-3 text-right">এডমিন দায়িত্ব নিয়ন্ত্রণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-muted">
                    {loading ? 'তথ্য লোড হচ্ছে...' : 'কোনো নিবন্ধিত ব্যবহারকারী পাওয়া যায়নি।'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3">
                      <p className="font-bold text-brand-text">{u.name}</p>
                      <p className="text-[11px] text-brand-muted">{u.email} • {u.phone}</p>
                    </td>
                    <td className="p-3 font-semibold text-emerald-800">
                      {USER_POSITION_LABELS[u.position] || u.position}
                    </td>
                    <td className="p-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3.5 h-3.5" /> এডমিন
                        </span>
                      ) : (
                        <span className="text-gray-600 font-medium">সাধারণ পাঠক</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-brand-text">
                      {u.borrowCount} টি
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status === 'active' ? 'সক্রিয়' : 'সাময়িক স্থগিত'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.role === 'admin' ? (
                          u.id !== currentAdmin?.uid ? (
                            <button
                              disabled={promotingId === u.id}
                              onClick={() => handleRemoveAdmin(u)}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold transition flex items-center gap-1"
                              title="এডমিন পদবি অপসারণ করুন"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{promotingId === u.id ? 'প্রসেসিং...' : 'এডমিন সরান'}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium italic">বর্তমান ইউজার</span>
                          )
                        ) : (
                          <button
                            disabled={promotingId === u.id}
                            onClick={() => handlePromoteToAdmin(u)}
                            className="px-2.5 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                            title="এই ব্যবহারকারীকে এডমিন বানান"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{promotingId === u.id ? 'প্রসেসিং...' : 'এডমিন বানান'}</span>
                          </button>
                        )}

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => toggleStatus(u.id)}
                            className="px-2 py-1 rounded border border-brand-border hover:bg-gray-100 text-[10px] font-semibold text-brand-muted"
                          >
                            {u.status === 'active' ? 'স্থগিত' : 'সক্রিয়'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};
