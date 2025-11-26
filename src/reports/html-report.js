import { marked } from 'marked';
import { MarkdownReportGenerator } from './markdown-report.js';

export class HtmlReportGenerator {
  constructor() {
    this.markdownGenerator = new MarkdownReportGenerator();
  }

  generateApplicationsReport(applications) {
    const markdown = this.markdownGenerator.generateApplicationsReport(applications);
    return this.wrapInHtml(marked.parse(markdown), 'AppScan Applications Report');
  }

  generateScansReport(scans, appName) {
    const markdown = this.markdownGenerator.generateScansReport(scans, appName);
    return this.wrapInHtml(marked.parse(markdown), 'AppScan Scans Report');
  }

  generateIssuesReport(issues, scanName) {
    const markdown = this.markdownGenerator.generateIssuesReport(issues, scanName);
    return this.wrapInHtml(marked.parse(markdown), 'AppScan Issues Report');
  }

  generateScanExecutionsReport(executions, scanName) {
    const markdown = this.markdownGenerator.generateScanExecutionsReport(
      executions,
      scanName
    );
    return this.wrapInHtml(marked.parse(markdown), 'AppScan Scan Executions Report');
  }

  wrapInHtml(content, title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
            border-bottom: 2px solid #95a5a6;
            padding-bottom: 5px;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th {
            background-color: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #ecf0f1;
        }
        tr:hover {
            background-color: #f8f9fa;
        }
        tr:last-child td {
            border-bottom: none;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>`;
  }
}

export default HtmlReportGenerator;
