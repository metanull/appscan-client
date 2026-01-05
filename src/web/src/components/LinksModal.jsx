import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useWebStore } from '../store/webStore';
import { apiClient } from '../api/client';

const LinksModal = () => {
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const selectedApp = useWebStore((state) => state.selectedApp);
  const selectedScan = useWebStore((state) => state.selectedScan);
  const [articleUrl, setArticleUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    useWebStore.getState().setShowLinksModal(false);
  };

  // Fetch focused article URL
  useEffect(() => {
    if (!selectedIssue?.IssueTypeId) return;

    setLoading(true);
    const baseUrl = process.env.APPSCAN_BASE_URL || 'https://cloud.appscan.com';
    const params = new URLSearchParams({
      issuetype: selectedIssue.IssueTypeId,
    });

    if (selectedIssue.Language) {
      params.append('language', selectedIssue.Language);
    }

    // Try to get focused article, fallback to general
    apiClient
      .getIssueArticle(selectedIssue.Id)
      .then(() => {
        // Article exists, construct URL
        setArticleUrl(`${baseUrl}/api/v4/Reports/Article/?${params.toString()}`);
      })
      .catch(() => {
        // Fallback to general article
        setArticleUrl(`${baseUrl}/api/v4/Reports/Article/?${params.toString()}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedIssue]);

  if (!selectedIssue) return null;

  const baseUrl = process.env.APPSCAN_BASE_URL || 'https://cloud.appscan.com';
  const jiraBaseUrl = process.env.JIRA_HOST || 'https://jira.example.com';

  // Generate links
  const links = [];

  // AppScan Application link
  if (selectedApp?.Id) {
    links.push({
      icon: '📁',
      label: 'AppScan Application',
      url: `${baseUrl}/main/myapps/${selectedApp.Id}`,
    });
  }

  // AppScan Scan link
  const isViewingAll = selectedScan?.Id === '__VIEW_ALL__';
  const scanId = isViewingAll ? selectedIssue.ScanId : selectedScan?.Id;
  if (selectedApp?.Id && scanId) {
    links.push({
      icon: '🔍',
      label: 'AppScan Scan',
      url: `${baseUrl}/main/myapps/${selectedApp.Id}/scans/${scanId}`,
    });
  }

  // AppScan Issue link
  if (selectedApp?.Id && selectedIssue.Id) {
    links.push({
      icon: '🐛',
      label: 'AppScan Issue',
      url: `${baseUrl}/main/myapps/${selectedApp.Id}/issues/${selectedIssue.Id}`,
    });
  }

  // AppScan Article link
  if (articleUrl) {
    links.push({
      icon: '📚',
      label: loading ? 'AppScan Article (loading...)' : 'AppScan Article',
      url: articleUrl,
    });
  }

  // Azure DevOps Source link
  if (selectedIssue.SourceFileUri) {
    links.push({
      icon: '🔗',
      label: 'Azure DevOps Source',
      url: selectedIssue.SourceFileUri,
    });
  }

  // Jira link
  if (selectedIssue.ExternalId) {
    links.push({
      icon: '🎫',
      label: `Jira Issue (${selectedIssue.ExternalId})`,
      url: `${jiraBaseUrl}/browse/${selectedIssue.ExternalId}`,
    });
  }

  // CVE link
  if (selectedIssue.CveId) {
    links.push({
      icon: '🔒',
      label: `CVE Details (${selectedIssue.CveId})`,
      url: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${selectedIssue.CveId}`,
    });
  }

  return (
    <Modal title="Links" onClose={handleClose} width="600px">
      {links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#858585' }}>
          No links available for this issue
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '16px', color: '#858585', fontSize: '14px' }}>
            Click a link to open in a new tab:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {links.map((link, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#252525',
                  border: '1px solid #3e3e3e',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d2d2d';
                  e.currentTarget.style.borderColor = '#007acc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#252525';
                  e.currentTarget.style.borderColor = '#3e3e3e';
                }}
                onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{link.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {link.label}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#4fc1ff',
                        wordBreak: 'break-all',
                      }}
                    >
                      {link.url}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LinksModal;
