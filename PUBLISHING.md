# Publishing Guide - GitHub Packages

Your package is now ready to be published to GitHub Packages as a public npm package! Here's what has been set up:

## Changes Made

### 1. ✅ Dynamic Swagger Download
- Modified `scripts/generate-api-client.js` to download swagger.json from HCL AppScan Cloud
- Removed the local `resource/swagger.json` file (not your property)
- Downloads from: `https://eu.cloud.appscan.com/swagger/v4/swagger.json`

### 2. ✅ Package Metadata
- Package name: `@metanull/appscan-client` (scoped for GitHub)
- Added `repository`, `bugs`, and `homepage` URLs
- Added author: `metanull`
- Configured `publishConfig` for GitHub Packages registry

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

## How to Publish to GitHub Packages

### First Time Setup

1. **Create a GitHub Personal Access Token (PAT)**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Set a note like "npm publish to GitHub Packages"
   - Select scopes:
     - ✅ `write:packages` (to publish packages)
     - ✅ `read:packages` (to download packages)
     - ✅ `delete:packages` (optional, to delete packages)
     - ✅ `repo` (if repo is private, optional for public)
   - Click "Generate token" and **copy the token** (you won't see it again!)

2. **Authenticate with GitHub Packages**:
   ```bash
   # Login to GitHub Packages registry
   npm login --scope=@metanull --auth-type=legacy --registry=https://npm.pkg.github.com
   
   # Username: your GitHub username (metanull)
   # Password: paste your Personal Access Token (PAT)
   # Email: your public email address
   ```

   **Alternative method** - Create/edit `~/.npmrc`:
   ```
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT_HERE
   @metanull:registry=https://npm.pkg.github.com
   ```

### Publishing Steps

1. **Test the package locally**:
   ```bash
   # Create a tarball
   npm pack
   
   # Test install globally (from the tarball)
   npm install -g ./metanull-appscan-client-1.0.0.tgz
   
   # Test the CLI
   appscan --help
   
   # Uninstall test
   npm uninstall -g @metanull/appscan-client
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

3. **Commit and push to GitHub** (important!):
   ```bash
   git add .
   git commit -m "Prepare for GitHub Packages publishing"
   git push origin main
   ```

4. **Publish to GitHub Packages**:
   ```bash
   # Publish as a public package
   npm publish --access public
   ```

### After Publishing

The package will be available at:
- **Package page**: https://github.com/metanull/appscan-client/packages
- **Registry**: `@metanull/appscan-client` on GitHub Packages

## Installing the Package

### For End Users

Users need to configure npm to use GitHub Packages for your scope:

1. **Create/edit `~/.npmrc`** (one-time setup):
   ```
   @metanull:registry=https://npm.pkg.github.com
   ```

2. **For public packages** (no authentication needed for installation):
   ```bash
   npm install -g @metanull/appscan-client
   ```

3. **Use the CLI**:
   ```bash
   appscan --help
   appscan list-applications
   ```

### Quick Install Script for Users

You can share this with users:

```bash
# Configure registry for @metanull scope
npm config set @metanull:registry https://npm.pkg.github.com

# Install globally
npm install -g @metanull/appscan-client

# Verify installation
appscan --version
```

## Version Management

When making updates:

1. **Update version**:
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. **Commit and push**:
   ```bash
   git push origin main --tags
   ```

3. **Publish new version**:
   ```bash
   npm publish
   ```

## Troubleshooting

### Authentication Issues
- Verify your PAT has `write:packages` scope
- Ensure you're logged in: `npm whoami --registry=https://npm.pkg.github.com`
- Check your `~/.npmrc` has the correct token

### Package Not Found After Publishing
- Check the package is visible at: https://github.com/metanull?tab=packages
- Ensure the package is set to **public** (not private)
- Verify the repository link in package settings

### Installation Issues for Users
- Users must configure the `@metanull` scope to use GitHub Packages registry
- For public packages, no authentication is needed for installation
- Provide the `.npmrc` configuration in your README

## Important Notes

- ✅ Package is scoped: `@metanull/appscan-client`
- ✅ Published to: GitHub Packages (not npmjs.com)
- ✅ The `prepublishOnly` script ensures the API client is generated fresh
- ✅ Tests must pass before publishing
- ✅ No proprietary swagger.json file is included
- ✅ Package is public and free to install
- ✅ Repository must exist on GitHub before publishing

## Package Info

- **Name**: @metanull/appscan-client
- **Registry**: GitHub Packages
- **Version**: 1.0.0
- **Binary**: `appscan` command
- **Node**: >=20.0.0
- **License**: ISC
- **Repository**: https://github.com/metanull/appscan-client

## GitHub Package Settings

After publishing, you can:
- View package at: https://github.com/metanull?tab=packages
- Make it public (if not already)
- Link it to your repository
- View download statistics
- Manage versions and delete old versions
