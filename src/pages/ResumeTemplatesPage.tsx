import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import { templatesConfigService } from '../services/templateConfig.service';
import { templateFavoritesService } from '../services/templateFavorites.service';
import { getPreviewResumeData } from '../components/templates/previewData';
import TemplateCard from '../components/templates/TemplateCard';
import TemplatePreviewModal from '../components/templates/TemplatePreviewModal';

const FILTERS = ['All', 'ATS', 'Fresher', 'Experienced', 'Tech', 'Minimal', 'Professional'];

export default function ResumeTemplatesPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => templateFavoritesService.getFavoriteIds());

  // Real user/draft resume data (or neutral placeholders) — the exact
  // same data every card and the preview modal render.
  const previewData = useMemo(() => getPreviewResumeData(), []);

  const allTemplates = templatesConfigService.getAllTemplates();

  const filteredTemplates = allTemplates.filter((tmpl) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      tmpl.tags.some((t) => t.toLowerCase() === selectedFilter.toLowerCase()) ||
      tmpl.resumeType.some((rt) => rt.toLowerCase() === selectedFilter.toLowerCase());

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      tmpl.name.toLowerCase().includes(q) ||
      tmpl.category.toLowerCase().includes(q) ||
      tmpl.description.toLowerCase().includes(q) ||
      tmpl.tags.some((t) => t.toLowerCase().includes(q)) ||
      tmpl.resumeType.some((rt) => rt.toLowerCase().includes(q));

    const matchesFav = !favoritesOnly || favoriteIds.includes(tmpl.id);

    return matchesFilter && matchesSearch && matchesFav;
  });

  const handleUseTemplate = (templateId: string) => {
    navigate(`/app/builder?template=${templateId}`);
  };

  const handleToggleFavorite = (templateId: string) => {
    setFavoriteIds(templateFavoritesService.toggleFavorite(templateId));
  };

  const previewTemplate = previewTemplateId ? templatesConfigService.getTemplateById(previewTemplateId) || null : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
          Choose Your Resume Layout
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Select a layout that matches your career stage and keeps your resume clear, readable, and ATS-friendly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-[#0B192C] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#0B192C]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0B192C] focus:outline-none focus:bg-white focus:border-[#0B192C] w-48 sm:w-60"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              favoritesOnly
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#0B192C]'
            }`}
            title="Toggle Favorites"
          >
            <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Templates Grid — every card is a real, rendered resume template */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              data={previewData}
              isFavorite={favoriteIds.includes(tmpl.id)}
              onToggleFavorite={() => handleToggleFavorite(tmpl.id)}
              onPreview={() => setPreviewTemplateId(tmpl.id)}
              onUse={() => handleUseTemplate(tmpl.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">No templates match your filters.</p>
        </div>
      )}

      <TemplatePreviewModal
        template={previewTemplate}
        data={previewData}
        onClose={() => setPreviewTemplateId(null)}
        onUse={handleUseTemplate}
      />
    </div>
  );
}
