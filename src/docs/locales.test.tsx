import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { chapters, localizedChapters, markdownHeadings, resolveDocLink, searchDocs } from './model';
import Markdown from '../components/docs/Markdown';

describe('Complete bilingual handbook', () => {
  it('provides German prose for every stable English chapter without changing source links', () => {
    const german = localizedChapters('de');
    expect(german.map(chapter => chapter.id)).toEqual(chapters.map(chapter => chapter.id));
    for (const [index, translated] of german.entries()) {
      const original = chapters[index];
      expect(translated.markdown).not.toBe(original.markdown);
      expect(translated.markdown.length).toBeGreaterThan(original.markdown.length * .6);
      expect(translated.source).toBe(original.source);
      const headings = original.headings.length ? original.headings : markdownHeadings(original.markdown);
      expect(translated.headings.map(heading => heading.anchor)).toEqual(headings.map(heading => heading.anchor));
    }
  });

  it('searches German explanations and unchanged technical identifiers', () => {
    const german = localizedChapters('de');
    expect(searchDocs('Plattform', german).length).toBeGreaterThan(0);
    for (const identifier of ['PERSISTENT_DIR', 'WIZARD_IMAGE', 'SYNC_USER'])
      expect(searchDocs(identifier, german).length).toBeGreaterThan(0);
    expect(resolveDocLink('RECOVERY_CONTRACT.md#verification-boundaries', german.find(chapter => chapter.id === 'installation')!))
      .toBe('#docs/seed-recovery/verification-boundaries');
  });

  it('renders German headings at the original deep-link anchors', () => {
    const chapter = localizedChapters('de')[0];
    render(<Markdown chapter={chapter} />);
    const original = markdownHeadings(chapters[0].markdown)[0];
    expect(screen.getAllByRole('heading')[0]).toHaveAttribute('id', `docs-section-${original.anchor}`);
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent(chapter.headings[0].title);
  });
});
