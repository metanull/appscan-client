/**
 * URL conversion utilities for AppScan issues
 * Converts relative URLs to absolute URLs for Azure DevOps, AppScan Cloud, etc.
 */

/**
 * Check if a URL is already absolute
 */
export function isAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Convert relative Azure DevOps source file path to absolute URL
 * Handles formats like:
 * - /eesc-cor/Aura/_git/Aura?path=/DataLayerCore/DBProcessor.cs
 * - Converts to: https://dev.azure.com/eesc-cor/Aura/_git/Aura?path=/DataLayerCore/DBProcessor.cs&version=GBmaster
 */
export function convertAzureDevOpsUrl(relativePath, baseUrl = 'https://dev.azure.com') {
  if (!relativePath || typeof relativePath !== 'string') return relativePath;
  
  // Already absolute
  if (isAbsoluteUrl(relativePath)) {
    return relativePath;
  }

  // Clean up the path
  const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  
  // If it looks like an Azure DevOps path (contains _git), make it absolute
  if (cleanPath.includes('/_git/')) {
    const absoluteUrl = `${baseUrl}/${cleanPath}`;
    
    // Add version parameter if path parameter exists and no version is specified
    if (absoluteUrl.includes('?path=') && !absoluteUrl.includes('&version=')) {
      return `${absoluteUrl}&version=GBmaster`;
    }
    
    return absoluteUrl;
  }

  // Return as-is if it doesn't match Azure DevOps pattern
  return relativePath;
}

/**
 * Convert AppScan API relative URL to absolute
 * Example: /api/v4/Issues/{id} -> https://eu.cloud.appscan.com/api/v4/Issues/{id}
 */
export function convertAppScanUrl(relativePath, baseUrl) {
  if (!relativePath || typeof relativePath !== 'string') return relativePath;
  
  // Already absolute
  if (isAbsoluteUrl(relativePath)) {
    return relativePath;
  }

  // AppScan API paths
  if (relativePath.startsWith('/api/')) {
    return `${baseUrl}${relativePath}`;
  }

  return relativePath;
}

/**
 * Smart URL converter that handles multiple formats
 * Tries to detect the URL type and convert appropriately
 */
export function convertToAbsoluteUrl(url, appScanBaseUrl = 'https://eu.cloud.appscan.com') {
  if (!url || typeof url !== 'string') return url;
  
  // Already absolute
  if (isAbsoluteUrl(url)) {
    return url;
  }

  // Try Azure DevOps conversion
  if (url.includes('/_git/') || url.includes('azure')) {
    return convertAzureDevOpsUrl(url);
  }

  // Try AppScan conversion
  if (url.startsWith('/api/')) {
    return convertAppScanUrl(url, appScanBaseUrl);
  }

  // If it's a web URL path (starts with / and looks like a URL path)
  if (url.startsWith('/') && (url.includes('?') || url.includes('/'))) {
    // Try Azure DevOps first as it's most common
    const azureUrl = convertAzureDevOpsUrl(url);
    if (isAbsoluteUrl(azureUrl)) {
      return azureUrl;
    }
  }

  // Return as-is if no conversion applies
  return url;
}

/**
 * Get display-friendly label from URL
 * Extracts meaningful parts for display
 */
export function getUrlLabel(url) {
  if (!url || typeof url !== 'string') return 'N/A';
  
  try {
    // If it's an absolute URL, try to extract meaningful parts
    if (isAbsoluteUrl(url)) {
      const parsed = new URL(url);
      
      // Azure DevOps
      if (parsed.hostname === 'dev.azure.com' || parsed.hostname.endsWith('.dev.azure.com')) {
        const pathParam = parsed.searchParams.get('path');
        if (pathParam) {
          // Return just the file path
          return pathParam.replace(/^\/+/, '');
        }
        // Return the pathname without leading slash
        return parsed.pathname.replace(/^\/+/, '');
      }
      
      // AppScan Cloud
      if (parsed.hostname === 'cloud.appscan.com' || parsed.hostname.endsWith('.cloud.appscan.com')) {
        // For issue URLs, return just "Issue Details"
        if (parsed.pathname.includes('/Issues/')) {
          return 'Issue Details';
        }
        return parsed.pathname;
      }
      
      // Other URLs - return hostname + path
      return `${parsed.hostname}${parsed.pathname}`;
    }
    
    // For relative paths, return as-is but clean up
    return url.replace(/^\/+/, '');
  } catch {
    return url;
  }
}

/**
 * Format URL for display in terminal
 * Returns object with display text and absolute URL
 */
export function formatUrlForDisplay(url, appScanBaseUrl = 'https://eu.cloud.appscan.com') {
  if (!url) {
    return { text: 'N/A', url: null };
  }

  const absoluteUrl = convertToAbsoluteUrl(url, appScanBaseUrl);
  const label = getUrlLabel(absoluteUrl);

  return {
    text: label,
    url: absoluteUrl,
    isAbsolute: isAbsoluteUrl(absoluteUrl),
  };
}

export default {
  isAbsoluteUrl,
  convertAzureDevOpsUrl,
  convertAppScanUrl,
  convertToAbsoluteUrl,
  getUrlLabel,
  formatUrlForDisplay,
};
