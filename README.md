# Parquet Explorer

### Explore Parquet files with SQL

Parquet Explorer is a VSCode extension that provides a preview of and SQL query
exceution against Apache Parquet files. Under the hood, SQL queries are executed
by [DuckDB](https://duckdb.org/), which implements efficient partial reading and
parallel query processing.

![Demonstration of Parquet Explorer against iris.parquet](./iris.gif)

# Quick Start

1. Install the [Parquet Explorer extension](https://marketplace.visualstudio.com/items?itemName=AdamViola.parquet-explorer)
from the marketplace.

2. Open a Parquet (.parquet) file and the extension will activate.

# Development Setup

This section explains how to build and run Parquet Explorer locally for development and testing.

## Prerequisites

- **Node.js**: Version 18.x or later (check with `node --version`)
- **npm**: Version 9.x or later (check with `npm --version`)
- **Git**: For cloning the repository
- **VSCode**: Latest version recommended for extension development

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NickCrews/parquet-explorer.git
   cd parquet-explorer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This installs all required packages including DuckDB, TypeScript, and development tools.

## Building the Extension

### Production Build

To build the extension for production:

```bash
npm run vscode:prepublish
```

This command:
- Removes the old `./out` directory
- Compiles TypeScript code with esbuild
- Bundles the DuckDB native binary to `./out/binding/duckdb.node`
- Minifies the output for production use

**Expected output**: A new `./out` directory with compiled JavaScript and the DuckDB binary.

### Development Build (Watch Mode)

For active development with auto-recompilation:

```bash
npm run watch
```

This compiles TypeScript in watch mode and recompiles automatically when you save changes.

## Running the Extension Locally

### Using VSCode Extension Development Host

1. **Open the project in VSCode**:
   ```bash
   code .
   ```

2. **Launch Extension Development Host**:
   - Press `F5` or go to **Run > Start Debugging**
   - A new VSCode window (Extension Development Host) will open
   - The extension is now loaded in debug mode

3. **Test the extension**:
   - Open a `.parquet` file in the Extension Development Host
   - The Parquet Explorer interface should appear
   - You can execute SQL queries and verify functionality

4. **Debugging**:
   - Set breakpoints in your TypeScript code
   - Use the Debug Console in the original VSCode window
   - Inspect variables and step through code

### Manual Testing with Test Files

1. **Obtain test Parquet files**:
   - Use your own `.parquet` files or
   - Download sample datasets (e.g., from Kaggle or DuckDB's test data)

2. **Test basic functionality**:
   - Open a Parquet file
   - Verify data displays correctly
   - Execute a simple query: `SELECT * FROM data LIMIT 10`
   - Check query results appear

3. **Test large files** (if available):
   - Open files with 1M+ rows
   - Verify performance is acceptable
   - Check memory usage in Task Manager / Activity Monitor

## Development Workflow

### Typical Development Cycle

1. **Make changes** to TypeScript source files in `src/`
2. **Watch mode** (`npm run watch`) auto-recompiles
3. **Press F5** in VSCode to launch Extension Development Host
4. **Test your changes** in the debug window
5. **Iterate** until satisfied

### Linting

Before committing changes, run the linter:

```bash
npm run lint
```

This checks code style and reports any issues. Fix errors before committing.

### Running Tests

Currently, Parquet Explorer uses manual testing. See the **Testing Checklist** below for verification steps.

## Build Troubleshooting

### Common Issues and Solutions

**Issue**: `npm install` fails with permissions error
- **Solution**: Try using `sudo npm install` (Linux/macOS) or run terminal as Administrator (Windows)

**Issue**: DuckDB binary not found
- **Solution**: Run `npm run vscode:prepublish` to bundle the binary
- **Check**: Verify `./out/binding/duckdb.node` exists after build

**Issue**: Module not found errors
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Issue**: Extension doesn't activate
- **Solution**: Check VSCode version compatibility (requires 1.74.0+)
- **Check**: Look at Extension Host output in VSCode for error messages

**Issue**: Build succeeds but extension fails at runtime
- **Solution**: Verify DuckDB binary architecture matches your platform
- **Check**: Run `npm run vscode:prepublish` on your target platform

## Testing Checklist

Before committing changes or releasing, verify:

- [ ] Extension installs without errors
- [ ] Extension activates when opening a `.parquet` file
- [ ] Data displays correctly in the webview
- [ ] SQL queries execute successfully
- [ ] Query results display correctly
- [ ] Pagination works (fetching more results)
- [ ] Large files (>1M rows) load without crashes
- [ ] Memory usage is reasonable (no leaks)
- [ ] Linting passes: `npm run lint`
- [ ] Build completes: `npm run vscode:prepublish`

## Packaging for Distribution

To create a `.vsix` package for distribution:

```bash
npm run vscode:prepublish
vsce package
```

This creates a `parquet-explorer-<version>.vsix` file that can be:
- Installed locally: `code --install-extension parquet-explorer-<version>.vsix`
- Published to the VSCode Marketplace

For multi-platform packaging, use the provided script:

```bash
./package.sh
```

This creates packages for all supported platforms (Windows, macOS x64/arm64, Linux).

## Getting Help

- **Issues**: Report bugs on [GitHub Issues](https://github.com/NickCrews/parquet-explorer/issues)
- **Documentation**: See `specs/001-dependency-upgrade/quickstart.md` for detailed development guide
- **DuckDB Docs**: [https://duckdb.org/docs/](https://duckdb.org/docs/) for SQL reference