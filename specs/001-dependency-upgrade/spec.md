# Feature Specification: Dependency Upgrade for Performance and Compatibility

**Feature Branch**: `001-dependency-upgrade`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "lets upgrade the difference dependencies like duckdb latest version is 1.4.3 ; vscode version 1.107 etc. to make the plugin latest up to date and more performant"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintain Performance with Latest VSCode (Priority: P1)

As a user of Parquet Explorer, I want the extension to work seamlessly with the latest version of VSCode so that I can benefit from VSCode's latest features and improvements without compatibility issues.

**Why this priority**: Critical - users regularly update VSCode and expect extensions to continue working. Outdated engine requirements can prevent installation or cause runtime issues.

**Independent Test**: Can be fully tested by installing the extension on VSCode 1.107+ and opening various Parquet files to verify normal operation.

**Acceptance Scenarios**:

1. **Given** a user has VSCode 1.107 or later installed, **When** they install or update Parquet Explorer, **Then** the extension activates successfully without errors
2. **Given** a user has the extension installed, **When** they open any .parquet, .parq, or .pq file, **Then** the Parquet Explorer interface loads and displays data correctly
3. **Given** the extension is running on VSCode 1.107+, **When** the user executes SQL queries, **Then** queries execute successfully and results display correctly

---

### User Story 2 - Leverage DuckDB Performance Improvements (Priority: P1)

As a user analyzing large Parquet files, I want the extension to use the latest DuckDB engine so that I can benefit from performance improvements and bug fixes in newer DuckDB versions.

**Why this priority**: High - DuckDB 1.4.3 includes significant performance improvements, better query optimization, and bug fixes over version 0.10.2. Users will experience faster query execution and better resource utilization.

**Independent Test**: Can be fully tested by opening large Parquet files (>1M rows) and executing complex queries, comparing execution times and resource usage to the previous version.

**Acceptance Scenarios**:

1. **Given** a user opens a Parquet file with millions of rows, **When** they execute a SELECT query, **Then** results return within expected timeframes and display correctly
2. **Given** a user executes complex SQL queries (joins, aggregations, filters), **When** the query completes, **Then** results are accurate and complete
3. **Given** the extension uses DuckDB 1.4.3, **When** queries execute, **Then** there are no native module crashes, memory leaks, or hanging processes

---

### User Story 3 - Memory Efficiency and Performance Optimization (Priority: P1)

As a data analyst working with large Parquet files, I want the extension to use the latest, most performant APIs so that I can analyze large datasets efficiently without running into memory issues or experiencing slow query performance.

**Why this priority**: Critical - performance and memory efficiency are the primary goals. Users working with multi-million-row Parquet files need the extension to leverage DuckDB's latest optimization features, even if this means accepting breaking changes in how the extension internally processes queries.

**Independent Test**: Can be fully tested by opening large Parquet files (10M+ rows) and monitoring memory usage and query execution times compared to the previous version.

**Acceptance Scenarios**:

1. **Given** a user opens a very large Parquet file (10M+ rows), **When** they execute queries, **Then** memory usage remains efficient (no memory leaks or excessive consumption)
2. **Given** the extension uses DuckDB 1.4.3, **When** queries are executed, **Then** performance is equal to or better than the previous version by leveraging vectorized execution and parallel processing
3. **Given** a user works with multiple large Parquet files in succession, **When** they switch between files, **Then** the extension properly releases resources and does not accumulate memory across sessions

---

### User Story 4 - Modern Development Tooling (Priority: P2)

As a maintainer or contributor to the extension, I want development dependencies to be current so that the codebase benefits from the latest TypeScript language features, linting improvements, and build tool optimizations.

**Why this priority**: Medium - important for long-term maintainability and security, but does not directly impact end-user functionality. Updated tooling reduces technical debt and improves developer experience.

**Independent Test**: Can be fully tested by running the build process (`npm run vscode:prepublish`) and linting (`npm run lint`) to verify all tooling works correctly with updated versions.

**Acceptance Scenarios**:

1. **Given** a developer clones the repository, **When** they run `npm install`, **Then** all dependencies install without conflicts or warnings
2. **Given** a developer makes code changes, **When** they run `npm run lint`, **Then** ESLint executes successfully with the latest rules and parsers
3. **Given** a developer builds the extension, **When** they run `npm run vscode:prepublish`, **Then** the build completes successfully with esbuild and TypeScript compilation

---

### Edge Cases

