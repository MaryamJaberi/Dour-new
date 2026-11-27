import React from 'react';
import fs from 'fs';
import path from 'path';
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { TRANSLATIONS, NATIVE_LANGUAGE_NAMES } from '../translations';
import { WORD_BANK } from '../words';
import { CATEGORIES } from '../constants';
import { SUPPORTED_LANGUAGES, isRTLLanguage, formatTemplate, formatLocalizedDate } from '../i18n';
import { ACHIEVEMENTS_CATALOG } from '../database';
import { Language } from '../types';

function collectLeafKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectLeafKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

describe('Complete Internationalization (i18n) Audit & Runtime Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('All 9 supported languages have identical translation key schemas with zero empty strings', () => {
    const enKeys = collectLeafKeys(TRANSLATIONS.en);
    expect(enKeys.length).toBeGreaterThan(100);

    SUPPORTED_LANGUAGES.forEach((lang: Language) => {
      const dict = TRANSLATIONS[lang];
      expect(dict).toBeDefined();
      expect(NATIVE_LANGUAGE_NAMES[lang]).toBeTruthy();

      const langKeys = collectLeafKeys(dict);
      expect(langKeys).toEqual(enKeys);

      // Every leaf string must be non-empty
      const checkNonEmpty = (node: any, trail: string) => {
        if (typeof node === 'string') {
          expect(node.trim().length, `${lang}.${trail} should not be empty`).toBeGreaterThan(0);
        } else if (Array.isArray(node)) {
          expect(node.length, `${lang}.${trail} array should not be empty`).toBeGreaterThan(0);
          node.forEach((item, idx) => checkNonEmpty(item, `${trail}[${idx}]`));
        } else if (node && typeof node === 'object') {
          Object.entries(node).forEach(([k, v]) => checkNonEmpty(v, `${trail}.${k}`));
        }
      };
      checkNonEmpty(dict, lang);
    });
  });

  test('All 9 languages have translations for all 14 categories, 14 help sections, and 10 achievements', () => {
    const allCats = Object.keys(CATEGORIES);
    expect(allCats.length).toBe(14);

    SUPPORTED_LANGUAGES.forEach(lang => {
      const dict = TRANSLATIONS[lang];
      allCats.forEach(cat => {
        expect(dict.categories[cat], `${lang} missing category ${cat}`).toBeTruthy();
      });

      expect(dict.helpContent.sections.length, `${lang} help sections count`).toBe(14);
      const sectionIds = dict.helpContent.sections.map((s: any) => s.id);
      expect(sectionIds).toContain('difficulty');

      ACHIEVEMENTS_CATALOG.forEach(meta => {
        expect(dict.achievements[meta.id]?.title, `${lang} missing achievement title ${meta.id}`).toBeTruthy();
        expect(dict.achievements[meta.id]?.desc, `${lang} missing achievement desc ${meta.id}`).toBeTruthy();
      });
    });
  });

  test('WORD_BANK covers all 14 categories across Easy, Medium, and Hard with all 9 languages and no duplicate FA words', () => {
    const allCats = Object.keys(CATEGORIES);
    expect(WORD_BANK.length).toBeGreaterThanOrEqual(350);

    const seenIds = new Set<string>();
    const seenFa = new Set<string>();

    WORD_BANK.forEach((entry, idx) => {
      expect(entry.id, `word[${idx}] missing id`).toBeTruthy();
      expect(seenIds.has(entry.id!), `duplicate word id ${entry.id}`).toBe(false);
      seenIds.add(entry.id!);

      expect(allCats).toContain(entry.category);
      expect(['easy', 'medium', 'hard']).toContain(entry.difficulty);

      SUPPORTED_LANGUAGES.forEach(lang => {
        const text = entry.words[lang];
        expect(text, `word[${idx}] missing ${lang}`).toBeTruthy();
        expect(text.trim().length, `word[${idx}] empty ${lang}`).toBeGreaterThan(0);
      });

      const faNorm = entry.words.fa.trim();
      expect(seenFa.has(faNorm), `duplicate Persian word: ${faNorm}`).toBe(false);
      seenFa.add(faNorm);
    });

    // Every category has Easy, Medium, and Hard words
    allCats.forEach(cat => {
      const easy = WORD_BANK.filter(w => w.category === cat && w.difficulty === 'easy');
      const med = WORD_BANK.filter(w => w.category === cat && w.difficulty === 'medium');
      const hard = WORD_BANK.filter(w => w.category === cat && w.difficulty === 'hard');
      expect(easy.length, `${cat} easy words`).toBeGreaterThan(0);
      expect(med.length, `${cat} medium words`).toBeGreaterThan(0);
      expect(hard.length, `${cat} hard words`).toBeGreaterThan(0);
    });
  });

  test('Zero hardcoded language === "fa" UI ternaries remain in App, screens, and components', () => {
    const root = path.resolve(__dirname, '..');
    const filesToCheck = [
      path.join(root, 'App.tsx'),
      ...fs.readdirSync(path.join(root, 'screens')).filter(f => f.endsWith('.tsx')).map(f => path.join(root, 'screens', f)),
      ...fs.readdirSync(path.join(root, 'components')).filter(f => f.endsWith('.tsx')).map(f => path.join(root, 'components', f))
    ];

    filesToCheck.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/language\s*===\s*'fa'/g) || [];
      expect(matches.length, `Hardcoded language === 'fa' found in ${path.basename(filePath)}`).toBe(0);
    });
  });

  test('i18n helper functions format templates, dates, and RTL flags properly', () => {
    expect(isRTLLanguage('fa')).toBe(true);
    expect(isRTLLanguage('ar')).toBe(true);
    expect(isRTLLanguage('en')).toBe(false);
    expect(isRTLLanguage('de')).toBe(false);

    expect(formatTemplate('Round {n} of {total}', { n: 2, total: 5 })).toBe('Round 2 of 5');

    const d = new Date('2026-11-26T12:00:00Z');
    SUPPORTED_LANGUAGES.forEach(lang => {
      expect(formatLocalizedDate(d, lang).length).toBeGreaterThan(3);
    });
  });

  test('Switching through ALL 9 languages updates document lang, dir, Intro, Setup, and History screens', () => {
    render(<App />);

    SUPPORTED_LANGUAGES.forEach(lang => {
      const nativeName = NATIVE_LANGUAGE_NAMES[lang];
      const langBtn = screen.getByRole('button', { name: nativeName });
      fireEvent.click(langBtn);

      const expectedDir = isRTLLanguage(lang) ? 'rtl' : 'ltr';
      expect(document.documentElement.lang).toBe(lang);
      expect(document.documentElement.dir).toBe(expectedDir);

      const t = TRANSLATIONS[lang];
      expect(screen.getByText(t.newGame)).toBeInTheDocument();
      expect(screen.getByText(t.selectLanguage)).toBeInTheDocument();
      expect(screen.getByText(t.dailyChallengeTitle)).toBeInTheDocument();

      // Open Setup screen and verify localized labels (no English leakage!)
      fireEvent.click(screen.getByText(t.newGame));
      expect(screen.getByText(t.twoPlayersPerTeam)).toBeInTheDocument();
      expect(screen.getByText(t.turnPassingMode)).toBeInTheDocument();
      expect(screen.getByText(t.audioControlsTitle)).toBeInTheDocument();

      // Go back to Intro for next language
      fireEvent.click(screen.getByRole('button', { name: t.back }));
      expect(screen.getByText(t.newGame)).toBeInTheDocument();
    });
  });
});
