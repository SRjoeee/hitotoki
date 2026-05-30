import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Clock, Calendar as CalendarIcon, User, Mail, FileText } from 'lucide-react';

interface CalcomSchedulerProps {
  experienceTitle: string;
  defaultSlots?: string[];
  location: string;
  onBookingSuccess?: () => void;
}

export default function CalcomScheduler({ 
  experienceTitle, 
  defaultSlots = ['05:30 - 日の出の調律', '09:00 - 朝の同盟', '14:30 - 午後の手仕事', '19:00 - 黄昏の余白'],
  location,
  onBookingSuccess
}: CalcomSchedulerProps) {
  // Current month anchor (starting May 2026 based on mock system timestamp)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 4 = May (0-indexed)
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Month labels
  const monthNames = [
    '一月 (January)', '二月 (February)', '三月 (March)', '四月 (April)', 
    '五月 (May)', '六月 (June)', '七月 (July)', '八月 (August)', 
    '九月 (September)', '十月 (October)', '十一月 (November)', '十二月 (December)'
  ];

  // Reset selected slot and day when switching months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
    setSelectedSlot(null);
    setErrorMessage('');
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
    setSelectedSlot(null);
    setErrorMessage('');
  };

  // Generate day array
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOffset = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOffset(currentYear, currentMonth);

  // We want to simulate specific available days (e.g. odd days are available for hosting, even days are busy/inactive)
  const isDateBookable = (day: number) => {
    // Standard rule: weekends + prime mid-week days (Tues, Thurs) are available, or simple math
    const dateObj = new Date(currentYear, currentMonth, day);
    const dayOfWeek = dateObj.getDay();
    // Host is busy with their pure production on Wednesdays and standard holidays
    return dayOfWeek !== 0 && dayOfWeek !== 3; // Monday, Tuesday, Thursday, Friday, Saturday are active
  };

  const handleDaySelect = (day: number) => {
    if (!isDateBookable(day)) return;
    setSelectedDay(day);
    setSelectedSlot(null);
    setErrorMessage('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !selectedSlot) {
      setErrorMessage('ご希望の日程と時間帯を選択してください。');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setErrorMessage('お名前とメールアドレスをご記入ください。');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        const timestampString = `${currentYear}.${String(currentMonth + 1).padStart(2, '0')}.${String(selectedDay).padStart(2, '0')} ${selectedSlot}`;
        const newInquiry = {
          name,
          email,
          interest: `[Cal.com 予約受付] ${experienceTitle}`,
          notes: `【希望日時】 ${timestampString}\n【滞在場所】 ${location}\n【メッセージ】 ${notes}`,
          timestamp: new Date().toISOString()
        };

        const existing = JSON.parse(localStorage.getItem('hitotoki_inquiries') || '[]');
        existing.push(newInquiry);
        localStorage.setItem('hitotoki_inquiries', JSON.stringify(existing));

        setIsDone(true);
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      } catch (err) {
        setErrorMessage('保存中にエラーが発生しました。');
      } finally {
        setIsSubmitting(false);
      }
    }, 900);
  };

  const resetScheduler = () => {
    setSelectedDay(null);
    setSelectedSlot(null);
    setName('');
    setEmail('');
    setNotes('');
    setIsDone(false);
    setErrorMessage('');
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded p-5 sm:p-6 font-serif">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#bf9a62]" />
        <h4 className="text-xs tracking-[0.25em] text-[#bf9a62] uppercase">
          CAL.COM 予約調律システム
        </h4>
      </div>
      
      <p className="text-[11px] text-[#8ea499] tracking-wider leading-relaxed mb-6 font-light">
        達人の生活リズムと同調するための時間枠を直接予約します。稼働日は達人の作業日程（暦）に基づいて自動生成されています。
      </p>

      {isDone ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 px-4 bg-emerald-950/10 border border-emerald-900/30 rounded"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Check size={18} />
          </div>
          <h5 className="text-sm font-light text-white tracking-widest mb-2">
            予約リクエストを仮受付しました
          </h5>
          <p className="text-[11px] text-[#8ea499] leading-relaxed max-w-sm mx-auto font-light mb-6">
            ご希望の枠「{currentYear}.{currentMonth + 1}.{selectedDay} {selectedSlot}」を押さえました。
            達人に生活同調の確認を取り、追って調整連絡を差し上げます。
          </p>
          <button
            onClick={resetScheduler}
            className="text-[10px] text-[#bf9a62] hover:text-white hover:underline tracking-widest uppercase transition-colors"
          >
            別の日程枠を計画する
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Calendar Selector Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left side: Calendar Grid */}
            <div className="md:col-span-7">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-white/80 tracking-widest font-light">
                  {currentYear}年 {monthNames[currentMonth]}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1 border border-white/10 hover:bg-white/5 rounded text-white/50 hover:text-white transition-colors"
                    title="前月"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1 border border-white/10 hover:bg-white/5 rounded text-white/50 hover:text-white transition-colors"
                    title="翌月"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                  <span key={i} className={`text-[9px] tracking-wider py-1 font-sans ${i === 0 ? 'text-amber-700' : 'text-white/35'}`}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Render Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty Offsets */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="aspect-square" />
                ))}

                {/* Day Buttons */}
                {Array.from({ length: daysCount }).map((_, idx) => {
                  const day = idx + 1;
                  const playable = isDateBookable(day);
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => handleDaySelect(day)}
                      disabled={!playable}
                      className={`
                        aspect-square text-[11px] rounded transition-all flex flex-col items-center justify-center relative
                        ${!playable 
                          ? 'text-white/10 line-through cursor-not-allowed bg-transparent' 
                          : isSelected 
                            ? 'bg-[#bf9a62] text-black font-medium' 
                            : 'bg-white/[0.01] hover:bg-white/[0.08] text-white/80 border border-white/5'
                        }
                      `}
                    >
                      <span className="font-sans">{day}</span>
                      {playable && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#bf9a62]/40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Slot selector */}
            <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5">
              <span className="text-[10px] tracking-widest text-[#8ea499] block mb-3">
                {selectedDay 
                  ? `${currentYear}年 ${currentMonth + 1}月 ${selectedDay}日の空き時間枠`
                  : '暦を選択してください'
                }
              </span>

              {selectedDay ? (
                <div className="space-y-2">
                  {defaultSlots.map((slot, sIdx) => {
                    const activeSpec = selectedSlot === slot;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          w-full text-left py-2 px-3 text-[10px] tracking-widest rounded border transition-all flex justify-between items-center
                          ${activeSpec 
                            ? 'bg-[#bf9a62]/10 border-[#bf9a62] text-[#f7e0bc] font-light' 
                            : 'bg-white/[0.01] border-white/5 hover:border-white/20 text-white/60 hover:text-white'
                          }
                        `}
                      >
                        <span className="font-mono">{slot}</span>
                        <ArrowConfirmMark active={activeSpec} />
                      </button>
                    );
                  })}
                  
                  <div className="text-[9px] text-[#8ea499]/60 italic font-mono mt-3 leading-tight">
                    ※ リアルタイム稼働枠
                  </div>
                </div>
              ) : (
                <div className="h-32 border border-dashed border-white/5 rounded flex flex-col items-center justify-center text-[#8ea499]/40 text-center text-[10px]">
                  <Clock size={16} className="mb-2 text-white/10" />
                  左記カレンダーから<br />希望日を選択してください
                </div>
              )}
            </div>
          </div>

          {/* Booking Intake details */}
          <AnimatePresence>
            {selectedDay !== null && selectedSlot !== null && (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleConfirmBooking}
                className="pt-4 border-t border-white/5 space-y-4"
              >
                <div className="p-3 bg-[#bf9a62]/5 border border-[#bf9a62]/20 rounded text-[10px] text-[#f7e0bc] leading-relaxed tracking-wider">
                  <strong>選択された同調枠:</strong> {currentYear}年 {currentMonth + 1}月 {selectedDay}日 • {selectedSlot}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/25 border border-red-900/40 text-[10px] text-red-200 rounded flex gap-2 items-center leading-relaxed">
                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] tracking-widest text-[#8ea499] block mb-1">
                      お名前 *
                    </label>
                    <div className="relative">
                      <User size={11} className="absolute left-3 top-3.5 text-white/30" />
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded pl-8 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#bf9a62] transition-colors"
                        placeholder="例：佐藤 琢己"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] tracking-widest text-[#8ea499] block mb-1">
                      メールアドレス *
                    </label>
                    <div className="relative">
                      <Mail size={11} className="absolute left-3 top-3.5 text-white/30" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded pl-8 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#bf9a62] transition-colors"
                        placeholder="例：takumi@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] tracking-widest text-[#8ea499] block mb-1">
                    達人に伝えたい自己紹介や目的
                  </label>
                  <div className="relative">
                    <FileText size={11} className="absolute left-3 top-3 text-white/30" />
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-white/[0.02] border border-white/10 rounded pl-8 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#bf9a62] transition-colors resize-none"
                      placeholder="例：黒竹の繊細な技術に惹かれています。自らの指先の間覚を静かに見つめ返す体験を希望します。"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#bf9a62] hover:bg-[#a9814c] disabled:bg-slate-800 disabled:text-slate-500 text-black text-[10px] tracking-[0.2em] uppercase rounded transition-colors flex items-center justify-center gap-2 pointer-events-auto"
                >
                  {isSubmitting ? '登録処理中...' : '仮予約を確定する →'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ArrowConfirmMark({ active }: { active: boolean }) {
  return (
    <span className={`text-[10px] transition-transform ${active ? 'translate-x-0.5 text-[#bf9a62]' : 'text-white/20'}`}>
      {active ? '✓ 選択中' : '予約可能 →'}
    </span>
  );
}
