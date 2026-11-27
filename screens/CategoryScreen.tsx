import React, { useState, useMemo } from 'react';
import { CustomWordPack, GameSettings, WordDifficulty } from '../types';
import { CATEGORIES } from '../constants';
import { WORD_BANK } from '../words';
import { TRANSLATIONS } from '../translations';
import { formatTemplate, isRTLLanguage } from '../i18n';
import { dbRepo, encodeCustomPackToken } from '../database';
import { auth } from '../firebase';
import { TeamMascot } from '../components/Mascots';
import { NeonCategoryIcon } from '../components/NeonIcons';
import { sound } from '../soundManager';
import {
  Layers,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Share2,
  Download,
  Package
} from 'lucide-react';

interface Props {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenHelp: () => void;
}

const CategoryScreen: React.FC<Props> = ({ settings, onSave, onNext, onBack, onOpenHelp }) => {
  const t = TRANSLATIONS[settings.language];
  const isRTL = isRTLLanguage(settings.language);
  const allCategoryKeys = Object.keys(CATEGORIES);

  const [customPacks, setCustomPacks] = useState<CustomWordPack[]>(() => dbRepo.getCustomPacks());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newWords, setNewWords] = useState('');
  const [newDiff, setNewDiff] = useState<WordDifficulty>('easy');
  const [importToken, setImportToken] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const selectedCustomPackIds = settings.selectedCustomPackIds || [];

  // Count words per category for the chosen difficulty
  const wordCounts = useMemo(() => {
    const diff = settings.difficulty || 'easy';
    const counts: Record<string, number> = {};
    allCategoryKeys.forEach(k => { counts[k] = 0; });
    WORD_BANK.forEach(w => {
      if (diff === 'all' || w.difficulty === diff) {
        counts[w.category] = (counts[w.category] || 0) + 1;
      }
    });
    return counts;
  }, [settings.difficulty, allCategoryKeys]);

  const toggleCategory = (catKey: string) => {
    sound.playToggle();
    let selected = [...settings.selectedCategories];
    if (selected.includes(catKey)) {
      if (selected.length > 1 || selectedCustomPackIds.length > 0) {
        selected = selected.filter(s => s !== catKey);
      }
    } else {
      selected.push(catKey);
    }
    onSave({ ...settings, selectedCategories: selected });
  };

  const toggleCustomPack = (packId: string) => {
    sound.playToggle();
    const exists = selectedCustomPackIds.includes(packId);
    const nextPackIds = exists
      ? selectedCustomPackIds.filter(id => id !== packId)
      : [...selectedCustomPackIds, packId];
    onSave({ ...settings, selectedCustomPackIds: nextPackIds });
  };

  const handleSelectAll = () => {
    sound.playToggle();
    const allSelected = settings.selectedCategories.length === allCategoryKeys.length;
    onSave({
      ...settings,
      selectedCategories: allSelected ? [allCategoryKeys[0]] : allCategoryKeys
    });
  };

  const handleCreatePack = () => {
    const wordsList = newWords
      .split(/[\n,،]+/)
      .map(w => w.trim())
      .filter(Boolean);
    if (!newTitle.trim() || wordsList.length < 3) {
      setFeedbackMsg(t.minWordsPackError);
      return;
    }
    const { pack } = dbRepo.createCustomPack(
      {
        title: newTitle,
        language: settings.language,
        difficulty: newDiff,
        words: wordsList
      },
      auth.currentUser?.uid
    );
    setCustomPacks(dbRepo.getCustomPacks());
    onSave({
      ...settings,
      selectedCustomPackIds: [...selectedCustomPackIds, pack.id]
    });
    setNewTitle('');
    setNewWords('');
    setShowCreateForm(false);
    setFeedbackMsg(null);
    sound.playCorrect();
  };

  const handleDeletePack = (packId: string) => {
    sound.playClick();
    const remaining = dbRepo.deleteCustomPack(packId, auth.currentUser?.uid);
    setCustomPacks(remaining);
    if (selectedCustomPackIds.includes(packId)) {
      onSave({
        ...settings,
        selectedCustomPackIds: selectedCustomPackIds.filter(id => id !== packId)
      });
    }
  };

  const handleCopyShare = async (pack: CustomWordPack) => {
    sound.playClick();
    const token = encodeCustomPackToken(pack);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
      }
      setFeedbackMsg(t.copiedShareToken);
      setTimeout(() => setFeedbackMsg(null), 2000);
    } catch {
      setFeedbackMsg(token);
    }
  };

  const handleImportPack = () => {
    const imported = dbRepo.importCustomPackFromToken(importToken, auth.currentUser?.uid);
    if (!imported) {
      setFeedbackMsg(t.importError);
      return;
    }
    setCustomPacks(dbRepo.getCustomPacks());
    onSave({
      ...settings,
      selectedCustomPackIds: [...selectedCustomPackIds, imported.id]
    });
    setImportToken('');
    setShowImportForm(false);
    setFeedbackMsg(t.importSuccess);
    sound.playCorrect();
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const allSelected = settings.selectedCategories.length === allCategoryKeys.length;

  return (
    <div className="h-full min-h-0 flex-1 flex flex-col p-3.5 sm:p-4 select-none overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 bg-gradient-to-r from-[#7B2CBF] via-[#FF007F] to-[#FF2E93] text-white p-3 border-[3.5px] border-[#241442] rounded-2xl shadow-[4px_4px_0px_0px_#241442] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFE600] border-2 border-[#241442] flex items-center justify-center text-[#1a0833] shadow-[1px_1px_0px_0px_#241442]">
            <Layers size={18} color="#1a0833" />
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
            {t.categories_title}
          </h2>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onOpenHelp();
          }}
          className="px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-[#1a0833] border-2 border-[#241442] font-black text-xs rounded-xl shadow-[2px_2px_0px_0px_#241442] transition-transform active:translate-y-0.5 flex items-center gap-1.5"
        >
          <HelpCircle size={15} color="#1a0833" />
          <span>{t.guide}</span>
        </button>
      </div>

      {/* Hint & Select All Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <p className="flex-1 text-[#1a0833] text-[10.5px] font-black bg-white p-2 border-2 border-[#241442] rounded-xl shadow-[2px_2px_0px_0px_#241442] flex items-center gap-1.5 min-w-0">
          <Sparkles size={13} color="#FF007F" className="shrink-0" />
          <span className="truncate">{t.categoryHint}</span>
        </p>
        <button
          type="button"
          onClick={handleSelectAll}
          className="px-2.5 py-2 bg-[#00F0FF] text-[#1a0833] text-[10px] font-black rounded-xl border-2 border-[#241442] shadow-[2px_2px_0px_0px_#241442] shrink-0 active:translate-y-0.5"
        >
          {allSelected ? t.deselectAll : t.selectAll}
        </button>
      </div>

      {/* Categories & Custom Packs Scrollable Container */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-2 pb-2 overscroll-contain">
        {allCategoryKeys.map(catKey => {
          const isSelected = settings.selectedCategories.includes(catKey);
          const translatedName = t.categories[catKey] || catKey;
          const count = wordCounts[catKey] || 0;

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => toggleCategory(catKey)}
              className={`w-full p-2.5 rounded-2xl border-[3px] border-[#241442] flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FFF033] to-[#FFE600] text-[#1a0833] shadow-[3px_3px_0px_0px_#241442] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-white text-[#1a0833] shadow-[2px_2px_0px_0px_#241442] hover:bg-[#F9F0FF]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl border-2 border-[#241442] bg-[#241442] shrink-0">
                  <NeonCategoryIcon catKey={catKey} size={18} />
                </div>
                <div className="text-start min-w-0">
                  <span className="font-black text-xs sm:text-sm uppercase text-[#1a0833] block truncate">
                    {translatedName}
                  </span>
                  <span className="text-[10px] font-bold text-[#241442]/75">
                    {formatTemplate(t.wordsCountBadge, { n: count })}
                  </span>
                </div>
              </div>

              <div className={`w-7 h-7 border-2 border-[#241442] flex items-center justify-center rounded-xl shadow-[1px_1px_0px_0px_#241442] shrink-0 ${
                isSelected ? 'bg-[#241442]' : 'bg-white'
              }`}>
                {isSelected && <Check size={17} color="#39FF14" strokeWidth={3.5} />}
              </div>
            </button>
          );
        })}

        {/* Custom Word Packs Section */}
        <div className="pt-2 mt-2 border-t-2 border-dashed border-[#241442]/30 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#1a0833]">
              <Package size={15} color="#7B2CBF" />
              <span>{t.customPacksTitle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowImportForm(false);
                  setShowCreateForm(v => !v);
                  setFeedbackMsg(null);
                }}
                className="px-2 py-1 bg-[#39FF14] text-[#1a0833] text-[10px] font-black rounded-lg border-2 border-[#241442] flex items-center gap-1"
              >
                <Plus size={12} />
                <span>{t.createPackBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowCreateForm(false);
                  setShowImportForm(v => !v);
                  setFeedbackMsg(null);
                }}
                className="px-2 py-1 bg-[#00F0FF] text-[#1a0833] text-[10px] font-black rounded-lg border-2 border-[#241442] flex items-center gap-1"
              >
                <Download size={12} />
                <span>{t.importPackBtn}</span>
              </button>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-2 bg-[#FFE600] border-2 border-[#241442] rounded-xl text-[11px] font-black text-[#1a0833] text-center">
              {feedbackMsg}
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white p-3 rounded-2xl border-[3px] border-[#241442] shadow-[3px_3px_0px_0px_#241442] space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder={t.packTitlePlaceholder}
                maxLength={40}
                className="w-full p-2 bg-[#F8EFFF] border-2 border-[#241442] rounded-xl text-xs font-bold text-[#1a0833]"
              />
              <textarea
                rows={3}
                value={newWords}
                onChange={e => setNewWords(e.target.value)}
                placeholder={t.packWordsPlaceholder}
                className="w-full p-2 bg-[#F8EFFF] border-2 border-[#241442] rounded-xl text-xs font-bold text-[#1a0833]"
              />
              <div className="flex gap-1.5">
                {(['easy', 'medium', 'hard'] as WordDifficulty[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNewDiff(d)}
                    className={`flex-1 py-1 text-[10px] font-black rounded-lg border-2 border-[#241442] ${
                      newDiff === d ? 'bg-[#FFE600] text-[#1a0833]' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.difficultyLevels[d]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreatePack}
                  className="flex-1 py-1.5 bg-[#39FF14] text-[#1a0833] text-xs font-black rounded-xl border-2 border-[#241442]"
                >
                  {t.savePackBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 bg-slate-200 text-[#1a0833] text-xs font-black rounded-xl border-2 border-[#241442]"
                >
                  {t.cancelBtn}
                </button>
              </div>
            </div>
          )}

          {showImportForm && (
            <div className="bg-white p-3 rounded-2xl border-[3px] border-[#241442] shadow-[3px_3px_0px_0px_#241442] space-y-2">
              <input
                type="text"
                value={importToken}
                onChange={e => setImportToken(e.target.value)}
                placeholder={t.importTokenPlaceholder}
                className="w-full p-2 bg-[#F8EFFF] border-2 border-[#241442] rounded-xl text-xs font-mono text-[#1a0833]"
                dir="ltr"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleImportPack}
                  className="flex-1 py-1.5 bg-[#00F0FF] text-[#1a0833] text-xs font-black rounded-xl border-2 border-[#241442]"
                >
                  {t.importPackBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportForm(false)}
                  className="px-3 py-1.5 bg-slate-200 text-[#1a0833] text-xs font-black rounded-xl border-2 border-[#241442]"
                >
                  {t.cancelBtn}
                </button>
              </div>
            </div>
          )}

          {customPacks.length === 0 ? (
            <p className="text-[11px] font-bold text-slate-600 text-center py-2 bg-white/70 rounded-xl border border-dashed border-[#241442]/30">
              {t.noCustomPacks}
            </p>
          ) : (
            customPacks.map(pack => {
              const isSelected = selectedCustomPackIds.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  className={`w-full p-2.5 rounded-2xl border-[3px] border-[#241442] flex items-center justify-between gap-2 ${
                    isSelected ? 'bg-[#E7FFF3] shadow-[3px_3px_0px_0px_#241442]' : 'bg-white shadow-[2px_2px_0px_0px_#241442]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCustomPack(pack.id)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-start"
                  >
                    <div className={`w-6 h-6 border-2 border-[#241442] rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#241442]' : 'bg-white'
                    }`}>
                      {isSelected && <Check size={14} color="#39FF14" strokeWidth={3.5} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#1a0833] truncate">{pack.title}</div>
                      <div className="text-[10px] font-bold text-slate-600">
                        {formatTemplate(t.wordsCountBadge, { n: pack.words.length })} • {pack.shareCode}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyShare(pack)}
                      title={t.copyShareBtn}
                      className="p-1.5 bg-[#00F0FF] text-[#1a0833] rounded-lg border border-[#241442]"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePack(pack.id)}
                      className="p-1.5 bg-[#FF1058] text-white rounded-lg border border-[#241442]"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Decorative Mascot Green Buddy */}
      <div className="my-1.5 p-2 bg-white border-2 border-[#241442] rounded-2xl flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#241442] shrink-0">
        <TeamMascot color="GREEN" size={28} />
        <span className="text-[11px] text-[#1a0833] font-black">{t.categoryMascotTip}</span>
      </div>

      {/* Footer Navigation */}
      <div className="flex gap-3 pt-2 shrink-0 border-t-2 border-[#241442]/20">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="pixel-btn pixel-btn-dark flex-1 py-3.5 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{t.back}</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onNext();
          }}
          className="pixel-btn pixel-btn-pink flex-[2] py-3.5 text-base font-black uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <span>{t.next}</span>
          {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
};

export default CategoryScreen;
