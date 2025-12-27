# Data Model: Dependency Upgrade

**Date**: 2025-12-27
**Feature**: 001-dependency-upgrade

## Overview

This is a dependency upgrade feature. No new data entities are introduced. This document describes the existing data structures that interact with upgraded dependencies and any modifications required for compatibility.

---

## Existing Entities (No Changes to Structure)

### 1. ParquetDocument

**Purpose**: Represents an open Parquet file in the editor

**Attributes**:
- `uri`: string - The file URI (e.g., `file:///path/to/file.parquet`)
- `database`: Database - DuckDB database instance (upgraded from 0.10.2 to 1.4.3)
- `connection`: Connection - DuckDB connection object (NEW in 1.4.3 API)
- `tableName`: string - SQL table name for the Parquet file
- `dispose`: () => void - Cleanup function

**Relationships**:
- One-to-one with Parquet file on disk
- Uses DuckDB connection for all queries

**Migration Notes**:
```typescript
// Current (DuckDB 0.10.2)
import Database from 'duckdb';
const database = new Database(uri.fsPath, { readonly: true });

// Upgraded (DuckDB 1.4.3)
import Database from 'duckdb';
const database = Database.connect(uri.fsPath);
const connection = database.connection();
```

### 2. QueryResult

**Purpose**: Represents SQL query results sent to webview

**Attributes**:
- `columns`: Array<{name: string, type: string}> - Column metadata
- `rows`: Array<Array<any>> - Query result data
- `hasMore`: boolean - Whether more results available (pagination)

**Validation Rules**:
- BigInt values MUST be converted to strings before including in rows (CRITICAL for JSON serialization)
- Row arrays MUST match column order
- `hasMore` true only if total rows > chunk size

**Migration Notes**:
- No structural changes
- Verify BigInt conversion works with DuckDB 1.4.3 BigInt handling
- Test with INT64 columns to ensure string conversion

### 3. WebviewMessage

**Purpose**: Message protocol between extension and webview

**Message Types**:
```typescript
type WebviewMessage =
  | { type: 'query'; sql: string; }
  | { type: 'fetchMore'; }
  | { type: 'ready' };

type ExtensionMessage =
  | { type: 'queryResults'; columns: Column[]; rows: Row[]; hasMore: boolean; }
  | { type: 'queryError'; message: string; }
```

**Migration Notes**:
- No changes to message structure
- Ensure TypeScript 5.6.3 strict mode typing satisfied

---

## Modified Data Access Patterns

### DuckDB Connection Management

**Before (0.10.2)**:
```typescript
// src/parquetDocument.ts (current)
import Database from 'duckdb';

class ParquetDocument {
  private database: Database;

  constructor(uri: vscode.Uri) {
    this.database = new Database(uri.fsPath, { readonly: true });
  }

  runQuery(sql: string): any[] {
    return this.database.exec(sql);
  }
}
```

**After (1.4.3)**:
```typescript
// src/parquetDocument.ts (upgraded)
import Database from 'duckdb';

class ParquetDocument {
  private database: Database;
  private connection: Connection;

  constructor(uri: vscode.Uri) {
    this.database = Database.connect(uri.fsPath);
    this.connection = this.database.connection();
  }

  async runQuery(sql: string): Promise<any[]> {
    return await this.connection.all(sql);
  }

  dispose(): void {
    this.connection.close();
    this.database.close();
  }
}
```

### BigInt Serialization

**Current Implementation** (MUST VERIFY STILL WORKS):
```typescript
// src/util.ts or parquetDocument.ts
function serializeBigInt(value: any): any {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeBigInt);
  }
  if (typeof value === 'object' && value !== null) {
    const result: any = {};
    for (const key in value) {
      result[key] = serializeBigInt(value[key]);
    }
    return result;
  }
  return value;
}

// Usage in query results
const safeResults = {
  columns: result.columns,
  rows: serializeBigInt(result.rows),
  hasMore: result.rows.length >= chunkSize
};
```

**Migration Notes**:
- DuckDB 1.4.3 still returns BigInt for INT64 columns (same as 0.10.2)
- Existing `serializeBigInt()` function should continue to work
- **TEST REQUIRED**: Verify with actual Parquet file containing INT64 data

---

## Configuration Data

### VSCode Settings (No Changes)

User settings remain unchanged (FR-011):
- `parquet-explorer.defaultQuery`: string (default: "SELECT * FROM ${tableName}")
- `parquet-explorer.tableName`: string (default: "data")
- `parquet-explorer.useFileNameAsTableName`: boolean (default: false)
- `parquet-explorer.chunkSize`: number (default: 100, min: 30)

### package.json Updates

```json
{
  "engines": {
    "vscode": "^1.107.0"  // upgraded from ^1.74.0
  },
  "dependencies": {
    "duckdb": "^1.4.3"  // upgraded from ^0.10.2
  },
  "devDependencies": {
    "typescript": "5.9.3",  // upgraded, pinned version
    "@types/vscode": "1.107.0",  // upgraded from ^1.73.0
    "@types/node": "25.0.3",  // upgraded for TS 5.9.3
    "esbuild": "0.27.2",  // upgraded from ^0.18.17
    "@typescript-eslint/eslint-plugin": "^8.0.0",  // update to ^9.0.0 for ESLint 9.x
    "@typescript-eslint/parser": "^8.0.0",  // update to ^9.0.0 for ESLint 9.x
    "eslint": "9.39.2"  // upgraded with flat config migration
  }
}
```

**ESLint Configuration Changes**:
- **Removed**: `.eslintrc.json` (legacy config)
- **Added**: `eslint.config.js` (flat config format)
- See research.md §4 for migration details and example config

**Note on @typescript-eslint**: Update to versions ^9.0.0 compatible with ESLint 9.x

---

## State Transitions

### DuckDB Connection Lifecycle

```
[File Open] → Database.connect() → connection() → Ready
[Query] → connection.all() → Results → Serialize → Send to Webview
[File Close] → connection.close() → database.close() → Disposed
```

**Error States**:
- Connection failed → Show error in webview (existing behavior)
- Query failed → Send {type: 'queryError', message} to webview (existing behavior)
- BigInt serialization failed → Catch error, log, show error message (ENHANCE: add explicit error handling)

---

## Validation Rules

### Type Safety (TypeScript 5.6.3 Strict Mode)

**Must Enforce**:
```typescript
// Enable in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true
  }
}
```

**Impact**: May reveal latent type issues in existing code. Budget time for fixes.

### BigInt Conversion Validation

**Rule**: Every query result MUST pass through `serializeBigInt()` before JSON serialization

**Validation Approach**:
```typescript
// Add assertion in development mode
if (process.env.NODE_ENV === 'development') {
  const serialized = serializeBigInt(result);
  JSON.stringify(serialized);  // Will throw if BigInt remains
}
```

---

## No New Entities

This upgrade does not introduce new data structures. The focus is on:
1. Upgrading dependency versions
2. Migrating to new API patterns (DuckDB connection management)
3. Verifying existing functionality still works (BigInt serialization, query execution)
4. Adding new UX feature (upgrade notification)
