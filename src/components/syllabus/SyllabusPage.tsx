import React from 'react';
import { Link } from 'react-router-dom';
import { Download, BookOpen, Target, ChevronRight, Info, Calendar, ExternalLink } from 'lucide-react';
import { Syllabus } from '../../types';
import { isValidUrl } from '../../lib/syllabusValidation';

interface SyllabusPageProps {
  syllabus: Syllabus;
}

export const SyllabusPage: React.FC<SyllabusPageProps> = ({ syllabus }) => {
  const hasValidDownload = syllabus.downloadUrl && isValidUrl(syllabus.downloadUrl);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Card */}
      <header className="bg-white rounded-card border border-brand-border card-shadow overflow-hidden">
        {syllabus.bannerUrl && isValidUrl(syllabus.bannerUrl) && (
          <div className="h-32 sm:h-48 overflow-hidden bg-primary-soft">
            <img
              src={syllabus.bannerUrl}
              alt={syllabus.title}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}
        <div className="p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text leading-snug">
                {syllabus.title}
              </h1>
              {syllabus.subtitle && (
                <p className="text-sm text-brand-muted mt-1 leading-relaxed">{syllabus.subtitle}</p>
              )}
              {syllabus.lastUpdated && (
                <p className="flex items-center gap-1.5 text-xs text-brand-muted mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  সর্বশেষ আপডেট: {syllabus.lastUpdated}
                </p>
              )}
            </div>

            {hasValidDownload && (
              <a
                href={syllabus.downloadUrl!}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm transition shrink-0 self-start"
                aria-label={`${syllabus.title} ডাউনলোড করুন`}
              >
                <Download className="w-4 h-4" />
                সম্পূর্ণ সিলেবাস ডাউনলোড
              </a>
            )}
          </div>

          {syllabus.description && (
            <p className="text-sm text-brand-text leading-relaxed border-t border-brand-border pt-3">
              {syllabus.description}
            </p>
          )}
        </div>
      </header>

      {/* Notice / Introduction Box */}
      {syllabus.notice && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed italic">{syllabus.notice}</p>
        </div>
      )}

      {/* Sections */}
      {syllabus.sections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-card border border-brand-border card-shadow">
          <BookOpen className="w-12 h-12 text-brand-muted mx-auto mb-3 opacity-50" />
          <p className="text-brand-muted">এই সিলেবাসে এখনো কোনো সেকশন যোগ করা হয়নি।</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...syllabus.sections]
            .sort((a, b) => a.order - b.order)
            .map((section, sIdx) => (
              <SyllabusSection
                key={section.id}
                section={section}
                index={sIdx + 1}
              />
            ))}
        </div>
      )}
    </article>
  );
};

// ─── Section Component ──────────────────────────────────────────────────────

interface SyllabusSectionProps {
  section: Syllabus['sections'][0];
  index: number;
}

const SyllabusSection: React.FC<SyllabusSectionProps> = ({ section, index }) => {
  const bengaliNumerals = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', '১১', '১২'];
  const num = bengaliNumerals[index - 1] ?? String(index);

  return (
    <section className="bg-white rounded-card border border-brand-border card-shadow overflow-hidden">
      {/* Section Header */}
      <div className="bg-primary-soft/60 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
            {num}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-brand-text">{section.title}</h2>
            {section.description && (
              <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{section.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Learning Objectives */}
        {section.objectives.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-brand-text flex items-center gap-1.5">
              <Target className="w-4 h-4 text-primary" />
              শিক্ষণ উদ্দেশ্যসমূহ
            </h3>
            <ul className="space-y-1.5 pl-2">
              {section.objectives.map((obj, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-brand-text leading-relaxed"
                >
                  <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Study Instructions */}
        {section.studyInstructions && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-xs font-bold text-blue-700 mb-1">অধ্যয়ন নির্দেশনা</p>
            <p className="text-sm text-blue-900 leading-relaxed">{section.studyInstructions}</p>
          </div>
        )}

        {/* Resource Groups */}
        {[...section.resourceGroups]
          .sort((a, b) => a.order - b.order)
          .map((group) => (
            <ResourceGroup key={group.id} group={group} />
          ))}

        {/* Notes */}
        {section.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-xs font-bold text-gray-600 mb-1">টীকা</p>
            <p className="text-sm text-gray-700 leading-relaxed">{section.notes}</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Resource Group Component ───────────────────────────────────────────────

interface ResourceGroupProps {
  group: Syllabus['sections'][0]['resourceGroups'][0];
}

const ResourceGroup: React.FC<ResourceGroupProps> = ({ group }) => {
  if (!group.items || group.items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-brand-text border-b border-brand-border pb-1.5">
        {group.title}
        {group.description && (
          <span className="font-normal text-brand-muted ml-2 text-xs">{group.description}</span>
        )}
      </h4>
      <ol className="space-y-3">
        {[...group.items]
          .sort((a, b) => a.order - b.order)
          .map((item, idx) => (
            <ResourceItem key={item.id} item={item} index={idx + 1} />
          ))}
      </ol>
    </div>
  );
};

// ─── Resource Item Component ─────────────────────────────────────────────────

interface ResourceItemProps {
  item: Syllabus['sections'][0]['resourceGroups'][0]['items'][0];
  index: number;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ item, index }) => {
  const hasExternalLink = item.externalUrl && isValidUrl(item.externalUrl);
  const hasInternalBook = !!item.internalBookId;
  const hasDownload = item.downloadUrl && isValidUrl(item.downloadUrl);

  return (
    <li className="flex items-start gap-3 group">
      <span className="text-xs text-brand-muted font-bold w-5 shrink-0 pt-1 text-right">{index}.</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <span className="text-sm font-semibold text-brand-text leading-relaxed">{item.title}</span>

          {/* Internal library link */}
          {hasInternalBook && (
            <Link
              to={`/books/${item.internalBookId}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-primary bg-primary-soft hover:bg-primary/20 transition shrink-0"
              aria-label={`লাইব্রেরিতে পড়ুন: ${item.title}`}
            >
              <BookOpen className="w-3 h-3" />
              বই পড়ুন
            </Link>
          )}

          {/* External reading link (only if no internal) */}
          {!hasInternalBook && hasExternalLink && (
            <a
              href={item.externalUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-accent border border-accent/30 hover:bg-accent/10 transition shrink-0"
              aria-label={`অনলাইনে পড়ুন: ${item.title}`}
            >
              <ExternalLink className="w-3 h-3" />
              অনলাইনে পড়ুন
            </a>
          )}

          {/* Download */}
          {hasDownload && (
            <a
              href={item.downloadUrl!}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition shrink-0"
              aria-label={`ডাউনলোড করুন: ${item.title}`}
            >
              <Download className="w-3 h-3" />
              ডাউনলোড
            </a>
          )}
        </div>

        {/* Author / Publisher */}
        {(item.author || item.publisher) && (
          <p className="text-xs text-brand-muted mt-0.5">
            {item.author}
            {item.author && item.publisher && ' • '}
            {item.publisher}
          </p>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-xs text-brand-text/70 mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
    </li>
  );
};
