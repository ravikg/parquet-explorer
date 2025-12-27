# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Parquet Explorer is a VSCode extension that provides SQL query capabilities for Apache Parquet files. It uses DuckDB as the query engine and implements a custom editor provider with a webview-based interface.

## Development Commands

- **Build**: `npm run vscode:prepublish` - Compiles TypeScript, bundles with esbuild, and copies DuckDB native binary to `./out/binding/`
- **Watch mode**: `npm run watch` - Continuously compiles TypeScript on file changes
- **Lint**: `npm run lint` - Runs ESLint on `src/**/*.ts`
- **Multi-platform packaging**: `./package.sh` - Creates packages for all platforms (Windows, Linux, macOS)

## Architecture

### Extension Backend (`src/`)

The extension follows VSCode's Custom Editor Provider pattern:

- **extension.ts**: Minimal entry point that registers `ParquetDocumentProvider`
- **parquetDocument.ts**: Contains both `ParquetDocument` (the document model) and `ParquetDocumentProvider` (the editor provider)
  - Each Parquet file gets its own in-memory DuckDB database instance
  - Manages query execution with pagination via `runQuery()` and `fetchMore()`
  - Handles BigInt serialization for JSON (DuckDB returns BigInt which JSON.stringify cannot handle)
- **dispose.ts**: Utilities for VSCode's Disposable pattern
- **util.ts**: Shared utility functions

### Frontend Webview (`media/`)

The webview communicates with the extension via message passing:

- **parquetExplorer.js**: Main webview logic
  - Uses Tabulator.js for data table display with infinite scrolling
  - Implements code-input element for SQL editing with Prism.js syntax highlighting
  - Executes queries with Ctrl/Cmd+Enter keyboard shortcut
  - Manages chunked result fetching for large datasets
- **parquetExplorer.css**: Styling that integrates with VSCode theming
- **Third-party libraries**: Tabulator.js, Prism.js, code-input (all bundled)

### Message Protocol

Extension ↔ Webview communication uses these message types:
- `query`: Execute SQL query
- `fetchMore`: Load next chunk of results
- `queryResults`: Return query data with columns and rows
- `queryError`: Return query error message
- `ready`: Webview initialized

## Key Implementation Details

### DuckDB Integration
- Each document maintains its own DuckDB connection
- Binary must be copied to `./out/binding/duckdb.node` during build (see `vscode:prepublish` script)
- Table name defaults to "data" but can be overridden by settings or filename

### Query Execution Flow
1. User enters SQL in webview and presses Ctrl/Cmd+Enter
2. Webview sends `query` message to extension
3. Extension runs query against DuckDB, fetches first chunk
4. Extension sends `queryResults` back with columns, rows, and hasMore flag
5. Webview renders data in Tabulator table
6. As user scrolls, webview requests more chunks via `fetchMore`

### BigInt Handling
DuckDB returns BigInt values which cannot be directly serialized to JSON. The code converts BigInt to string or number before sending to webview.

## Configuration Settings

Users can configure these VSCode settings:
- `parquet-explorer.defaultQuery`: SQL query template (supports `${tableName}` placeholder)
- `parquet-explorer.tableName`: Default table name
- `parquet-explorer.useFileNameAsTableName`: Use filename as table name
- `parquet-explorer.chunkSize`: Results per request (default: 100)

## File Patterns

The extension handles `.parquet`, `.parq`, and `.pq` files.

## Active Technologies
- TypeScript 5.6.3 (pinned, upgrading from older version) (001-dependency-upgrade)
- N/A (Parquet files read via DuckDB, in-memory query processing) (001-dependency-upgrade)
- TypeScript 5.9.3 (pinned, upgrading from older version) (001-dependency-upgrade)

## Recent Changes
- 001-dependency-upgrade: Added TypeScript 5.6.3 (pinned, upgrading from older version)
