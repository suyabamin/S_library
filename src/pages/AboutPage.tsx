import React from 'react';
import { Shield, BookOpen, Clock, MapPin, CheckCircle2, Phone, Mail } from 'lucide-react';
import { EditableText } from '../context/SiteContentContext';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="bg-white rounded-card border border-brand-border p-6 sm:p-10 card-shadow space-y-6">
        <div className="text-center space-y-3 pb-6 border-b border-brand-border">
          <div className="w-16 h-16 mx-auto flex items-center justify-center p-1">
            <img src="/assets/logo.webp" alt="শিবির লাইব্রেরি লোগো" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
            <EditableText contentKey="about_title" defaultText="শিবির লাইব্রেরি, UIU থানা" />
          </h1>
          <p className="text-xs text-primary font-bold tracking-widest uppercase">
            <EditableText contentKey="about_tagline" defaultText="শহিদি কাফেলা" />
          </p>
          <p className="text-sm text-brand-muted max-w-xl mx-auto italic">
            <EditableText contentKey="about_quote" defaultText="“জ্ঞান হোক সংগ্রামের শক্তি, বই হোক পরিবর্তনের হাতিয়ার”" />
          </p>
        </div>

        {/* Mission */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <EditableText contentKey="about_mission_title" defaultText="আমাদের লক্ষ্য ও উদ্দেশ্য" />
          </h2>
          <p className="text-sm text-brand-muted leading-relaxed">
            <EditableText
              contentKey="about_mission_desc"
              defaultText="ইউনাইটেড ইন্টারন্যাশনাল ইউনিভার্সিটিতে (UIU) অধ্যয়নরত শিক্ষার্থীদের জ্ঞানপিপাসা নিবারণ, চারিত্রিক উৎকর্ষ সাধন এবং একাডেমিক ও দ্বীনি শিক্ষার সমন্বয়ে একটি আদর্শিক প্রজন্ম গড়ে তোলাই শিবির লাইব্রেরির মূল লক্ষ্য। এখানে সাধারণ সিলেবাস, ইসলামী চিন্তাধারা, কুরআন-সুন্নাহর তাফসীর এবং আত্মগঠনমূলক বইসমূহ উন্মুক্তভাবে পাঠকদের কাছে পৌঁছে দেওয়া হয়।"
              multiline
            />
          </p>
        </div>

        {/* Lending Guidelines */}
        <div className="space-y-3 pt-4 border-t border-brand-border">
          <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>বই ধার নেওয়ার নিয়মাবলী</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-brand-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>লাইব্রেরির ওয়েবসাইট থেকে অনলাইনে নিবন্ধন করে হার্ড কপি ধার নেওয়ার আবেদন করতে হবে।</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>প্রতিটি বই সর্বোচ্চ ১৪ (চৌদ্দ) দিনের জন্য ধার নেওয়া যাবে। মেয়াদ শেষ হওয়ার পূর্বে বই ফেরত দিতে হবে।</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>আবেদন অনুমোদনের পর UIU ক্যাম্পাস অথবা থানার বাসা থেকে বইটি স্বশরীরে গ্রহণ করা যাবে।</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>বই ফেরত দেওয়ার পর ওয়েবসাইটে "বই ফেরত দিয়েছি" বাটনে ক্লিক করতে হবে এবং দায়িত্বশীল ভাই কর্তৃক রিসিভ নিশ্চিত হলেই ধার সম্পন্ন হবে।</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs sm:text-sm text-emerald-950">
          <h3 className="font-bold text-sm">যোগাযোগের ঠিকানা:</h3>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>UIU ক্যাম্পাস সংলগ্ন, মাদানী এভিনিউ, ভাটারা, ঢাকা-১২১২</span>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <span>uiu.shibir.library@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};
