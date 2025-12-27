# Quickstart: Building and Testing Parquet Explorer Locally

**Version**: For 001-dependency-upgrade feature
**Last Updated**: 2025-12-27

This guide explains how to build the Parquet Explorer VSCode extension from source and run it locally for manual testing.

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or later)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Git**
   - Verify: `git --version`

4. **VSCode** (1.107.0 or later for testing the upgraded extension)
   - Download: https://code.visualstudio.com/

### Optional but Recommended

1. **Sample Parquet Files**
   - Create or download test files with various sizes
   - Include files with >1M rows for performance testing
   - Include files with INT64 columns to test BigInt serialization

---

## Quick Start (5 Minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/adamviola/parquet-explorer.git
cd parquet-explorer

# Checkout the upgrade branch (if testing the upgrade)
git checkout 001-dependency-upgrade

# Install dependencies
npm install
```

**Expected Output**: No errors. If you see peer dependency warnings, note them but continue.

### 2. Build the Extension

```bash
# Production build with DuckDB binary bundling
npm run vscode:prepublish
```

**Expected Output**:
```
rm -rf ./out
mkdir ./out ./out/binding/
cp ./node_modules/duckdb/lib/binding/duckdb.node ./out/binding/
[esbuild output...]
```

**Verification**: Check that `./out/binding/duckdb.node` exists
```bash
ls -lh ./out/binding/
# Should see: duckdb.node (approximately 30-50 MB depending on platform)
```

### 3. Open in VSCode

```bash
# Open the project in VSCode
code .
```

### 4. Launch Extension Host

**Method A: Using VSCode UI**

1. Press `F5` or click "Run > Start Debugging"
2. A new "Extension Development Host" VSCode window will open
3. This new window has your extension loaded

**Method B: Using Command Palette**

1. In the new Extension Development Host window, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: "Extensions: Install Extensions from VSIX"
3. Navigate to your project and select `out/extension.js` (or use the file picker to load the unpackaged extension)

### 5. Test with a Parquet File

1. In the Extension Development Host window, open any `.parquet`, `.parq`, or `.pq` file
2. The Parquet Explorer should open automatically
3. Try running a SQL query: `SELECT * FROM data LIMIT 10`
4. Press `Ctrl+Enter` or `Cmd+Enter` to execute

**Success Criteria**:
- ✅ Extension activates without errors
- ✅ Parquet file loads and displays data
- ✅ SQL queries execute successfully
- ✅ Results display in table format

---

## Development Workflow

### Watch Mode (Continuous Build)

```bash
# Run TypeScript compiler in watch mode
npm run watch
```

**Use Case**: Active development - automatically recompiles TypeScript files when you save changes.

**Note**: Watch mode does NOT bundle DuckDB binary. For full testing, run `npm run vscode:prepublish` after code changes.

### Linting

```bash
# Run ESLint
npm run lint
```

**Expected Output**: No errors or warnings. If TypeScript strict mode reveals issues, fix them before committing.

---

## Manual Testing Checklist

### Basic Functionality

- [ ] Open a small Parquet file (<1000 rows)
- [ ] Verify data displays correctly in table
- [ ] Execute a simple SELECT query
- [ ] Scroll through results
- [ ] Close and reopen the file

### Large File Performance

- [ ] Open a large Parquet file (>1M rows)
- [ ] Execute a query with LIMIT 100
- [ ] Verify results return quickly (<2 seconds)
- [ ] Scroll to load more results (pagination)
- [ ] Monitor memory usage in Task Manager / Activity Monitor
- [ ] **Compare**: Performance should be equal to or better than previous version

### Query Testing

- [ ] SELECT with WHERE clause
- [ ] Aggregate queries (COUNT, SUM, AVG)
- [ ] JOIN queries (if multiple files loaded)
- [ ] ORDER BY with large result sets
- [ ] Queries returning INT64 columns (BigInt test)

### Edge Cases

- [ ] Empty Parquet file
- [ ] File with many columns (>100)
- [ ] File with special characters in column names
- [ ] Malformed Parquet file (should show error, not crash)
- [ ] Very large single column value

### Binary Upgrade Notification (New in this version)

- [ ] First time opening a file after upgrade, see notification: "Parquet Explorer has upgraded its database engine. Please restart VSCode for best performance."
- [ ] Click "Restart Now" button (if present)
- [ ] Verify VSCode reloads successfully

### Cross-Platform Testing

Test on each target platform if possible:

- [ ] **Windows** (x64): Build and test
- [ ] **macOS** (x64): Build and test
- [ ] **macOS** (arm64 / Apple Silicon): Build and test
- [ ] **Linux** (x64): Build and test

**Platform-Specific Notes**:
- macOS may require accepting unsigned extension warnings
- Windows Defender may flag the extension as unknown (allow it)
- Linux may require executing with proper permissions

---

## Troubleshooting

### Build Fails: "Cannot find module 'duckdb'"

**Problem**: npm install didn't complete successfully

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Extension Won't Activate: "Module not found"

**Problem**: DuckDB binary not bundled correctly

**Solution**:
```bash
# Verify binary exists
ls -lh ./out/binding/duckdb.node

