# Documentation

This folder contains supplementary documentation for the appscan-client tool.

## Main Documentation

See [../README.md](../README.md) for complete usage instructions.

## Additional Documentation Files

### API Reference
- **appscan-swagger-v4.json** - OpenAPI specification for HCL AppScan Cloud API v4
- **appscan-api-responses.md** - Sample API responses for reference

### Advanced Triage Features
- **triage-report.md** - Comprehensive documentation for the `triage-report` command with querying, filtering, and bulk operations
- **triage-requirements.md** - Original requirements document for triage functionality
- **triage-code-review.md** - Implementation notes and code review documentation

## Building from Source

See the "Development" section in the main README for build instructions.

## Regenerating API Client

The API client is auto-generated from the swagger specification:

```bash
npm run generate-api
```

This reads `appscan-swagger-v4.json` and generates `src/generated/Api.js`.
