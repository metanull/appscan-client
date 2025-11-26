# Publishing Guide

Your package is now ready to be published to npm! Here's what has been set up:

## Changes Made

### 1. ✅ Dynamic Swagger Download
- Modified `scripts/generate-api-client.js` to download swagger.json from HCL AppScan Cloud
- Removed the local `resource/swagger.json` file (not your property)
- Downloads from: `https://eu.cloud.appscan.com/swagger/v4/swagger.json`

### 2. ✅ Package Metadata
- Added `repository`, `bugs`, and `homepage` URLs
- Added author: `metanull`
- All pointing to: `github.com/metanull/appscan-client`

### 3. ✅ Publishing Script
- Added `prepublishOnly` script that automatically:
  - Downloads and generates the latest API client
  - Runs all tests
  - Ensures package quality before publishing

### 4. ✅ .npmignore
Created to exclude from the published package:
- Tests and test coverage
- Development config files (eslint, jest, prettier)
- IDE settings
- Environment files (.env)
- Git files
- CI/CD files
- Resource documentation
- Build artifacts

## How to Publish

### First Time Setup

1. **Create npm account** (if you don't have one):
   ```bash
   # Visit https://www.npmjs.com/signup
   ```

2. **Login to npm**:
   ```bash
   npm login
   ```

3. **Verify package name availability**:
   ```bash
   npm search appscan-client
   ```
   If taken, update `name` in package.json to something unique like:
   - `@metanull/appscan-client`
   - `hcl-appscan-client`
   - `appscan-cloud-cli`

### Publishing Steps

1. **Test the package locally**:
   ```bash
   # Create a tarball
   npm pack
   
   # Test install globally
   npm install -g ./appscan-client-1.0.0.tgz
   
   # Test the CLI
   appscan --help
   
   # Uninstall test
   npm uninstall -g appscan-client
   ```

2. **Verify everything works**:
   ```bash
   # Ensure API is generated
   npm run generate-api
   
   # Run tests
   npm test
   
   # Check what will be published
   npm pack --dry-run
   ```

3. **Publish to npm**:
   ```bash
   # For first publish (public package)
   npm publish --access public
   
   # For subsequent versions
   npm publish
   ```

### After Publishing

Users can install globally:
```bash
npm install -g appscan-client
```

And use immediately:
```bash
appscan --help
appscan list-applications
```

## Version Management

When making updates:

1. Update version in `package.json`:
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. Publish:
   ```bash
   npm publish
   ```

## Important Notes

- The `prepublishOnly` script ensures the API client is always generated fresh from the latest swagger spec
- Tests must pass before publishing
- No proprietary swagger.json file is included in the package
- The package is ready for public use under ISC license

## Package Info

- **Name**: appscan-client
- **Version**: 1.0.0
- **Binary**: `appscan` command
- **Node**: >=20.0.0
- **License**: ISC
