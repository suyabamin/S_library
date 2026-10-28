import { Syllabus } from '../types';

export const INITIAL_SYLLABUSES: Syllabus[] = [
  // 1. School Syllabus (স্কুলপাঠ্য - Reference: https://www.icsbook.info/school-syllabus)
  {
    id: 'syl-school',
    title: 'স্কুলপাঠ্য (স্কুল সিলেবাস)',
    slug: 'school-syllabus',
    categorySlug: 'school-syllabus',
    subtitle: 'স্কুল ও কিশোর শিক্ষার্থীদের মৌলিক জ্ঞানার্জন ও চরিত্র গঠনের সহায়ক সিলেবাস',
    description:
      'স্কুল পর্যায়ের শিক্ষার্থীদের জন্য কুরআন, হাদিস, ইসলামের মৌলিক বিশ্বাস এবং নৈতিক গুণাবলি অর্জনের লক্ষ্যে প্রণীত বিশেষ পঠন ও অধ্যয়ন নির্দেশিকা।',
    notice:
      'বিসমিল্লাহির রাহমানির রাহিম — পবিত্র কুরআনের আয়াত ও সহীহ সুন্নাহর আলোকে এই গ্রন্থতালিকা দ্বীনের বনিয়াদি জ্ঞানার্জনে অনন্য ভূমিকা পালন করবে ইনশাআল্লাহ।',
    downloadUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/syllabus/school-syllabus.pdf',
    bannerUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop',
    lastUpdated: '২০২৬-০১-১৫',
    status: 'published',
    schemaVersion: 1,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-15T12:00:00Z',
    publishedAt: '2026-01-01T10:00:00Z',
    sections: [
      {
        id: 'sec-school-1',
        title: 'আল কুরআন',
        description: 'কুরআনুল কারীম সহীহভাবে তিলাওয়াত ও মৌলিক সূরা অনুধাবন',
        objectives: [
          'শুদ্ধভাবে মাখরাজ ও তাজবিদ সহকারে কুরআন পড়তে চেষ্টা করা।',
          'কুরআন সংক্রান্ত প্রাথমিক জ্ঞানার্জন ও গুরুত্ব অনুধাবন করা।',
          '১০টি সূরা বিশুদ্ধভাবে মুখস্থ করা: সূরা আল-ফিল থেকে সূরা আন-নাস।',
          'অর্থসহ নিয়মিত তিলাওয়াত: ৩০তম পারা (আমপারা)।',
        ],
        studyInstructions:
          'প্রতিদিন ফজরের পর অর্থসহ অন্তত এক রুকু তিলাওয়াত করার অভ্যাস গড়ে তুলতে হবে এবং নির্ধারিত সূরাগুলোর অর্থ ও শিক্ষা মুখস্থ করতে হবে।',
        notes: 'তাজবীদ শেখার জন্য স্থানীয় শিক্ষকের সহযোগিতা নেওয়া যেতে পারে।',
        order: 1,
        resourceGroups: [
          {
            id: 'grp-school-1-1',
            title: 'পাঠ্যবই',
            order: 1,
            items: [
              {
                id: 'res-s1-1',
                title: '৩০তম পারা — ১৯তম খণ্ড (তাফহীমুল কুরআন)',
                author: 'সাইয়েদ আবুল আ’লা মওদূদী (রহ.)',
                publisher: 'আধুনিক প্রকাশনী',
                description: '৩০তম পারার সংক্ষিপ্ত ও সাবলীল অনুবাদ এবং শানে নুযূলসহ প্রাঞ্জল ব্যাখ্যা।',
                externalUrl: 'https://www.icsbook.info/book/tafheem-30th-para',
                internalBookId: 'book-1',
                order: 1,
              },
              {
                id: 'res-s1-2',
                title: 'তাফহীমুল কুরআনের সার-সংক্ষেপ',
                author: 'অধ্যাপক গোলাম আযম',
                publisher: 'বাংলাদেশ ইসলামিক সেন্টার',
                description: 'কুরআনুল কারীমের মূল বক্তব্য ও জীবনবিধানের সংক্ষিপ্ত নির্যাস।',
                order: 2,
              },
            ],
          },
          {
            id: 'grp-school-1-2',
            title: 'অধ্যয়ন ও তাজবীদ',
            order: 2,
            items: [
              {
                id: 'res-s1-3',
                title: 'তা’লীমুল কুরআন',
                author: 'ইসলামিক এডুকেশন সোসাইটি',
                publisher: 'আইইএস',
                description: 'সহজ পদ্ধতিতে কুরআন শেখার প্রাথমিক নিয়ম ও মাখরাজ অনুশীলন।',
                externalUrl: 'https://www.icsbook.info/book/talimul-quran',
                order: 1,
              },
              {
                id: 'res-s1-4',
                title: 'সহজ নূরানী কায়দা',
                author: 'মাওলানা নূর মোহাম্মদ আজমী',
                description: 'বিশুদ্ধ উচ্চারণ শিক্ষার বুনিয়াদি সহায়িকা।',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-school-2',
        title: 'আল হাদিস',
        description: 'দৈনন্দিন জীবনে প্রয়োজনীয় সহীহ হাদিস ও আখলাক শিক্ষা',
        objectives: [
          'হাদিস সম্পর্কে প্রাথমিক ধারণা লাভ করা।',
          'ঈমান, ইসলাম, সালাত, পিতা-মাতার হক ও জ্ঞানার্জনের ওপর নির্বাচিত ২০টি হাদিস মুখস্থ করা।',
          'দৈনন্দিন দোয়া ও সুন্নাত অনুযায়ী জীবন পরিচালনার মানসিকতা গড়ে তোলা।',
        ],
        studyInstructions: 'নির্বাচিত হাদিসগুলো অর্থসহ ডায়েরিতে লিখে মুখস্থ করে দৈনন্দিন আচরণে প্রয়োগ করুন।',
        order: 2,
        resourceGroups: [
          {
            id: 'grp-school-2-1',
            title: 'পাঠ্যবই ও হাদিস সংকলন',
            order: 1,
            items: [
              {
                id: 'res-s2-1',
                title: 'ছোটদের হাদিস পাঠ',
                author: 'মাওলানা আবুল কালাম আজাদ',
                publisher: 'খায়রুন প্রকাশনী',
                description: 'কিশোর শিক্ষার্থীদের জন্য নির্বাচিত ৪০টি হাদিসের বঙ্গানুবাদ ও ব্যাখ্যা।',
                internalBookId: 'book-2',
                order: 1,
              },
              {
                id: 'res-s2-2',
                title: 'রাহে আমল (১ম খণ্ড)',
                author: 'মাওলানা মুহাম্মদ জলিল আহমদ',
                description: 'আখলাক ও ইবাদত সংক্রান্ত জরুরি হাদিসসমূহের বিষয়ভিত্তিক সংকলন।',
                externalUrl: 'https://www.icsbook.info/book/rahe-amal-part1',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-school-3',
        title: 'ইসলামী জীবনাদর্শ ও নৈতিকতা',
        description: 'ঈমান, চরিত্র গঠন ও আদব-কায়দা সংক্রান্ত সহায়ক পাঠ',
        objectives: [
          'ইসলামের মৌলিক ৫টি স্তম্ভ ও আকীদা সম্পর্কে স্পষ্ট ধারণা লাভ।',
          'সত্যবাদিতা, সময়নিষ্ঠা ও গুরুজনদের সম্মান প্রদর্শনের অনুশীলন।',
          'মোবাইল ও ইন্টারনেটের ইতিবাচক ব্যবহার ও অপচয় পরিহার।',
        ],
        order: 3,
        resourceGroups: [
          {
            id: 'grp-school-3-1',
            title: 'অধ্যয়ন তালিকা',
            order: 1,
            items: [
              {
                id: 'res-s3-1',
                title: 'ইসলামী জীবনপদ্ধতি',
                author: 'সাইয়েদ আবুল আ’লা মওদূদী (রহ.)',
                description: 'জীবনের প্রতিটি ক্ষেত্রে ইসলামের সুমহান আদর্শের ভূমিকা।',
                externalUrl: 'https://www.icsbook.info/book/islamic-lifestyle',
                order: 1,
              },
              {
                id: 'res-s3-2',
                title: 'চরিত্র গঠনের মৌলিক উপাদান',
                author: 'আব্দুল হামিদ আল-বিলালী',
                description: 'আত্মশুদ্ধি ও তাকওয়া অর্জনের উপায়।',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-school-4',
        title: 'নবিজীবন ও সাহাবাচরিত',
        description: 'রাসূলুল্লাহ (সা.) ও মহামানবদের আদর্শ জীবনকথা',
        objectives: [
          'রাসূল (সা.)-এর পবিত্র সিরাত সংক্ষেপে পাঠ করা।',
          'সাহাবায়ে কেরামের ত্যাগ ও বীরত্বপূর্ণ ইতিহাস জানা।',
          'খোলাফায়ে রাশেদীনের জীবনের শিক্ষণীয় দিক উপলব্ধি করা।',
        ],
        order: 4,
        resourceGroups: [
          {
            id: 'grp-school-4-1',
            title: 'পাঠ্যতালিকা',
            order: 1,
            items: [
              {
                id: 'res-s4-1',
                title: 'নবীজীর জীবনী (ছোটদের)',
                author: 'ড. রাগেব সারজানী',
                description: 'সরল ভাষায় রচিত রাসূলুল্লাহ (সা.)-এর পূর্ণাঙ্গ জীবনী।',
                order: 1,
              },
              {
                id: 'res-s4-2',
                title: 'আসহাবে রাসুলের জীবনকথা (১ম খণ্ড)',
                author: 'মুহাম্মদ আব্দুল মা’বুদ',
                publisher: 'বাংলাদেশ ইসলামিক সেন্টার',
                description: 'বিশিষ্ট সাহাবিদের ঈমান ও কুরবানির ঐতিহাসিক চিত্র।',
                externalUrl: 'https://www.icsbook.info/book/ashabe-rasul-part1',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-school-5',
        title: 'ক্যারিয়ার ও দক্ষতা উন্নয়ন',
        description: 'একাডেমিক সাফল্য, ভাষা শিক্ষা ও সাধারণ জ্ঞান',
        objectives: [
          'একাডেমিক পড়ালেখায় ভালো ফলাফল নিশ্চিত করা।',
          'বাংলা ও ইংরেজি ভাষায় মৌলিক দক্ষতা ও যোগাযোগের সক্ষমতা বৃদ্ধি।',
          'আইসিটি ও কম্পিউটারের মৌলিক বিষয়াবলি রপ্ত করা।',
        ],
        order: 5,
        resourceGroups: [
          {
            id: 'grp-school-5-1',
            title: 'সহায়ক নির্দেশিকা',
            order: 1,
            items: [
              {
                id: 'res-s5-1',
                title: 'ছাত্রজীবনের লক্ষ্য ও আদর্শ',
                author: 'আব্দুস শহীদ নাসিম',
                description: 'ছাত্রদের নিয়মানুবর্তিতা ও অধ্যবসায় গঠনের সহায়ক বই।',
                order: 1,
              },
              {
                id: 'res-s5-2',
                title: 'পড়ালেখার বৈজ্ঞানিক কৌশল',
                author: 'মুহাম্মদ যাইনুল আবেদীন',
                description: 'স্মৃতিশক্তি ও মনোযোগ বাড়ানোর উপায়।',
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },

  // 2. Kormi Syllabus (কর্মী সিলেবাস)
  {
    id: 'syl-kormi',
    title: 'কর্মী সিলেবাস',
    slug: 'kormi-syllabus',
    categorySlug: 'kormi-syllabus',
    subtitle: 'সংগঠনের তৃণমূল কর্মীদের ঈমান, আনুগত্য ও দায়িত্বশীলতা বৃদ্ধির সিলেবাস',
    description:
      'কর্মী স্তরের দায়িত্বশীল ভাইদের জন্য ইসলামী আন্দোলনের মেজাজ গঠন, আত্মশুদ্ধি, সাংগঠনিক বুনিয়াদী জ্ঞান ও দাওয়াতি দক্ষতার পঠন কাঠামো।',
    notice: 'কর্মী সিলেবাসের প্রতিটি গ্রন্থ অন্তত একবার গভীর মনোযোগসহ অধ্যয়ন করা আবশ্যক।',
    downloadUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/syllabus/kormi-syllabus.pdf',
    bannerUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop',
    lastUpdated: '২০২৬-০১-২০',
    status: 'published',
    schemaVersion: 1,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
    publishedAt: '2026-01-01T10:00:00Z',
    sections: [
      {
        id: 'sec-kormi-1',
        title: 'আল কুরআন ও তাফসীর',
        description: 'কুরআনের নির্বাচিত অংশের গভীর অনুধাবন ও তাফসীর অধ্যয়ন',
        objectives: [
          'সূরা আল-বাকারা ও সূরা আলে ইমরানের নির্বাচিত রুকুর তাফসীর অধ্যয়ন।',
          'সূরা আল-মুলক ও সূরা আল-ওয়াকিয়া অর্থসহ মুখস্থকরণ।',
          'কুরআনের নির্দেশাবলী নিজ জীবনে বাস্তবায়নের সংকল্প।',
        ],
        order: 1,
        resourceGroups: [
          {
            id: 'grp-kormi-1-1',
            title: 'পাঠ্যবই',
            order: 1,
            items: [
              {
                id: 'res-k1-1',
                title: 'তাফহীমুল কুরআন (নির্বাচিত অংশ)',
                author: 'সাইয়েদ আবুল আ’লা মওদূদী (রহ.)',
                publisher: 'আধুনিক প্রকাশনী',
                description: 'সমকালীন প্রেক্ষাপটে কুরআনের বৈপ্লবিক দাওয়াত।',
                internalBookId: 'book-1',
                order: 1,
              },
              {
                id: 'res-k1-2',
                title: 'কুরআনের চারটি মৌলিক পরিভাষা',
                author: 'সাইয়েদ আবুল আ’লা মওদূদী (রহ.)',
                description: 'ইলাহ, রব, ইবাদাত ও দ্বীন পরিভাষার বিশদ ব্যাখ্যা।',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-kormi-2',
        title: 'আল হাদিস',
        description: 'রাসূলুল্লাহ (সা.)-এর বাণী ও সাংগঠনিক আনুগত্যের হাদিসসমূহ',
        objectives: [
          'রিয়াদুস সলেহীনের নির্বাচিত অধ্যায়সমূহ নিয়মিত পাঠ।',
          'জামায়াতবদ্ধ জীবন ও আমীর আনুগত্যের অপরিহার্য হাদিসসমূহ আত্মস্থ করা।',
        ],
        order: 2,
        resourceGroups: [
          {
            id: 'grp-kormi-2-1',
            title: 'অধ্যয়ন তালিকা',
            order: 1,
            items: [
              {
                id: 'res-k2-1',
                title: 'রিয়াদুস সলেহীন (১ম খণ্ড)',
                author: 'ইমাম আন-নববী (রহ.)',
                description: 'জীবনঘনিষ্ঠ হাদিসের প্রামাণ্য সংকলন।',
                internalBookId: 'book-2',
                order: 1,
              },
              {
                id: 'res-k2-2',
                title: 'ইসলামী আন্দোলনের কর্মীদের নৈতিক প্রস্তুতি',
                author: 'মাওলানা মওদূদী',
                description: 'কর্মী হিসেবে আত্মগঠনের নির্দেশিকা।',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-kormi-3',
        title: 'ইসলামী আন্দোলন ও দাওয়াত',
        description: 'আন্দোলনের রূপরেখা, দাওয়াতি কৌশল ও ত্যাগ',
        objectives: [
          'ইসলামী সমাজ বিনির্মাণে ছাত্রসমাজের দায়িত্ব উপলব্ধি।',
          'ব্যক্তিগত যোগাযোগ ও বন্ধুত্বের মাধ্যমে দাওয়াত পৌঁছানোর কৌশল রপ্ত।',
        ],
        order: 3,
        resourceGroups: [
          {
            id: 'grp-kormi-3-1',
            title: 'পাঠ্যতালিকা',
            order: 1,
            items: [
              {
                id: 'res-k3-1',
                title: 'ইসলামী দাওয়াত ও কর্মনীতি',
                author: 'মুহাম্মদ কামারুজ্জামান',
                description: 'ছাত্রশিবিরের কর্মনীতি ও কর্মসূচির ব্যাখ্যা।',
                order: 1,
              },
              {
                id: 'res-k3-2',
                title: 'ইসলামী আন্দোলনের পথ ও পাথেয়',
                author: 'সাইয়েদ কুতুব শহীদ',
                description: 'সত্যের পথে চলা নির্ভীক কাফেলার দিশারি।',
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },

  // 3. Sathi Syllabus (সাথী সিলেবাস)
  {
    id: 'syl-sathi',
    title: 'সাথী সিলেবাস',
    slug: 'sathi-syllabus',
    categorySlug: 'sathi-syllabus',
    subtitle: 'সাথী স্তরের দায়িত্বশীলদের দ্বীনি প্রজ্ঞা, সাংগঠনিক দক্ষতা ও নেতৃত্বের সিলেবাস',
    description:
      'সাথী ভাইদের নেতৃত্ব বিকাশ, গভীরতর ফিকহী জ্ঞান, বিশ্বরাজনীতি ও সমাজ বিশ্লেষণের সক্ষমতা অর্জনের সিলেবাস।',
    downloadUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/syllabus/sathi-syllabus.pdf',
    bannerUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop',
    lastUpdated: '২০২৬-০১-১৮',
    status: 'published',
    schemaVersion: 1,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
    publishedAt: '2026-01-01T10:00:00Z',
    sections: [
      {
        id: 'sec-sathi-1',
        title: 'আল কুরআন ও ইসলামী ফিকহ',
        description: 'বিধানভিত্তিক আয়াতসমূহ ও ফিকহের মূলনীতি',
        objectives: [
          'কুরআনের আহকাম বিষয়ক সূরাগুলোর প্রেক্ষাপট ও বিধান অনুধাবন।',
          'ফিকহুল ইসলামী ও শরীয়তের উদ্দেশ্যসমূহ অনুধাবন।',
        ],
        order: 1,
        resourceGroups: [
          {
            id: 'grp-sathi-1-1',
            title: 'পাঠ্যবই',
            order: 1,
            items: [
              {
                id: 'res-st1-1',
                title: 'ফী যিলালিল কুরআন (নির্বাচিত খণ্ড)',
                author: 'সাইয়েদ কুতুব শহীদ',
                description: 'কুরআনের ছায়াতলে বৈপ্লবিক জীবনবোধ।',
                order: 1,
              },
              {
                id: 'res-st1-2',
                title: 'ইসলামের অর্থনৈতিক ব্যবস্থা',
                author: 'সাইয়েদ আবুল আ’লা মওদূদী (রহ.)',
                description: 'সুদহীন অর্থনীতির রূপরেখা ও ইসলামি ব্যাংকিং।',
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'sec-sathi-2',
        title: 'ইতিহাস, রাজনীতি ও সমকালীন বিশ্ব',
        description: 'খেলাফতের ইতিহাস ও আন্তর্জাতিক রাজনৈতিক প্রেক্ষাপট',
        objectives: [
          'ইসলামী খেলাফতের উত্থান ও পতনের কারণ বিশ্লেষণ।',
          'মুসলিম বিশ্বের সংকট, সম্ভাবনা ও যুব সমাজের করণীয় চিহ্নিতকরণ।',
        ],
        order: 2,
        resourceGroups: [
          {
            id: 'grp-sathi-2-1',
            title: 'অধ্যয়ন তালিকা',
            order: 1,
            items: [
              {
                id: 'res-st2-1',
                title: 'খেলাফত ও রাজতন্ত্র',
                author: 'সাইয়েদ আবুল আ’লা মওদূদী (রহ.)',
                description: 'ইসলামী শাসনব্যবস্থার রূপরেখা ও ঐতিহাসিক বিবর্তন।',
                order: 1,
              },
              {
                id: 'res-st2-2',
                title: 'মুসলিম উম্মাহর ইতিহাস ও বিপ্লব',
                author: 'আকবর শাহ নজিবাবাদী',
                description: 'উম্মাহর বিজয়ের ঐতিহাসিক কালপঞ্জি।',
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },

  // 4. Shodosho Syllabus (সদস্য সিলেবাস)
  {
    id: 'syl-shodosho',
    title: 'সদস্য সিলেবাস',
    slug: 'shodosho-syllabus',
    categorySlug: 'shodosho-syllabus',
    subtitle: 'সংগঠনের পূর্ণাঙ্গ সদস্যদের তাত্ত্বিক ব্যুৎপত্তি ও জীবনব্যাপী সাধনার সিলেবাস',
    description:
      'সদস্য ভাইদের জন্য ইসলামি দর্শন, রাষ্ট্রচিন্তা, আন্তর্জাতিক সম্পর্ক ও ইজতিহাদের বুনিয়াদী জ্ঞান কাঠামো।',
    downloadUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/syllabus/shodosho-syllabus.pdf',
    bannerUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop',
    lastUpdated: '২০২৬-০১-১২',
    status: 'published',
    schemaVersion: 1,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
    publishedAt: '2026-01-01T10:00:00Z',
    sections: [
      {
        id: 'sec-shod-1',
        title: 'উসূলে তাফসীর ও উসূলে ফিকহ',
        description: 'ইসলামী আইনশাস্ত্র ও নীতিমালার গভীরে প্রবেশ',
        objectives: [
          'উসূলে ফিকহ ও মাকাসিদুশ শরীয়ার মূল দর্শন আয়ত্ত করা।',
          'সমকালীন সামাজিক ও অর্থনৈতিক সংকটের ইসলামি সমাধান অনুসন্ধান।',
        ],
        order: 1,
        resourceGroups: [
          {
            id: 'grp-shod-1-1',
            title: 'পাঠ্যবই ও গবেষণা গ্রন্থ',
            order: 1,
            items: [
              {
                id: 'res-sh1-1',
                title: 'ইসলামী রাষ্ট্র ও সংবিধান',
                author: 'সাইয়েদ আবুল আ’লা মওদূদী (রহ.)',
                description: 'আধুনিক যুগে ইসলামী রাষ্ট্রের শাসনপদ্ধতি ও খসড়া সংবিধান।',
                order: 1,
              },
              {
                id: 'res-sh1-2',
                title: 'ইসলামে মানবসম্পদ উন্নয়ন ও নৈতিক নেতৃত্ব',
                author: 'খুররম জাহ মুরাদ',
                description: 'নেতৃত্ব ও সাংগঠনিক প্রজ্ঞার মৌলিক পাঠ।',
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },

  // 5. Higher Syllabus (উচ্চতর সিলেবাস)
  {
    id: 'syl-higher',
    title: 'উচ্চতর সিলেবাস',
    slug: 'higher-syllabus',
    categorySlug: 'higher-syllabus',
    subtitle: 'উচ্চশিক্ষা, ইসলামাইজেশন অফ নলেজ ও গবেষণাধর্মী পঠন সিলেবাস',
    description:
      'বিশ্ববিদ্যালয় শিক্ষার্থী ও গবেষকদের জন্য প্রাচ্যতত্ত্বের খণ্ডন, জ্ঞানের ইসলামীকরণ ও আধুনিক দর্শনের পর্যালোচনামূলক সিলেবাস।',
    downloadUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/syllabus/higher-syllabus.pdf',
    bannerUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop',
    lastUpdated: '২০২৬-০১-১০',
    status: 'published',
    schemaVersion: 1,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    publishedAt: '2026-01-01T10:00:00Z',
    sections: [
      {
        id: 'sec-high-1',
        title: 'জ্ঞানের ইসলামীকরণ ও দর্শন',
        description: 'পাশ্চাত্য দর্শন পর্যালোচনা ও ইসলামী চিন্তা পুনর্গঠন',
        objectives: [
          'আধুনিক বস্তুবাদ ও ধর্মনিরপেক্ষতাবাদের দার্শনিক ত্রুটি অনুধাবন।',
          'বিজ্ঞান, অর্থনীতি ও রাষ্ট্রবিজ্ঞানে ইসলামী দর্শনের ভিত্তি স্থাপন।',
        ],
        order: 1,
        resourceGroups: [
          {
            id: 'grp-high-1-1',
            title: 'পাঠ্যতালিকা',
            order: 1,
            items: [
              {
                id: 'res-hg1-1',
                title: 'ইসলাম ও আধুনিক অর্থনৈতিক চ্যালেঞ্জ',
                author: 'ড. উমর চাপরা',
                description: 'ইসলামি অর্থনীতির তুলনামূলক বিশ্লেষণ।',
                order: 1,
              },
              {
                id: 'res-hg1-2',
                title: 'জ্ঞানের ইসলামীকরণ রূপরেখা',
                author: 'ড. ইসমাইল রাজী আল-ফারূকী',
                description: 'উচ্চশিক্ষায় ইসলামী দর্শন প্রয়োগের ম্যানিফেস্টো।',
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },

  // 6. Syllabus Books (সিলেবাস বই)
  {
    id: 'syl-books',
    title: 'সিলেবাস বই সামগ্রী',
    slug: 'syllabus-books',
    categorySlug: 'syllabus-books',
    subtitle: 'সকল স্তরের সিলেবাসভুক্ত বই ও নির্দেশনাবলীর সমন্বিত সংগ্রহশালা',
    description:
      'স্কুল থেকে শুরু করে সদস্য ও উচ্চতর সিলেবাস পর্যন্ত সকল পাঠ্য ও সহায়ক বইয়ের একক তথ্যভাণ্ডার ও রিডিং হাব।',
    downloadUrl: 'https://pub-315d764fbe404bb692491d79b0e4a660.r2.dev/syllabus/all-syllabus-books-index.pdf',
    bannerUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200&auto=format&fit=crop',
    lastUpdated: '২০২৬-০১-২৫',
    status: 'published',
    schemaVersion: 1,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
    publishedAt: '2026-01-01T10:00:00Z',
    sections: [
      {
        id: 'sec-bk-1',
        title: 'মৌলিক সিলেবাস বইয়ের ক্যাটালগ',
        description: 'শাখায় সংরক্ষিত ডিজিটাল ও হার্ডকপি সিলেবাস বইসমূহ',
        objectives: [
          'সহজেই যে কোনো স্তরের সিলেবাস বই খুঁজে পাওয়া ও পড়া।',
          'লাইব্রেরি থেকে হার্ড কপি ধার নেওয়া বা অনলাইনে পড়ার সুবিধা নেওয়া।',
        ],
        order: 1,
        resourceGroups: [
          {
            id: 'grp-bk-1-1',
            title: 'সর্বাধিক পঠিত সিলেবাস বই',
            order: 1,
            items: [
              {
                id: 'res-b1-1',
                title: 'তাফসীর ইবনে কাসীর (১ম খণ্ড)',
                author: 'আল্লামা ইমাদউদ্দীন ইবনে কাসীর (রহ.)',
                description: 'প্রামাণ্য তাফসীর গ্রন্থ।',
                internalBookId: 'book-1',
                order: 1,
              },
              {
                id: 'res-b1-2',
                title: 'সহীহ বুখারী শরীফ (পূর্ণাঙ্গ)',
                author: 'ইমাম মুহাম্মদ বিন ইসমাইল আল-বুখারী (রহ.)',
                description: 'সর্বাধিক বিশুদ্ধ হাদিস সংকলন।',
                internalBookId: 'book-2',
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
];
