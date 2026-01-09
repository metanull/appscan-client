import { describe, it, expect } from 'vitest';
import {
  buildFilterOptions,
  getFilterDescription,
} from '../../src/utils/filter-builder.js';

describe('buildFilterOptions', () => {
  it('builds status filter and flags hasFilters', () => {
    const { filterOptions, hasFilters } = buildFilterOptions({ active: true });
    expect(hasFilters).toBe(true);
    expect(filterOptions).toHaveProperty('statusActive', true);
  });

  it('handles severity and jira filters', () => {
    const { filterOptions } = buildFilterOptions({
      high: true,
      assigned: true,
    });
    expect(filterOptions).toMatchObject({
      severityHigh: true,
      jiraAssigned: true,
    });
  });

  it('returns no filters when none specified', () => {
    const { filterOptions, hasFilters } = buildFilterOptions({});
    expect(hasFilters).toBe(false);
    expect(filterOptions).toEqual({});
  });
});

describe('getFilterDescription', () => {
  it('returns empty string when no filters', () => {
    expect(getFilterDescription({ filterOptions: {}, hasFilters: false })).toBe(
      ''
    );
  });

  it('returns combined description', () => {
    const desc = getFilterDescription({
      filterOptions: {
        statusActive: true,
        severityHigh: true,
        jiraUnassigned: true,
      },
      hasFilters: true,
    });

    expect(desc).toContain('Active');
    expect(desc).toContain('High');
    expect(desc).toContain('Without Jira');
    expect(desc.startsWith(' (')).toBe(true);
  });
});
