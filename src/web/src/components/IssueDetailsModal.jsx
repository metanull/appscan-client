import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';
import { apiClient } from '../api/client';
import ReactMarkdown from 'react-markdown';

const IssueDetailsModal = () => {
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const [details, setDetails] = useState(null);
  const [article, setArticle] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    useWebStore.getState().setShowIssueDetailsModal(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!selectedIssue) return;

      try {
        setLoading(true);
        const [detailsData, articleData, commentsData] = await Promise.all([
          apiClient.getIssueDetails(selectedIssue.Id),
          apiClient
            .getIssueArticle(selectedIssue.Id)
            .catch(() => ({ content: '' })),
          apiClient.getIssueComments(selectedIssue.Id).catch(() => []),
        ]);

        setDetails(detailsData);
        setArticle(articleData.content || '');
        setComments(commentsData || []);
      } catch (err) {
        console.error('Error loading issue details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedIssue]);

  if (!selectedIssue) return null;

  return (
    <Modal
      title={`Issue Details - ${selectedIssue.IssueType}`}
      onClose={handleClose}
      width="800px"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#858585' }}>
          Loading...
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#858585',
                    marginBottom: '4px',
                  }}
                >
                  Severity
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {selectedIssue.Severity}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#858585',
                    marginBottom: '4px',
                  }}
                >
                  Status
                </div>
                <div>{selectedIssue.Status}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#858585',
                    marginBottom: '4px',
                  }}
                >
                  Issue Type
                </div>
                <div>{selectedIssue.IssueType}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#858585',
                    marginBottom: '4px',
                  }}
                >
                  Jira
                </div>
                <div
                  style={{
                    color: selectedIssue.ExternalId ? '#4ec9b0' : '#858585',
                  }}
                >
                  {selectedIssue.ExternalId || 'Not linked'}
                </div>
              </div>
            </div>
          </div>

          {selectedIssue.Location && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#858585',
                  marginBottom: '4px',
                }}
              >
                Location
              </div>
              <div
                style={{
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  backgroundColor: '#252525',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                {selectedIssue.Location}
              </div>
            </div>
          )}

          {details && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#858585',
                  marginBottom: '4px',
                }}
              >
                Description
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {details.Description || 'No description available'}
              </div>
            </div>
          )}

          {article && (
            <div
              style={{
                marginBottom: '20px',
                borderTop: '1px solid #3e3e3e',
                paddingTop: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#007acc',
                }}
              >
                Remediation Article
              </div>
              <div
                className="markdown-content"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
              >
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
                          backgroundColor: inline ? '#1e1e1e' : '#1e1e1e',
                          color: '#ce9178',
                          padding: inline ? '2px 4px' : '12px',
                          borderRadius: '4px',
                          display: inline ? 'inline' : 'block',
                          fontFamily: 'Consolas, monospace',
                          fontSize: '12px',
                        }}
                      />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre
                        {...props}
                        style={{
                          backgroundColor: '#1e1e1e',
                          padding: '12px',
                          borderRadius: '4px',
                          overflow: 'auto',
                          margin: '8px 0',
                        }}
                      />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1
                        {...props}
                        style={{
                          color: '#4ec9b0',
                          fontSize: '20px',
                          marginTop: '16px',
                          marginBottom: '8px',
                        }}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        {...props}
                        style={{
                          color: '#4ec9b0',
                          fontSize: '18px',
                          marginTop: '12px',
                          marginBottom: '6px',
                        }}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        {...props}
                        style={{
                          color: '#4ec9b0',
                          fontSize: '16px',
                          marginTop: '10px',
                          marginBottom: '4px',
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
                        style={{ paddingLeft: '20px', margin: '8px 0' }}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        {...props}
                        style={{ paddingLeft: '20px', margin: '8px 0' }}
                      />
                    ),
                  }}
                >
                  {article}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {comments.length > 0 && (
            <div style={{ borderTop: '1px solid #3e3e3e', paddingTop: '20px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#007acc',
                }}
              >
                Comments ({comments.length})
              </div>
              {comments.map((comment, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: '#252525',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#858585',
                      marginBottom: '4px',
                    }}
                  >
                    {new Date(comment.CreatedAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px' }}>{comment.Comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default IssueDetailsModal;
