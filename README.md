# Custom OpenToken Library

Custom OpenToken support for Node.JS (Internal NCR Voyix Package)

This is a customized version of the original node-opentoken library for internal use at NCR Voyix.

## Installation

### Prerequisites

Ensure your `.npmrc` is configured for NCR Voyix Artifactory:

```bash
registry=https://ncrvoyix.jfrog.io/artifactory/api/npm/digitalbanking-npm-group/
//ncrvoyix.jfrog.io/artifactory/api/npm/digitalbanking-npm-group/:_authToken=YOUR_TOKEN
email=your.email@candescent.com
always-auth=true
```

### Install the Package

**Using NPM:**
```bash
npm install @dbk-nestjs/custom-opentoken
```

**Using Yarn:**
```bash
yarn add @dbk-nestjs/custom-opentoken
```

## Publishing Library

### Step 1: Make Your Changes

1. **Checkout to main branch:**
   ```bash
   git checkout main
   ```

2. **Make your code changes**

3. **Test your changes:**
   ```bash
   npm test
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Your description"
   ```

### Step 2: Version Bump

**Semantic versioning guidelines:**
- **Patch** (1.3.0 → 1.3.1): Bug fixes, small improvements
- **Minor** (1.3.0 → 1.4.0): New features, backward compatible
- **Major** (1.3.0 → 2.0.0): Breaking changes

**Bump version using npm:**
```bash
# For patch version
npm version patch

# For minor version
npm version minor

# For major version
npm version major

# Or manually specify version
npm version 1.3.1
```

### Step 3: Publish to NCR Voyix Artifactory

1. **Ensure you're authenticated:**
   ```bash
   # Check if you're logged in
   npm whoami --registry=https://ncrvoyix.jfrog.io/artifactory/api/npm/digitalbanking-npm-group/
   
   # If not authenticated, login
   npm login --registry=https://ncrvoyix.jfrog.io/artifactory/api/npm/digitalbanking-npm-group/
   ```

2. **Publish the package:**
   ```bash
   npm publish --registry=https://ncrvoyix.jfrog.io/artifactory/api/npm/digitalbanking-npm-group/
   ```

### Step 4: Push Changes to Git

```bash
# Push your changes and tags
git push origin main
git push origin --tags
```

## Troubleshooting

**Verify your publish:**
```bash
# Check if package is available
npm view @dbk-nestjs/custom-opentoken --registry=https://ncrvoyix.jfrog.io/artifactory/api/npm/digitalbanking-npm-group/
```
