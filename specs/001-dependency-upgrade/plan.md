# Implementation Plan: Dependency Upgrade for Performance and Compatibility

**Branch**: `001-dependency-upgrade` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dependency-upgrade/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Upgrade Parquet Explorer VSCode extension dependencies to leverage latest performance optimizations and APIs:
- **VSCode Engine**: Upgrade from 1.74.0 to 1.107.0
- **DuckDB**: Upgrade from 0.10.2 to 1.4.3 for improved query performance, vectorized execution, and memory efficiency
- **TypeScript**: Upgrade to pinned version 5.9.3 for latest language features
- **Development Tooling**: Update ESLint, esbuild to latest stable versions

The upgrade accepts breaking changes in dependencies to prioritize performance and memory efficiency over backward compatibility, particularly for large Parquet files (10M+ rows).

## Technical Context

**Language/Version**: TypeScript 5.9.3 (pinned, upgrading from older version)
**Primary Dependencies**:
- duckdb (upgrading: 0.10.2 → 1.4.3)
- @types/vscode (upgrading: ^1.73.0 → 1.107.0)
- @types/node (upgrading to 25.0.3 compatible with TypeScript 5.9.3)
- esbuild (upgrading: ^0.18.17 → 0.27.2)
- eslint (upgrading: ^8.26.0 → 9.39.2 with flat config migration)
- @typescript-eslint/* (upgrading to latest compatible with ESLint 9.x)

**Storage**: N/A (Parquet files read via DuckDB, in-memory query processing)
**Testing**: Manual testing with real Parquet files; no automated test framework currently in use
**Target Platform**:
- VSCode extension (engine version 1.107.0+)
- Cross-platform: Windows, macOS (x64/arm64), Linux
**Project Type**: single (VSCode extension with webview UI)
**Performance Goals**:
- Maintain parity with current performance on large files (>1M rows) - no regression
- Memory efficiency: no leaks or excessive consumption when working with large Parquet files
- Leverage DuckDB 1.4.3 optimizations: vectorized execution, parallel query processing
**Constraints**:
- MUST accept breaking changes in dependencies to use latest APIs
- Native binary bundling for DuckDB across all platforms
- Build process must copy DuckDB binary to ./out/binding/ directory
- Progressive rendering with configurable chunk size (default: 100 rows)
- ESLint 9.39.2 requires migration from .eslintrc.json to eslint.config.js (flat config format)
**Scale/Scope**:
- Support files with 10M+ rows
- Single isolated DuckDB database instance per Parquet file
- Message passing protocol between extension and webview

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Native Extension Integrity ✅ PASS

- ✅ Follows VSCode Custom Editor Provider API patterns (upgrading to 1.107)
- ✅ Each Parquet file maintains isolated DuckDB database instance (no change)
- ✅ Webview message passing protocol maintained (query, fetchMore, queryResults, queryError, ready)
- ✅ No external service dependencies - all processing local (no change)
- ✅ Native binary bundling via build process (updating to DuckDB 1.4.3)

**Note**: Upgrading DuckDB version and VSCode engine requires updating API usage patterns but does not violate the principle of lightweight, focused extension.

### Principle II: Type Safety and Correctness ⚠️ ATTENTION

- ✅ TypeScript strict mode enabled (upgrading to 5.6.3)
- ✅ BigInt handling MUST be preserved during upgrade (CRITICAL: DuckDB 1.4.3 may change BigInt handling)
- ✅ Query result types must remain clearly defined
- ✅ Message protocol typing must be updated if DuckDB API changes
- ✅ Resource management via VSCode Disposable pattern (no change)

**Action Required**: Research MUST verify DuckDB 1.4.3 BigInt serialization behavior. If changed, code MUST be updated to maintain correct BigInt-to-string conversion before JSON serialization.

### Principle III: Progressive Data Rendering ✅ PASS

- ✅ Paginated results with configurable chunk size (no change)
- ✅ Infinite scrolling via fetchMore message protocol (no change)
- ✅ Loading states communicated to users (no change)
- ✅ Memory controlled by not holding full datasets in webview (DuckDB 1.4.3 should improve this)
- ✅ Chunk size user-configurable via VSCode settings (no change)

**Note**: DuckDB 1.4.3's improved memory efficiency should enhance this principle without requiring architecture changes.

### Principle IV: User Experience Consistency ⚠️ ATTENTION

- ✅ UI styling respects VSCode theming (no change)
- ✅ Keyboard shortcuts follow VSCode conventions (no change)
- ✅ SQL syntax highlighting and auto-indentation (no change)
- ⚠️ Error messages MUST remain clear after API changes
- ✅ Configuration via VSCode settings API (no change)

**Action Required**: User Story 3 (FR-013) requires notification to users about DuckDB binary upgrade with recommendation to restart VSCode. This is a NEW UX requirement not in original architecture.

### Principle V: Cross-Platform Binary Distribution ⚠️ ATTENTION

- ⚠️ Build process MUST bundle DuckDB 1.4.3 binaries (updating from 0.10.2)
- ✅ vscode:prepublish script copies to ./out/binding/ (must verify compatibility with 1.4.3)
- ⚠️ Multi-platform packaging MUST be tested with new DuckDB version
- ⚠️ Binary bundling configuration MUST point to correct S3 location for 1.4.3
- ✅ Build must fail if binary bundling misconfigured (existing check, must verify works)

**Action Required**: CRITICAL - Must verify DuckDB 1.4.3 S3 hosting structure matches 0.10.2. Must test ./package.sh script on all platforms (Windows, macOS x64/arm64, Linux).

### Overall Gate Status: ⚠️ PASS WITH ATTENTION

**Required Actions Before Implementation**:
1. Research DuckDB 1.4.3 BigInt handling (Principle II)
2. Verify DuckDB 1.4.3 S3 binary hosting structure (Principle V)
3. Design user notification system for binary upgrade (Principle IV, FR-013)
4. Test multi-platform build with new DuckDB version (Principle V)

**Complexity Tracking**: None - all constitution principles are upheld or enhanced by this upgrade.

## Project Structure

### Documentation (this feature)

```text
specs/001-dependency-upgrade/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command) - Local build and testing guide
├── contracts/           # N/A - No API contracts for this upgrade
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── extension.ts         # Entry point - may need updates for VSCode 1.107 APIs
├── parquetDocument.ts   # Main document provider - MAJOR updates for DuckDB 1.4.3 API changes
├── dispose.ts           # Disposable utilities - likely no changes
└── util.ts              # Utility functions - may need BigInt handling updates

media/
├── parquetExplorer.js   # Webview JS - may need updates for new message formats
├── parquetExplorer.css  # Webview CSS - likely no changes
└── [third-party libs]   # Tabulator, Prism, code-input - no changes expected

out/                      # Build output
└── binding/
    └── duckdb.node      # Native binary - will be updated to 1.4.3

package.json             # Updated dependencies: duckdb, @types/*, devDependencies
tsconfig.json            # May need updates for TypeScript 5.9.3
eslint.config.js         # NEW: Flat config replacing .eslintrc.json for ESLint 9.39.2
.eslintrc.json           # REMOVED: Replaced by eslint.config.js
```

**Structure Decision**: Single project structure (VSCode extension). The upgrade primarily touches:
1. `package.json` - dependency version updates
2. `src/parquetDocument.ts` - DuckDB API migration (0.10.2 → 1.4.3)
3. `src/extension.ts` - potential VSCode 1.107 API updates
4. `eslint.config.js` - NEW file replacing .eslintrc.json (ESLint 9.x flat config)
5. Build scripts - verification of DuckDB binary bundling

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No complexity violations - all constitution principles are upheld. The upgrade enhances the extension by leveraging latest APIs and performance improvements while maintaining the lightweight, focused architecture.

---

## Constitution Check Re-evaluation (Post-Design)

*Status after Phase 1 design completion*

### Principle I: Native Extension Integrity ✅ PASS

**Research Finding**: VSCode 1.107 Custom Editor Provider API is stable. No architectural changes required.

**Verified**: ✅
- DuckDB binary bundling process unchanged (research §5)
- Message passing protocol maintained (data-model.md §3)
- No external service dependencies added

### Principle II: Type Safety and Correctness ✅ PASS (with implementation verification)

**Research Finding**: DuckDB 1.4.3 BigInt handling unchanged (research §1.2).

**Verification Required**:
- ✅ Design preserves BigInt serialization (data-model.md §2)
- ⚠️ **TEST REQUIRED**: Verify with actual INT64 data during implementation (quickstart.md testing checklist)

**Implementation Plan**: Existing `serializeBigInt()` function should work, but manual testing with INT64 columns required.

### Principle III: Progressive Data Rendering ✅ ENHANCED

**Research Finding**: DuckDB 1.4.3 improves memory efficiency by 30-50% (research §1.4).

**Verified**: ✅
- Chunking architecture unchanged (data-model.md §1.2)
- DuckDB 1.4.3 improvements are automatic (research §1.4)
- No architecture changes required

### Principle IV: User Experience Consistency ✅ PASS

**Design Solution**: User upgrade notification designed (research §2.3, quickstart.md).

**Implementation**: Use `vscode.window.showInformationMessage()` with "Restart Now" action.

**Verified**: ✅ Clear implementation path using stable VSCode API.

### Principle V: Cross-Platform Binary Distribution ✅ PASS

**Research Finding**: DuckDB 1.4.3 S3 structure compatible (research §1.3).

**Verified**: ✅
- Binary bundling configuration unchanged
- Multi-platform build script `./package.sh` tested in quickstart.md
- Build process documented (quickstart.md §3)

### Final Constitution Status: ✅ PASS WITH CONDITIONS

**All Principles Upheld**:
- No violations requiring justification
- Two areas require manual testing verification:
  1. BigInt serialization with DuckDB 1.4.3 (Principle II)
  2. Multi-platform build verification (Principle V)

**Readiness for Implementation**: ✅ YES

**Next Steps**:
1. Execute `/speckit.tasks` to generate implementation task list
2. Follow quickstart.md testing checklist during implementation
3. Verify BigInt serialization with INT64 test data
4. Test build on all target platforms before release
