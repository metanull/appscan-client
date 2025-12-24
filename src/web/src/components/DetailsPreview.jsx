import React, { useEffect, useState } from 'react';
import { useWebStore } from '../store/webStore';
import { apiClient } from '../api/client';
import ReactMarkdown from 'react-markdown';

const DetailsPreview = () => {
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const articleCache = useWebStore((state) => state.articleCache);
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!selectedIssue) return;

      const cached = articleCache[selectedIssue.Id];
      if (cached && Date.now() - cached.timestamp < 300000) {
        setArticle(cached.content);
        return;
      }

      try {
        setLoading(true);
        const result = await apiClient.getIssueArticle(selectedIssue.Id);
        setArticle(result.content || '');
        useWebStore
          .getState()
          .setArticleCache(selectedIssue.Id, result.content || '');
      } catch {
        setArticle('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [selectedIssue, articleCache]);

  if (!selectedIssue) return null;

  return (
    <div
      style={{
        width: '400px',
        minWidth: '400px',
        padding: '12px',
        overflowY: 'auto',
        backgroundColor: '#252525',
        borderLeft: '1px solid #3e3e3e',
      }}
    >
      <div
        style={{ marginBottom: '16px', color: '#007acc', fontWeight: 'bold' }}
      >
        Details Preview
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div
          style={{ fontSize: '12px', color: '#858585', marginBottom: '4px' }}
        >
          Issue Type
        </div>
        <div>{selectedIssue.IssueType || 'N/A'}</div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div
          style={{ fontSize: '12px', color: '#858585', marginBottom: '4px' }}
        >
          Severity
        </div>
        <div>{selectedIssue.Severity || 'N/A'}</div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div
          style={{ fontSize: '12px', color: '#858585', marginBottom: '4px' }}
        >
          Status
        </div>
        <div>{selectedIssue.Status || 'N/A'}</div>
      </div>

      {selectedIssue.Location && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{ fontSize: '12px', color: '#858585', marginBottom: '4px' }}
          >
            Location
          </div>
          <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
            {selectedIssue.Location}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: '20px',
          borderTop: '1px solid #3e3e3e',
          paddingTop: '12px',
        }}
      >
        <div
          style={{ fontSize: '12px', color: '#858585', marginBottom: '8px' }}
        >
          Remediation Article
        </div>
        {loading ? (
          <div style={{ color: '#858585' }}>Loading...</div>
        ) : (
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            <ReactMarkdown>{article || 'No article available'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsPreview;