# If missing, rebuild
npm run vscode:prepublish
```

### "BigInt cannot be serialized" Error

**Problem**: DuckDB 1.4.3 BigInt handling issue

**Solution**: This is the bug we're testing for! If you see this:
1. Note the query that caused it
2. Check if the result includes INT64 columns
3. Report the issue - BigInt serialization may need fixing

### Performance Regression

**Problem**: Queries slower than previous version

**Investigation Steps**:
1. Check DuckDB version: Open `node_modules/duckdb/package.json` and verify version is 1.4.3
2. Check console/terminal for error messages
3. Try a simpler query (e.g., `SELECT COUNT(*) FROM data`)
4. Compare to previous version if available

### VSCode "Engine not compatible" Warning

**Problem**: VSCode version too old (<1.107.0)

**Solution**: Upgrade VSCode to latest version

---

## Testing Against Previous Version

### Side-by-Side Comparison

1. **Install Previous Version**:
   - Download from marketplace: https://marketplace.visualstudio.com/items?itemName=AdamViola.parquet-explorer
   - Note the version number

2. **Test Previous Version**:
   - Open same test files
   - Run same queries
   - Note query execution times

3. **Test Upgraded Version**:
   - Build locally (this guide)
   - Run in Extension Development Host
   - Compare execution times

### Performance Metrics to Track

| Metric | Previous Version | Upgraded Version | Status |
|--------|-----------------|------------------|---------|
| Time to open 1M-row file | _____ seconds | _____ seconds | ✅/⚠️ |
| Query execution time | _____ seconds | _____ seconds | ✅/⚠️ |
| Memory usage (idle) | _____ MB | _____ MB | ✅/⚠️ |
| Memory usage (query) | _____ MB | _____ MB | ✅/⚠️ |

**Success**: Upgraded version is equal to or better than previous version

---

## Packaging for Distribution

### Create VSIX Package

```bash
# Use the provided packaging script
./package.sh
```

**Output**: Platform-specific VSIX files
- `parquet-explorer-<version>-win32-x64.vsix`
- `parquet-explorer-<version>-darwin-x64.vsix`
- `parquet-explorer-<version>-darwin-arm64.vsix`
- `parquet-explorer-<version>-linux-x64.vsix`

### Install VSIX Locally for Testing

1. In VSCode, press `Ctrl+Shift+P` or `Cmd+Shift+P`
2. Type: "Extensions: Install from VSIX..."
3. Select the appropriate VSIX file for your platform
4. Reload VSCode when prompted

---

## Getting Help

### Build Issues

- Check `npm run lint` output for TypeScript errors
- Review `research.md` for known migration issues
- Check DuckDB 1.4.3 release notes: https://github.com/duckdb/duckdb/releases

### Runtime Issues

- Open VSCode "Developer Tools" (Help > Toggle Developer Tools)
- Check Console tab for error messages
- Check Extension Host output in the main VSCode window

### Performance Issues

- Monitor memory usage in Task Manager / Activity Monitor
- Check DuckDB connection is properly closed when file is closed
- Verify progressive rendering is working (chunking results)

---

## Next Steps

After verifying local build works:

1. ✅ All basic functionality tests pass
2. ✅ Large file performance is acceptable
3. ✅ No memory leaks or excessive usage
4. ✅ BigInt serialization works correctly

Then proceed to:
- Create pull request with upgraded dependencies
- Request testing on multiple platforms (Windows, macOS, Linux)
- Prepare for marketplace release
- Tag previous version for rollback (per FR-015)

---

## Additional Resources

- **VSCode Extension API**: https://code.visualstudio.com/api
- **DuckDB Documentation**: https://duckdb.org/docs/
- **DuckDB Node.js Bindings**: https://www.npmjs.com/package/duckdb
- **Project README**: `README.md` in repository root
