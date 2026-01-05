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
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    style={{
                      color: '#4fc1ff',
                      textDecoration: 'underline',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                code: ({ node, inline, ...props }) => (
                  <code
                    {...props}
                    style={{
                      backgroundColor: '#1e1e1e',
                      color: '#ce9178',
                      padding: inline ? '2px 4px' : '8px',
                      borderRadius: '4px',
                      display: inline ? 'inline' : 'block',
                      fontFamily: 'Consolas, monospace',
                      fontSize: '11px',
                    }}
                  />
                ),
                pre: ({ node, ...props }) => (
                  <pre
                    {...props}
                    style={{
                      backgroundColor: '#1e1e1e',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      margin: '6px 0',
                    }}
                  />
                ),
                h1: ({ node, ...props }) => (
                  <h1
                    {...props}
                    style={{
                      color: '#4ec9b0',
                      fontSize: '14px',
                      marginTop: '12px',
                      marginBottom: '6px',
                    }}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    {...props}
                    style={{
                      color: '#4ec9b0',
                      fontSize: '13px',
                      marginTop: '10px',
                      marginBottom: '4px',
                    }}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    {...props}
                    style={{
                      color: '#4ec9b0',
                      fontSize: '12px',
                      marginTop: '8px',
                      marginBottom: '3px',
                    }}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong {...props} style={{ color: '#dcdcaa' }} />
                ),
                em: ({ node, ...props }) => (
                  <em {...props} style={{ color: '#c586c0' }} />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    {...props}
                    style={{ paddingLeft: '16px', margin: '6px 0' }}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    {...props}
                    style={{ paddingLeft: '16px', margin: '6px 0' }}
                  />
                ),
              }}
            >
              {article || 'No article available'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsPreview;
