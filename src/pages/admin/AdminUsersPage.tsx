import React, { useState } from 'react';
import { AdminDashboardLayout } from '../../components/layout/AdminDashboardLayout';
import { Users, Shield, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { USER_POSITION_LABELS } from '../../types';

interface DemoUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: 'supporter' | 'well_wisher' | 'worker' | 'associate' | 'member';
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  borrowCount: number;
}

export const AdminUsersPage: React.FC = () => {
  const [userList, setUserList] = useState<DemoUserItem[]>([
    {
      id: 'u-1',
      name: 'রাফি হাসান',
      email: 'rafi@gmail.com',
      phone: '01712xxxxxx',
      position: 'member',
      role: 'user',
      status: 'active',
      borrowCount: 3,
    },
    {
      id: 'u-2',
      name: 'আমিনুল ইসলাম',
      email: 'aminul@gmail.com',
      phone: '01823xxxxxx',
      position: 'associate',
      role: 'user',
      status: 'active',
      borrowCount: 2,
    },
    {
      id: 'u-3',
      name: 'আব্দুর রহমান',
      email: 'admin@shibir.library',
      phone: '01811xxxxxx',
      position: 'member',
      role: 'admin',
      status: 'active',
      borrowCount: 0,
    },
  ]);

  const toggleStatus = (id: string) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
    );
  };

  return (
    <AdminDashboardLayout>
      <div className="bg-white rounded-card border border-brand-border p-6 card-shadow space-y-6">
        <div>
          <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>ব্যবহারকারী ও পাঠক তালিকা</span>
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            লাইব্রেরিতে নিবন্ধিত সদস্যদের তথ্য এবং প্রশাসনিক দায়িত্ব পর্যালোচনা
          </p>
        </div>

        <div className="overflow-x-auto border border-brand-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="p-3">নাম ও যোগাযোগ</th>
                <th className="p-3">সাংগঠনিক মান</th>
                <th className="p-3">ভূমিকা (Role)</th>
                <th className="p-3">মোট ধার</th>
                <th className="p-3">স্ট্যাটাস</th>
                <th className="p-3 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3">
                    <p className="font-bold text-brand-text">{u.name}</p>
                    <p className="text-[11px] text-brand-muted">{u.email} • {u.phone}</p>
                  </td>
                  <td className="p-3 font-semibold text-emerald-800">
                    {USER_POSITION_LABELS[u.position]}
                  </td>
                  <td className="p-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" /> এডমিন
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
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className="px-2.5 py-1 rounded border border-brand-border hover:bg-gray-100 text-[11px] font-semibold"
                      >
                        {u.status === 'active' ? 'স্থগিত করুন' : 'পুনর্বহাল করুন'}
                      </button>
                    )}
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
