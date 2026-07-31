import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Star,
  Download,
  Search,
  Filter,
  Heart,
  CheckCircle2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { mockTemplates } from '../data/mockData';

export default function ResumeTemplatesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const categories = ['All', 'Tech', 'Executive', 'Minimal', 'Design', 'Academic', 'Creative'];

  const filteredTemplates = mockTemplates.filter((tmpl) => {
    const matchesCat = selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesSearch =
      tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = !favoritesOnly || tmpl.isFavorite;
    return matchesCat && matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
            ATS-TESTED LAYOUTS
          </span>
        </div>
        <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
          Professional Resume Templates
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Hand-crafted, single and multi-column designs optimized for top ATS parsers (Workday, Greenhouse, Lever).
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0B192C] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#0B192C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Search Input & Favorites Toggle */}
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            {/* Preview Banner Box */}
            <div className="relative h-56 bg-slate-100 overflow-hidden border-b border-slate-200/80">
              <img
                src={tmpl.previewImage}
                alt={tmpl.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <button
                  onClick={() => navigate('/editor')}
                  className="w-full bg-white hover:bg-slate-50 text-[#0B192C] font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} className="text-blue-600" />
                  <span>Use This Template</span>
                </button>
              </div>

              {tmpl.badge && (
                <span className="absolute top-3 left-3 bg-[#0B192C] text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded-full shadow-md">
                  {tmpl.badge}
                </span>
              )}
            </div>

            {/* Template Info Content */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                  {tmpl.name}
                </h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
                  {tmpl.category}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {tmpl.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={14} fill="currentColor" />
                  <span>{tmpl.rating}</span>
                </div>
                <span>{(tmpl.downloads / 1000).toFixed(1)}k uses</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