- **Cached binary handling**: When users update the extension, the extension detects the old DuckDB binary version, displays a notification that the binary is being updated, and recommends restarting VSCode to ensure proper loading
- **Rollback strategy**: If critical issues are discovered after upgrade, maintain the previous extension version in the marketplace or a release branch to enable quick re-publication as a fallback
- How does the extension handle Parquet files created with older or newer Parquet format versions?
- What happens if a user is on an older VSCode version (<1.74.0) after the upgrade?
- How does the build process handle platform-specific DuckDB binaries across different architectures (x64, arm64)?
- What happens if esbuild's minification or bundling behavior changes in the new version?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST support VSCode engine version 1.107.0 or later (upgraded from 1.74.0)
- **FR-002**: The extension MUST upgrade DuckDB from version 0.10.2 to version 1.4.3
- **FR-003**: The extension MUST continue to support .parquet, .parq, and .pq file extensions
- **FR-004**: The build process MUST successfully bundle the DuckDB 1.4.3 native binary for all platforms (Windows, macOS x64/arm64, Linux)
- **FR-005**: TypeScript types MUST be updated to compatible versions (@types/vscode 1.107.0, @types/node 25.0.3 compatible with TypeScript 5.9.3)
- **FR-006**: Development tooling MUST be upgraded to latest stable versions: TypeScript 5.9.3 (pinned), esbuild 0.27.2, ESLint 9.39.2 with flat config migration
- **FR-007**: All existing functionality MUST continue to work after the upgrade where APIs remain compatible; code MUST be updated to use breaking changes in newer APIs to leverage performance improvements
- **FR-008**: The extension MUST leverage latest DuckDB 1.4.3 APIs for optimal query performance and memory efficiency, even if this requires code changes from 0.10.2 patterns
- **FR-009**: The extension MUST handle BigInt values from DuckDB queries correctly (no regression in JSON serialization)
- **FR-010**: Build scripts MUST correctly copy the new DuckDB binary to ./out/binding/ directory
- **FR-011**: The extension MUST maintain backward compatibility with user settings (defaultQuery, tableName, chunkSize, etc.)
- **FR-012**: The extension MUST maintain memory efficiency when working with large Parquet files by leveraging DuckDB 1.4.3's efficient data loading APIs, ensuring no memory regression
- **FR-013**: The extension MUST detect when upgrading from an old DuckDB binary version and notify the user that the binary is being updated
- **FR-014**: The extension MUST recommend VSCode restart after DuckDB binary upgrade to ensure proper loading
- **FR-015**: The previous extension version MUST be maintained in the marketplace or a release branch to enable quick rollback if critical issues are discovered
- **FR-016**: A local development guide MUST be created documenting how to build the extension from source and run it locally for manual testing

### Key Entities

- **VSCode Engine**: The minimum VSCode version required to run the extension (upgrading to 1.107.0)
- **DuckDB Binary**: Native library for SQL query execution (upgrading from 0.10.2 to 1.4.3)
- **TypeScript Types**: Type definitions for VSCode API and Node.js runtime
- **Build Toolchain**: esbuild (bundler), TypeScript compiler (tsc), ESLint (linter)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Extension installs and activates successfully on VSCode 1.107+ without engine compatibility warnings
- **SC-002**: Query execution performance on large files (>1M rows) maintains parity with the previous version (no performance regression)
- **SC-003**: Memory usage when working with large Parquet files is stable and efficient, with no memory leaks or excessive consumption compared to the previous version
- **SC-004**: All existing extension features work correctly: query execution, result display, pagination, error handling
- **SC-005**: Extension leverages latest APIs from upgraded dependencies for optimal performance, even when this requires code changes from older API patterns
- **SC-006**: Build process completes without errors across all target platforms (Windows, macOS x64/arm64, Linux)
- **SC-007**: Extension passes linting with updated ESLint rules without introducing new warnings
- **SC-008**: TypeScript compilation completes without type errors using updated type definitions

## Clarifications

### Session 2025-12-27

- Q: When users update to this version with the new DuckDB binary, how should the extension handle the old cached binary? → A: Detect and notify - inform user that binary is being updated and recommend restart
- Q: Which TypeScript version strategy should be used for the upgrade? → A: Pin to specific version (e.g., "typescript": "5.6.3")
- Q: If critical issues are discovered after users upgrade to this version, what's the rollback strategy? → A: Marketplace rollback - maintain previous version as fallback and re-publish if needed
- Q: Should the upgrade accept breaking changes in dependencies to use the latest performant APIs? → A: Yes - upgrade to latest versions even with breaking changes, prioritize performance and memory efficiency
- Q: What is the priority for this upgrade - compatibility or performance? → A: Performance and memory efficiency are primary, accept breaking changes to use latest APIs
- Q: What specific performance improvement target should the upgrade achieve on large Parquet files (>1M rows)? → A: No specific target - just ensure no performance regression
- Q: Should local build and testing documentation be created for manual testing? → A: Yes - document how to build and run the plugin locally for manual testing as part of the deliverables
- Q: What are the latest versions of all dependencies to upgrade to? → A: TypeScript 5.9.3, DuckDB 1.4.3, @types/vscode 1.107.0, @types/node 25.0.3, esbuild 0.27.2, ESLint 9.39.2

## Assumptions

1. DuckDB 1.4.3 may introduce breaking API changes compared to version 0.10.2; code will be updated to use the latest APIs for optimal performance
2. VSCode 1.107 may introduce breaking changes to the Custom Editor Provider API; code will be updated to use latest VSCode APIs
3. The DuckDB 1.4.3 native binary is available for all required platforms via the S3-hosted repository
4. esbuild 0.27.2's bundling behavior may introduce breaking changes; the build configuration will be updated to leverage latest optimizations
5. Users on older VSCode versions (<1.107) will see a compatibility warning in the marketplace
6. TypeScript 5.9.3 (pinned specific version) may require code updates to leverage latest language features and type definitions
7. ESLint 9.39.2 requires migration from .eslintrc.json to flat config format (eslint.config.js)
8. Performance improvements from DuckDB 1.4.3 (vectorized execution, parallel query processing, optimized memory usage) will be fully leveraged
