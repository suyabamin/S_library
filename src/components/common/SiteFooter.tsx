import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Phone, Heart, Shield } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center p-0.5">
                <img src="/assets/logo.webp" alt="শিবির লাইব্রেরি, UIU থানা" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-brand-text">
                  শিবির লাইব্রেরি, <span className="text-primary">UIU থানা</span>
                </h3>
                <p className="text-xs text-primary font-semibold tracking-wider">শহিদি কাফেলা</p>
              </div>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed max-w-sm">
              জ্ঞান হোক সংগ্রামের শক্তি, বই হোক পরিবর্তনের হাতিয়ার। শিক্ষার্থীদের মননশীলতা বিকাশ, দ্বীনি জ্ঞানার্জন এবং নৈতিক নেতৃত্ব গঠনের প্রত্যয়ে পরিচালিত একটি আদর্শিক ডিজিটাল ও ফিজিক্যাল লাইব্রেরি।
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <Shield className="w-4 h-4 text-primary" />
              <span>বাংলাদেশ ইসলামী ছাত্রশিবির • UIU থানা শাখা</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-brand-text border-b border-brand-border pb-2">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <Link to="/books" className="hover:text-primary transition">সকল বই</Link>
              </li>
              <li>
                <Link to="/categories/al-quran" className="hover:text-primary transition">আল-কুরআন</Link>
              </li>
              <li>
                <Link to="/categories/al-hadith" className="hover:text-primary transition">আল-হাদিস</Link>
              </li>
              <li>
                <Link to="/categories/kormi-syllabus" className="hover:text-primary transition">কর্মী সিলেবাস</Link>
              </li>
              <li>
                <Link to="/categories/sathi-syllabus" className="hover:text-primary transition">সাথী সিলেবাস</Link>
              </li>
              <li>
                <Link to="/categories/shodosho-syllabus" className="hover:text-primary transition">সদস্য সিলেবাস</Link>
              </li>
            </ul>
          </div>

          {/* Library Services */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-brand-text border-b border-brand-border pb-2">
              সেবাসমূহ
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <Link to="/hard-copy" className="hover:text-primary transition">হার্ড কপি ধার করুন</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-primary transition">সংগঠনের ইতিহাস</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition">ইউজার ড্যাশবোর্ড</Link>
              </li>
              <li>
                <Link to="/my-archive" className="hover:text-primary transition">ধার আর্কাইভ</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition">লাইব্রেরির নীতিমালা</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-brand-text border-b border-brand-border pb-2">
              যোগাযোগ ও সহায়তা
            </h4>
            <div className="space-y-2.5 text-sm text-brand-muted">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>UIU ক্যাম্পাস সংলগ্ন, ভাটারা, ঢাকা-১২১২</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>uiu.shibir.library@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+৮৮০ ১৭১২-XXXXXX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-3">
          <p>© {new Date().getFullYear()} শিবির লাইব্রেরি, UIU থানা। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            শহীদি কাফেলার দ্বীনি শিক্ষা ও জ্ঞান বিস্তার কার্যক্রম
          </p>
        </div>
      </div>
    </footer>
  );
};
