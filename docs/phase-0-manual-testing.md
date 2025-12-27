# Phase 0 Manual Testing - Baseline Verification

**Date**: 2025-12-28
**Purpose**: Verify current project builds and runs successfully before starting dependency upgrade

---

## Prerequisites Check

### 1. Node.js Version Compatibility

**Finding**: Critical compatibility issue discovered

- **Current System Node Version**: v25.2.1
- **Issue**: DuckDB 0.10.2 native module compilation fails with Node.js v25
- **Error**: C++ template keyword compilation errors in DuckDB source code
- **Resolution**: Add `.nvmrc` file specifying Node.js 18 (LTS)

### 2. .nvmrc Configuration

**Action Taken**: Created `.nvmrc` file with Node.js 18

```bash
# .nvmrc file contents
18
```

**Instructions for Team Members**:

```bash
# Install Node.js 18 if not already available
nvm install 18

# Switch to Node.js 18
nvm use 18

# Verify version
node --version  # Should output: v18.x.x

# Clean up previous failed installation
rm -rf node_modules package-lock.json

# Install dependencies
npm install
```

---

## Installation Testing

### Test Case 1: Dependency Installation

**Status**: ⚠️ **BLOCKED - Waiting for Node.js 18**

**Steps**:
1. Ensure Node.js 18 is active (`nvm use 18`)
2. Run `npm install`
3. Verify no compilation errors

**Expected Result**:
- All dependencies install successfully
- DuckDB native module loads without errors
- `node_modules/duckdb/lib/binding/duckdb.node` exists

**Actual Result (Node.js v25.2.1)**:
```
npm error gyp ERR! stack Error: Failed to execute 'node-gyp build'
npm error node-pre-gyp ERR! not ok
```

**Root Cause**: Node.js v25 ABI incompatibility with DuckDB 0.10.2

---

## Build Testing

### Test Case 2: Production Build

**Status**: ⏸️ **PENDING - Cannot proceed until dependencies installed**

**Steps**:
1. Run `npm run vscode:prepublish`
2. Verify `./out/binding/duckdb.node` is created
3. Verify TypeScript compilation succeeds

**Expected Result**:
- Build completes without errors
- DuckDB binary is copied to `./out/binding/`
- Minified output is generated

---

## Runtime Testing

### Test Case 3: Development Mode

**Status**: ⏸️ **PENDING - Cannot proceed until build succeeds**

**Steps**:
1. Open project in VSCode (`code .`)
2. Press F5 to launch Extension Development Host
3. Open a test `.parquet` file
4. Verify Parquet Explorer interface loads
5. Execute a simple query: `SELECT * FROM data LIMIT 10`

**Expected Result**:
- Extension activates successfully
- Parquet file displays data correctly
- Query executes and returns results

---

## Baseline Status Summary

| Check | Status | Notes |
|-------|--------|-------|
| Node.js compatibility | ⚠️ **ISSUE FOUND** | Node.js v25 incompatible with DuckDB 0.10.2 |
| .nvmrc configuration | ✅ Complete | Specifies Node.js 18 |
| Dependency installation | ⏸️ **BLOCKED** | Requires Node.js 18 |
| Build verification | ⏸️ **PENDING** | Blocked by installation |
| Runtime testing | ⏸️ **PENDING** | Blocked by build |

---

## Key Findings

### Critical Issue

**Problem**: Project cannot build with Node.js v25.x
**Impact**: BLOCKS all Phase 0 verification tasks
**Solution**: Use Node.js 18 LTS (specified in `.nvmrc`)

### Documentation Updates Made

1. **README.md**: Added comprehensive "Development Setup" section with:
   - Prerequisites (Node.js 18.x, npm 9.x)
   - Installation steps
   - Build commands
   - Troubleshooting guide

2. **.nvmrc**: Created to specify Node.js 18 for all developers

---

## Next Steps

### For Immediate Completion of Phase 0:

1. **All Team Members**: Switch to Node.js 18
   ```bash
   nvm install 18
   nvm use 18
   ```

2. **Clean Install**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verify Build**:
   ```bash
   npm run vscode:prepublish
   ```

4. **Test Runtime**:
   ```bash
   code .
   # Press F5, open .parquet file, test query
   ```

### After Phase 0 Complete:

- ✅ All dependencies install successfully
- ✅ Project builds without errors
- ✅ Extension runs in development mode
- ✅ Baseline functionality verified
- → Ready to proceed with Phase 1 (dependency upgrades)

---

## Notes

- This document captures the **actual baseline state** before any dependency upgrades
- The Node.js compatibility issue is **expected and valuable** - it demonstrates why Phase 0 verification is critical
- Once Node.js 18 is confirmed working, Phase 0 will be complete and we can safely proceed with upgrading dependencies
