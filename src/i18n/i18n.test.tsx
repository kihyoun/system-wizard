import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { I18nProvider, localeStorageKey, translate, useI18n } from './index';

function Example() {
  const { locale, setLocale, t } = useI18n();
  const [value, setValue] = useState('operator.example.test');
  return <><button onClick={() => setLocale(locale === 'en' ? 'de' : 'en')}>EN | DE</button>
    <label>{t('Connect')}<input value={value} onChange={event => setValue(event.target.value)} /></label></>;
}

describe('Language preference', () => {
  beforeEach(() => { localStorage.clear(); document.documentElement.lang = 'en'; });
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); document.documentElement.lang = 'en'; });
  it('switches visible text and document language without discarding edited fields', () => {
    render(<I18nProvider><Example /></I18nProvider>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'edited.example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'EN | DE' }));
    expect(screen.getByLabelText('Verbinden')).toHaveValue('edited.example.test');
    expect(document.documentElement.lang).toBe('de');
    expect(localStorage.getItem(localeStorageKey)).toBe('de');
    fireEvent.click(screen.getByRole('button', { name: 'EN | DE' }));
    expect(screen.getByLabelText('Connect')).toHaveValue('edited.example.test');
    expect(document.documentElement.lang).toBe('en');
  });
  it('restores a supported saved preference and safely ignores invalid stored values', () => {
    localStorage.setItem(localeStorageKey, 'de');
    const view = render(<I18nProvider><Example /></I18nProvider>);
    expect(screen.getByLabelText('Verbinden')).toBeVisible(); view.unmount();
    localStorage.setItem(localeStorageKey, 'invalid');
    render(<I18nProvider><Example /></I18nProvider>);
    expect(screen.getByLabelText('Connect')).toBeVisible();
  });
  it('uses library interpolation and plural selection while preserving placeholder values', () => {
    expect(translate('docs.searchResults', 'en', { count: 1, query: 'PERSISTENT_DIR' })).toBe('1 chapter matching “PERSISTENT_DIR”');
    expect(translate('docs.searchResults', 'en', { count: 2, query: 'PERSISTENT_DIR' })).toBe('2 chapters matching “PERSISTENT_DIR”');
    expect(translate('docs.searchResults', 'de', { count: 2, query: 'PERSISTENT_DIR' })).toBe('2 Kapitel zu „PERSISTENT_DIR“');
    expect(translate('code.copyExample', 'de', { language: 'bash' })).toBe('bash-Beispiel kopieren');
  });
  it('works with blocked browser storage and preserves unknown technical or operator values', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('blocked'); });
    render(<I18nProvider><Example /></I18nProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'EN | DE' }));
    expect(screen.getByLabelText('Verbinden')).toBeVisible();
    expect(translate('GITLAB_RUNNER_TOKEN', 'de')).toBe('GITLAB_RUNNER_TOKEN');
    expect(translate('operator.example.test', 'de')).toBe('operator.example.test');
    expect(translate('Connect', 'en')).toBe('Connect');
    expect(translate('Import finished: untouched-config.json', 'de')).toBe('Import abgeschlossen: untouched-config.json');
    expect(translate('error reading file: untouched-config.json', 'de')).toBe('Fehler beim Lesen der Datei: untouched-config.json');
    expect(translate('Import finished. (Skipped 3 File(s)', 'de')).toBe('Import abgeschlossen. (Übersprungen: 3 Datei(en)');
  });
});
