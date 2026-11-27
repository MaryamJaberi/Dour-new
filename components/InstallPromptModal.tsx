import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { isRTLLanguage } from '../i18n';
import { sound } from '../soundManager';
import {
  Download,
  Smartphone,
  Sparkles,
  Zap,
  CheckCircle2,
  Apple,
  X,
  ShieldCheck,
  WifiOff
} from 'lucide-react';

interface Props {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onInstalled?: () => void;
}

export const InstallPromptModal: React.FC<Props> = ({
  language,
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  const isRTL = isRTLLanguage(language);

  useEffect(() => {
    if (typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setActiveTab('ios');
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sound.playClick();
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalledSuccess(true);
          sound.playCorrect();
          if (onInstalled) onInstalled();
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      sound.playToggle();
    }
  };

  const handleTabChange = (tab: 'android' | 'ios') => {
    sound.playToggle();
    setActiveTab(tab);
  };

  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  const stepNums = isRTL ? ['۱', '۲', '۳'] : ['1', '2', '3'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241442]/85 backdrop-blur-xs animate-fade-in select-none"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-[4px] border-[#241442] shadow-[8px_8px_0px_0px_#241442] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#7B2CBF] via-[#FF007F] to-[#FF2E93] text-white p-3.5 border-b-4 border-[#241442] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFE600] border-2 border-[#241442] flex items-center justify-center text-[#1a0833] shadow-[2px_2px_0px_0px_#241442]">
              <Smartphone size={18} color="#1a0833" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">{t.installModalTitle}</h3>
              <p className="text-[10px] text-[#FFE600] font-black">{t.installModalSub}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-[#FFE600] hover:bg-yellow-300 text-[#1a0833] border-2 border-[#241442] font-black rounded-xl active:translate-y-0.5 shadow-[2px_2px_0px_0px_#241442]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto overscroll-contain flex-1">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#241442]/5 border-2 border-[#241442] rounded-2xl">
            <button
              onClick={() => handleTabChange('android')}
              className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all border-2 ${
                activeTab === 'android'
                  ? 'bg-[#39FF14] text-[#1a0833] border-[#241442] shadow-[2px_2px_0px_0px_#241442] -translate-y-0.5'
                  : 'border-transparent text-slate-600 hover:text-[#1a0833]'
              }`}
            >
              <span>🤖 Android</span>
            </button>

            <button
              onClick={() => handleTabChange('ios')}
              className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all border-2 ${
                activeTab === 'ios'
                  ? 'bg-[#00F0FF] text-[#1a0833] border-[#241442] shadow-[2px_2px_0px_0px_#241442] -translate-y-0.5'
                  : 'border-transparent text-slate-600 hover:text-[#1a0833]'
              }`}
            >
              <span>🍏 iOS (iPhone)</span>
            </button>
          </div>

          {activeTab === 'android' && (
            <div className="space-y-3">
              {deferredPrompt && !isInstalledSuccess && (
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="pixel-btn pixel-btn-green w-full py-3 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#241442]"
                >
                  <Download size={18} />
                  <span>{t.instantInstallBtn}</span>
                  <Zap size={16} color="#FFE600" fill="#FFE600" />
                </button>
              )}

              {isInstalledSuccess && (
                <div className="p-3 bg-[#39FF14]/20 border-2 border-[#39FF14] text-[#1a0833] rounded-2xl flex items-center gap-2 text-xs font-black">
                  <CheckCircle2 size={18} color="#15803d" />
                  <span>{t.installedSuccessMsg}</span>
                </div>
              )}

              <div className="bg-[#FAF5FF] p-3 rounded-2xl border-2 border-[#241442] space-y-2.5">
                <div className="text-[11px] font-black text-[#1a0833] flex items-center gap-1.5">
                  <Sparkles size={14} color="#7B2CBF" />
                  <span>{t.chromeHowTo}</span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-800 font-medium">
                  {[t.chromeStep1, t.chromeStep2, t.chromeStep3].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FFE600] text-[#1a0833] border border-[#241442] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {stepNums[idx]}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FFE600]/25 p-2.5 rounded-2xl border-2 border-[#241442] flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#241442] text-[#FFE600] flex items-center justify-center shrink-0">
                  <Zap size={15} color="#FFE600" fill="#FFE600" />
                </div>
                <div className="text-[10px] text-[#1a0833] font-black leading-tight">
                  <span>{t.androidStoreSoon}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="bg-[#F0FDF4] p-3 rounded-2xl border-2 border-[#241442] space-y-2.5">
                <div className="text-[11px] font-black text-[#1a0833] flex items-center gap-1.5">
                  <Apple size={14} color="#000" />
                  <span>{t.safariHowTo}</span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-800 font-medium">
                  {[t.safariStep1, t.safariStep2, t.safariStep3].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#00F0FF] text-[#1a0833] border border-[#241442] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {stepNums[idx]}
                      </span>
                      <span className="flex-1">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#00F0FF]/20 p-2.5 rounded-2xl border-2 border-[#241442] flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#241442] text-[#00F0FF] flex items-center justify-center shrink-0">
                  <Apple size={15} color="#00F0FF" />
                </div>
                <div className="text-[10px] text-[#1a0833] font-black leading-tight">
                  <span>{t.iosStoreSoon}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 border-t-2 border-slate-100">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <WifiOff size={13} color="#7B2CBF" />
              <span>{t.offlineBadge}</span>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <ShieldCheck size={13} color="#15803d" />
              <span>{t.lightweightBadge}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t-2 border-[#241442] flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-[#241442] hover:bg-[#341d5e] text-white text-xs font-black rounded-xl border-2 border-[#241442] shadow-[2px_2px_0px_0px_#FFE600] active:translate-y-0.5"
          >
            {t.gotItClose}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptModal;
