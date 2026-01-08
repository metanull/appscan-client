/**
 * LinksModal
 * Displays clickable hyperlinks using ink-link
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Link from 'ink-link';
import { Modal } from './Modal.js';
import { Panel } from './Panel.js';
import open from 'open';
import { parseAVSFromComments } from '../../../utils/asvs-utils.js';
import logger from '../../../utils/logger.js';

export const LinksModal = React.memo(
  ({ issue, app, scan, config, appScanService, onClose }) => {
    const [cursor, setCursor] = useState(0);
    const [articleUrl, setArticleUrl] = useState(null);
    const [loadingArticleUrl, setLoadingArticleUrl] = useState(false);
    const [comments, setComments] = useState([]);

    if (!issue) {
      return null;
    }

    // Fetch comments to parse ASVS
    useEffect(() => {
      if (issue && issue.Id && appScanService) {
        appScanService
          .getIssueComments(issue.Id)
          .then((commentsList) => {
            setComments(commentsList || []);
          })
          .catch((err) => {
            logger.error('Failed to load comments', err);
            setComments([]);
          });
      }
    }, [issue?.Id, appScanService]);

    // Fetch focused article URL on mount
    useEffect(() => {
      if (issue.IssueTypeId && appScanService) {
        setLoadingArticleUrl(true);
        appScanService
          .getFocusedArticleUrl(issue)
          .then((url) => {
            setArticleUrl(url);
          })
          .catch((_error) => {
            // Fallback to general article URL
            const baseUrl = config?.getBaseUrl
              ? config.getBaseUrl()
              : config?.baseUrl || 'https://cloud.appscan.com';

            const articleParams = new URLSearchParams({
              issuetype: issue.IssueTypeId,
            });

            if (issue.Language) {
              articleParams.append('language', issue.Language);
            }

            setArticleUrl(
              `${baseUrl}/api/v4/Reports/Article/?${articleParams.toString()}`
            );
          })
          .finally(() => {
            setLoadingArticleUrl(false);
          });
      }
    }, [
      issue.IssueTypeId,
      issue.Language,
      issue.ApiVulnName,
      appScanService,
      config,
    ]);

    // Generate links
    const links = [];

    // AppScan Application link
    if (app?.Id) {
      links.push({
        label: '🔗 AppScan Application',
        url: appScanService.getApplicationUrl(app.Id),
      });
    }

    // AppScan Scan link
    // In "All Scans" mode, get the scan ID from the current issue
    const isViewingAll = scan?._isViewAll || scan?.Id === '__VIEW_ALL__';
    const scanId = isViewingAll ? issue?.ScanId : scan?.Id;

    if (app?.Id && scanId) {
      links.push({
        label: '🔗 AppScan Scan',
        url: appScanService.getScanUrl(app.Id, scanId),
      });
    }

    // AppScan Issue link - format: /main/myapps/{appId}/issues/{issueId}
    if (app?.Id && issue.Id) {
      links.push({
        label: '🔗 AppScan Issue',
        url: appScanService.getIssueUrl(app.Id, issue.Id),
      });
    }

    // AppScan Article link (if available) - dynamically loaded focused URL
    if (articleUrl) {
      links.push({
        label: loadingArticleUrl
          ? '📚 AppScan Article (loading...)'
          : '📚 AppScan Article',
        url: articleUrl,
      });
    }

    // Azure DevOps link - use SourceFileUri if available (absolute URL from AppScan)
    if (issue.SourceFileUri) {
      links.push({
        label: '🔗 Azure DevOps Source',
        url: issue.SourceFileUri,
      });
    }

    // Jira link if available - use service method
    const jiraUrl = appScanService.getJiraUrl(issue);
    if (jiraUrl) {
      links.push({
        label: `🎫 Jira Issue (${issue.ExternalId})`,
        url: jiraUrl,
      });
    }

    // ASVS link if available
    const avsInfo = parseAVSFromComments(comments);
    if (avsInfo) {
      links.push({
        label: `📚 ASVS ${avsInfo.label}`,
        url: avsInfo.url,
      });
    }

    // CVE link if available
    if (issue.CveId) {
      links.push({
        label: `🔒 CVE Details (${issue.CveId})`,
        url: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${issue.CveId}`,
      });
    }

    useInput((input, key) => {
      if (key.escape) {
        onClose();
        return;
      }

      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
        return;
      }

      if (key.downArrow) {
        setCursor((prev) => Math.min(links.length - 1, prev + 1));
        return;
      }

      if (key.return && links[cursor]) {
        // Open the selected link in default browser
        const selectedLink = links[cursor];
        open(selectedLink.url).catch((_err) => {
          // Silently fail if we can't open the link
          // The terminal-based link should still be clickable
        });
        return;
      }
    });

    if (links.length === 0) {
      return (
        <Modal width={60} height={30}>
          <Panel title="Links" borderColor="cyan">
            <Box flexDirection="column">
              <Text dimColor>No links available for this issue</Text>
              <Box marginTop={1}>
                <Text dimColor>Press ESC to close</Text>
              </Box>
            </Box>
          </Panel>
        </Modal>
      );
    }

    return (
      <Modal width={70} height={50}>
        <Panel title="Links" borderColor="cyan">
          <Box flexDirection="column">
            <Text dimColor>Click a link to open in browser:</Text>

            <Box flexDirection="column" marginTop={1}>
              {links.map((link, index) => (
                <Box key={index} marginY={0}>
                  <Text
                    color={cursor === index ? 'cyan' : undefined}
                    bold={cursor === index}
                  >
                    {cursor === index ? '▶ ' : '  '}
                  </Text>
                  <Link url={link.url}>
                    <Text color={cursor === index ? 'cyan' : 'blue'} underline>
                      {link.label}
                    </Text>
                  </Link>
                </Box>
              ))}
            </Box>

            <Box marginTop={2}>
              <Text dimColor>↑/↓: Navigate | ENTER: Open | ESC: Close</Text>
            </Box>
          </Box>
        </Panel>
      </Modal>
    );
  }
);

LinksModal.displayName = 'LinksModal';
