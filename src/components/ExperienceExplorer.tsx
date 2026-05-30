import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Filter, MapPin, Compass, Clock, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { extraExperiences, ExperienceListing } from '../data/extraExperiences';
import CalcomScheduler from './CalcomScheduler';

interface ExperienceExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExperienceExplorer({ isOpen, onClose }: ExperienceExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ExperienceListing | null>(null);

  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'craft', label: '職人・手仕事' },
    { key: 'nature', label: '自然・半野生' },
    { key: 'silence', label: '静寂・作法' },
    { key: 'culinary', label: '発酵・醸造' },
    { key: 'maritime', label: '潮風・沿岸' }
  ];

  // Filter listings
  const filteredListings = extraExperiences.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rhythmDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 w-full h-full z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-md pointer-events-auto"
          />

          {/* Drawer Wrapper */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 180 }}
            className="relative w-full max-w-2xl sm:max-w-3xl h-full bg-[#0a0a0a] border-l border-white/5 p-6 sm:p-10 overflow-y-auto z-10 flex flex-col justify-between pointer-events-auto font-serif"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
              title="閉じる"
            >
              <X size={20} />
            </button>

            {/* Back to list state inside drawer (if item selected) */}
            {selectedItem ? (
              <div className="mt-8 flex-grow">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex items-center gap-2 text-[10px] text-[#bf9a62]/80 hover:text-white mb-6 uppercase tracking-widest border-b border-transparent hover:border-[#bf9a62]/40 pb-0.5"
                >
                  <ArrowLeft size={12} /> 一覧へ戻る
                </button>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] tracking-[0.3em] text-[#bf9a62] block mb-2">
                      {selectedItem.categoryLabel}
                    </span>
                    <h3 className="text-2xl sm:text-3xl text-white font-light tracking-[0.15em] mb-4">
                      {selectedItem.title}
                    </h3>

                    {/* Metas */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#8ea499] border-b border-white/5 pb-4">
                      <span className="flex items-center gap-1.5 font-light">
                        <MapPin size={12} className="text-[#bf9a62]" /> {selectedItem.location}
                      </span>
                      <span className="flex items-center gap-1.5 font-light">
                        <Compass size={12} className="text-[#bf9a62]" /> 達人: {selectedItem.hostName}
                      </span>
                      <span className="flex items-center gap-1.5 font-light">
                        <Clock size={12} className="text-[#bf9a62]" /> 基本日程: {selectedItem.duration}
                      </span>
                      <span className="flex items-center gap-1.5 font-light text-[#bf9a62]">
                        <BookOpen size={12} /> 滞在価格: {selectedItem.pricePerDay}
                      </span>
                    </div>
                  </div>

                  {/* Intro */}
                  <div className="text-xs sm:text-[13px] text-slate-300 tracking-[0.15em] leading-[2.0] bg-white/[0.01] border border-white/5 p-4 sm:p-5 rounded">
                    <p className="font-light">{selectedItem.rhythmDescription}</p>
                  </div>

                  {/* Itinerary steps */}
                  <div className="space-y-4">
                    <h4 className="text-xs tracking-[0.25em] text-[#bf9a62] border-b border-white/5 pb-2 uppercase">
                      同調設計される日課の例 (Itinerary)
                    </h4>
                    <div className="space-y-3 font-serif">
                      {selectedItem.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex border-l border-[#bf9a62]/20 pl-4 py-0.5 text-xs text-slate-300 font-light leading-relaxed">
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive cal.com reservation scheduler */}
                  <div className="mt-8 pt-4">
                    <CalcomScheduler 
                      experienceTitle={selectedItem.title} 
                      defaultSlots={selectedItem.slots} 
                      location={selectedItem.location} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Main Grid list browse state
              <div className="mt-8 flex-grow flex flex-col h-full">
                <div className="mb-6">
                  <span className="text-[10px] tracking-[0.3em] text-[#bf9a62] block mb-2 uppercase">
                    Hitotoki Life Experience Pool
                  </span>
                  <h3 className="text-2xl font-light text-white tracking-[0.16em] mb-4">
                    全国に広がる、他者の日常
                  </h3>
                  <p className="text-[11px] text-[#8ea499] tracking-wider leading-relaxed font-light mb-8 max-w-xl">
                    三つのフラッグシップ広告に留まらず、私たちのプラットフォームには全国の職人・隠者・生産者が独自の時間を預けています。
                    カテゴリーや地域を選択し、その生活リズムにそっと加わる「ひととき」をお探しください。
                  </p>

                  {/* Search and Filter Area */}
                  <div className="space-y-4 border-b border-white/5 pb-6">
                    {/* Search Field */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-3.5 text-white/30" />
                      <input
                        type="text"
                        placeholder="職人、地域、または生活様式で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#bf9a62] transition-colors"
                      />
                    </div>

                    {/* Category quick selectors */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setSelectedCategory(cat.key)}
                          className={`
                            px-3 py-1.5 rounded text-[10px] tracking-widest transition-all
                            ${selectedCategory === cat.key
                              ? 'bg-[#bf9a62]/10 border border-[#bf9a62] text-[#f7e0bc]'
                              : 'bg-white/[0.01] border border-white/5 text-white/50 hover:text-white hover:border-white/20'
                            }
                          `}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid of items */}
                <div className="flex-grow overflow-y-auto pr-1 max-h-[50vh] sm:max-h-[55vh] space-y-4">
                  {filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredListings.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="p-5 bg-white/[0.01] border border-white/5 hover:border-[#bf9a62]/40 hover:bg-[#bf9a62]/[0.02] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(191,154,98,0.1)] rounded flex flex-col justify-between transform transition-all duration-500 cursor-pointer group"
                        >
                          <div>
                            <span className="text-[9px] text-[#bf9a62] tracking-[0.2em] block mb-1 uppercase">
                              {item.categoryLabel}
                            </span>
                            <h4 className="text-sm font-light text-white tracking-widest group-hover:text-[#f7e0bc] transition-colors mb-3">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-[#8ea499] tracking-wider leading-relaxed font-light line-clamp-2 mb-4">
                              {item.rhythmDescription}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] text-white/40 group-hover:text-white transition-colors">
                            <span className="flex items-center gap-1">
                              <MapPin size={9} /> {item.location}
                            </span>
                            <span className="text-[#bf9a62] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              詳細 & 日程を確認する →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs italic tracking-widest">
                      条件に合う滞在体験が見つかりませんでした。別の検索ワードをお試しください。
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom guide */}
            <div className="mt-8 border-t border-white/5 pt-5 text-[9px] text-[#8ea499]/40 tracking-wider flex justify-between items-center font-sans">
              <span>Hitotoki Shared Experience Pool Prototype</span>
              <span>すべての個人が達人であり、すべての旅行者が同調者である。</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
