import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/services/appscan-service.js', () => ({
  AppScanService: class {
    async ensureAuthenticated() {}
    async getArticle(id) {
      return '<h1>Title</h1>';
    }
    async getArticleMarkdown(id) {
      return '# Title';
    }
    api = {
      v4: {
        Issues_GetIssue: async (id) => ({
          IssueTypeId: 'T',
          IssueType: 'SQL',
          Language: 'JS',
          Api: 'v1',
          CveId: 'CVE-1',
        }),
      },
    };
  },
}));

import { getArticle } from '../../src/cli/commands/get-article.js';
import { getArticleMarkdown } from '../../src/cli/commands/get-article-markdown.js';
import cliOutput from '../../src/utils/cli-output.js';

describe('getArticle CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'result').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('prints HTML result for article', async () => {
    await getArticle('1', { json: true });
    expect(cliOutput.result).toHaveBeenCalled();
  });

  it('prints markdown for article markdown', async () => {
    await getArticleMarkdown('1', {});
    expect(cliOutput.result).toHaveBeenCalled();
  });
});
