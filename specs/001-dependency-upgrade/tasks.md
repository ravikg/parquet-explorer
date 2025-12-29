---

description: "Task list for dependency upgrade feature implementation"
---

# Tasks: Dependency Upgrade for Performance and Compatibility

**Input**: Design documents from `/specs/001-dependency-upgrade/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Per specification (FR-020 through FR-025), automated tests ARE REQUIRED for breaking API changes. Tests must be created in tests/ directory using sample Parquet files provided by user in tests/fixtures/. Automated tests are integrated directly into implementation phases (e.g., T042a-T042n in Phase 4). Manual testing procedures are also documented in quickstart.md and phase testing guides.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. **Total Tasks**: 87 (increased from 74 to include automated tests)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, tests/, package.json, eslint.config.js at repository root
- Paths shown below reflect the actual project structure from plan.md

---

## Phase 0: Prerequisites (Pre-Upgrade Validation)

**Purpose**: Ensure documentation is current and current project builds successfully before starting dependency upgrade

**CRITICAL**: This phase MUST be completed first to establish a working baseline

- [x] T000 [P] Update README.md with comprehensive local build and run instructions including: prerequisites (Node.js, npm), installation steps, build commands, development workflow, and troubleshooting
- [x] T001 [P] Install dependencies by running `npm install` without errors
- [x] T002 [P] Verify current project builds successfully by running `npm run vscode:prepublish` without errors
- [x] T003 [P] Verify current project runs in development mode by launching Extension Development Host (F5) and opening a test .parquet file successfully
- [x] T004 [P] Create docs/phase-0-manual-testing.md documenting steps to test baseline functionality before upgrade
- [x] T005 [P] Create git commit for Phase 0 completion with message: "Phase 0: Complete prerequisites - update README and verify baseline build" (no co-author)

**Checkpoint**: Project builds and runs successfully with current dependencies; README documentation complete; baseline testing documented

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency version updates

- [x] T006 Update VSCode engine version to ^1.107.0 in package.json
- [x] T007 Update DuckDB dependency from ^0.10.2 to ^1.4.3 in package.json
- [x] T008 Update TypeScript to pinned version 5.9.3 in package.json devDependencies
- [x] T009 Update @types/vscode to 1.107.0 in package.json devDependencies
- [x] T010 Update @types/node to 25.0.3 in package.json devDependencies
- [x] T011 Update esbuild to 0.27.2 in package.json devDependencies
- [x] T012 Update ESLint to 9.39.2 in package.json devDependencies
- [x] T013 Update @typescript-eslint/eslint-plugin to latest 9.x-compatible version in package.json devDependencies
- [x] T014 Update @typescript-eslint/parser to latest 9.x-compatible version in package.json devDependencies
- [x] T015 Update TypeScript compiler options in tsconfig.json for strict mode (if not already enabled)
- [x] T016 Run `npm install` to install all updated dependencies and resolve any peer dependency conflicts
- [x] T017 Fix any TypeScript compilation errors introduced by new type definitions or strict mode
- [x] T018 [P] Create docs/phase-1-manual-testing.md documenting steps to test dependency updates (verify all dependencies installed correctly)
- [x] T019 [P] Create git commit for Phase 1 completion with message: "Phase 1: Update all dependencies (VSCode 1.107.0, DuckDB 1.4.3, TypeScript 5.9.3, ESLint 9.39.2)" (no co-author)

**Checkpoint**: All dependencies updated and installed successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and configuration that MUST be complete before ANY user story implementation

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

- [x] T020 Create eslint.config.js with flat config format to replace .eslintrc.json (ESLint 9.x requirement)
- [x] T021 Configure TypeScript parser and @typescript-eslint plugin in eslint.config.js using flat config format
- [x] T022 Migrate existing linting rules from .eslintrc.json to eslint.config.js (preserve all existing rules)
- [x] T023 Delete old .eslintrc.json file after eslint.config.js is created and verified working
- [x] T024 Run `npm run lint` to verify ESLint 9.39.2 flat config works correctly without errors
- [x] T025 Verify `npm run vscode:prepublish` build script correctly bundles DuckDB 1.4.3 binary to ./out/binding/duckdb.node
- [x] T026 Update package.json binary configuration to point to DuckDB 1.4.3 S3 hosting structure (if needed)
- [x] T027 Run `npm run vscode:prepublish` and verify build completes without errors across all platforms
- [x] T028 [P] Create docs/phase-2-manual-testing.md documenting steps to test ESLint 9.39.2 flat config and build verification
- [x] T029 [P] Create git commit for Phase 2 completion with message: "Phase 2: Migrate to ESLint 9.39.2 flat config and verify build with DuckDB 1.4.3" (no co-author)

**Checkpoint**: Foundation ready - DuckDB API migration and user story implementation can now begin

---

## Phase 3: User Story 1 - Maintain Performance with Latest VSCode (Priority: P1) 🎯 MVP

**Goal**: Ensure extension activates and works correctly on VSCode 1.107+

**Independent Test**: Install extension on VSCode 1.107+, open .parquet files, verify normal operation

### Implementation for User Story 1

- [x] T030 [US1] Test extension activation on VSCode 1.107+ by opening a .parquet file in Extension Development Host
- [x] T031 [US1] Verify Custom Editor Provider API works correctly with VSCode 1.107 in src/extension.ts
- [x] T032 [US1] Test that all .parquet, .parq, and .pq file extensions are still supported in package.json customEditors selector
- [x] T033 [US1] Verify SQL query execution works correctly on VSCode 1.107+ by running test queries in development instance
- [x] T034 [US1] Test query results display correctly in the webview interface on VSCode 1.107+
- [x] T035 [P] Create docs/phase-3-manual-testing.md documenting steps to test VSCode 1.107 compatibility (extension activation, query execution, UI rendering)
- [x] T036 [P] Create git commit for Phase 3 completion with message: "Phase 3: Complete User Story 1 - VSCode 1.107 compatibility verified" (no co-author)

**Checkpoint**: At this point, User Story 1 should be fully functional - extension works on VSCode 1.107+

---

## Phase 4: User Story 2 - Leverage DuckDB Performance Improvements (Priority: P1)

**Goal**: Upgrade to DuckDB 1.4.3 API for better query performance and bug fixes

**Independent Test**: Open large Parquet files (>1M rows), execute complex queries, verify performance is equal to or better than previous version

### Implementation for User Story 2

- [x] T037 [P] [US2] Update DuckDB imports in src/parquetDocument.ts (if using default imports, verify compatibility with 1.4.3)
- [x] T038 [US2] Migrate DuckDB connection initialization from `new Database()` to `Database.connect()` pattern in src/parquetDocument.ts constructor
- [x] T039 [US2] Add `connection` attribute to ParquetDocument class in src/parquetDocument.ts to hold DuckDB 1.4.3 connection object
- [x] T040 [US2] Update query execution method in src/parquetDocument.ts from `db.exec()` to `await conn.all()` pattern
- [x] T041 [US2] Update ParquetDocument dispose method in src/parquetDocument.ts to close connection before closing database: `connection.close()` then `database.close()`
- [x] T042 [US2] Verify BigInt serialization in src/parquetDocument.ts still works correctly with DuckDB 1.4.3 BigInt handling (test with INT64 columns)

### Automated Tests for DuckDB 1.4.3 API (FR-020 through FR-025)

- [x] T042a [P] [US2] Create or enhance tests/helper.ts with DuckDBTestHelper class for test utilities (FR-022)
- [x] T042b [P] [US2] Add helper methods to tests/helper.ts: listSampleParquetFiles(), getSampleParquetFile(), getParquetSchema(), getParquetRowCount() (FR-022)
- [x] T042c [P] [US2] Create tests/duckdb.test.ts with comprehensive test suite for DuckDB 1.4.3 API migration (FR-020)
- [x] T042d [P] [US2] Add automated test to tests/duckdb.test.ts verifying Database.connect() pattern and connection object creation (FR-023)
- [x] T042e [P] [US2] Add automated test to tests/duckdb.test.ts verifying connection disposal order: connection.close() then database.close() (FR-023)
- [x] T042f [P] [US2] Add automated test to tests/duckdb.test.ts for SELECT queries with various result types (FR-024)
- [x] T042g [P] [US2] Add automated test to tests/duckdb.test.ts for aggregation queries (SUM, COUNT, AVG, GROUP BY) (FR-024)
- [x] T042h [P] [US2] Add automated test to tests/duckdb.test.ts for filtered queries (WHERE clauses) (FR-024)
- [x] T042i [P] [US2] Add automated test to tests/duckdb.test.ts for queries returning INT64/BigInt columns (FR-024, FR-025)
- [x] T042j [P] [US2] Add automated test to tests/duckdb.test.ts verifying BigInt serialization to Number before JSON.stringify (FR-025)
- [x] T042k [P] [US2] Add automated test to tests/duckdb.test.ts using small dataset (<100 rows) from tests/fixtures/ (FR-021, FR-024)
- [x] T042l [P] [US2] Add automated test to tests/duckdb.test.ts using large dataset (>10,000 rows) from tests/fixtures/ (FR-021, FR-024)
- [x] T042m [P] [US2] Run automated test suite with `npm test` and verify all tests pass with >80% code coverage (SC-012)
- [x] T042n [US2] Fix any failing automated tests and ensure test coverage meets >80% threshold for modified code paths (SC-012)

### Manual Testing for DuckDB 1.4.3 API

- [x] T043 [US2] Test query execution with large Parquet files (>1M rows) and verify results return within expected timeframes
- [x] T044 [US2] Test complex SQL queries (joins, aggregations, filters) and verify results are accurate and complete
- [x] T045 [US2] Verify no native module crashes, memory leaks, or hanging processes when using DuckDB 1.4.3 by monitoring during testing
- [x] T046 [P] Create docs/phase-4-manual-testing.md documenting steps to test DuckDB 1.4.3 API migration (connection management, query execution, BigInt serialization)
- [ ] T047 [P] Create git commit for Phase 4 completion with message: "Phase 4: Complete User Story 2 - DuckDB 1.4.3 API migration and verification" (no co-author)

**Checkpoint**: At this point, User Story 2 should be fully functional - DuckDB 1.4.3 API migration complete

---

## Phase 5: User Story 3 - Memory Efficiency and Performance Optimization (Priority: P1)

**Goal**: Leverage DuckDB 1.4.3 optimizations for memory efficiency and performance on large files

**Independent Test**: Open very large Parquet files (10M+ rows), monitor memory usage and query execution times, verify no regression

### Implementation for User Story 3

- [ ] T048 [P] [US3] Verify progressive rendering (chunked results) still works correctly with DuckDB 1.4.3 in src/parquetDocument.ts query results handling
- [ ] T049 [US3] Test memory usage when opening very large Parquet files (10M+ rows) using Task Manager / Activity Monitor
- [ ] T050 [US3] Verify query performance is equal to or better than previous version by executing queries and comparing execution times
- [ ] T051 [US3] Test working with multiple large Parquet files in succession and verify extension properly releases resources between file switches
- [ ] T052 [US3] Verify no memory accumulation across sessions by monitoring memory usage after opening/closing multiple large files
- [ ] T053 [P] Create docs/phase-5-manual-testing.md documenting steps to test memory efficiency and performance (large file handling, progressive rendering, memory leak detection)
- [ ] T054 [P] Create git commit for Phase 5 completion with message: "Phase 5: Complete User Story 3 - Memory efficiency and performance verified with DuckDB 1.4.3" (no co-author)

**Checkpoint**: At this point, User Story 3 should be fully functional - memory efficiency verified with large files

---

## Phase 6: User Story 4 - Modern Development Tooling (Priority: P2)

**Goal**: Upgrade development tooling for long-term maintainability

**Independent Test**: Run build process and linting to verify all tooling works correctly

### Implementation for User Story 4

- [ ] T055 [US4] Verify TypeScript 5.9.3 compilation completes without type errors by running `npm run compile` or `tsc -p ./`
- [ ] T056 [US4] Verify esbuild 0.27.2 bundling works correctly by running `npm run vscode:prepublish` and checking output
- [ ] T057 [US4] Verify ESLint 9.39.2 with flat config executes successfully by running `npm run lint` with no warnings or errors
- [ ] T058 [US4] Test that all dependencies install without conflicts by running `npm install` in a fresh environment
- [ ] T059 [P] Create docs/phase-6-manual-testing.md documenting steps to test development tooling (TypeScript compilation, esbuild bundling, ESLint linting)
- [ ] T060 [P] Create git commit for Phase 6 completion with message: "Phase 6: Complete User Story 4 - Development tooling upgraded (TypeScript 5.9.3, esbuild 0.27.2, ESLint 9.39.2)" (no co-author)

**Checkpoint**: At this point, User Story 4 should be fully functional - all development tooling upgraded successfully

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalization, user notification, documentation, and cross-cutting improvements

- [ ] T061 [P] Implement DuckDB binary version detection in src/parquetDocument.ts using vscode.globalState to track upgrade status
- [ ] T062 Implement DuckDB binary upgrade notification in src/parquetDocument.ts using vscode.window.showInformationMessage() when version change detected
- [ ] T063 Add "Restart Now" button action to binary upgrade notification that executes vscode.commands.executeCommand('workbench.action.reloadWindow')
- [ ] T064 [P] Verify backward compatibility with user settings (defaultQuery, tableName, chunkSize) by testing each setting in VSCode configuration
- [ ] T065 [P] Test extension activation with no settings configured (all defaults) to ensure it works out of the box
- [ ] T066 Create or update quickstart.md local development guide per FR-016 (quickstart.md already created in specs/001-dependency-upgrade/)
- [ ] T067 [P] Copy or link quickstart.md to repository root (or docs/ directory) for easy access by developers
- [ ] T068 Read current version from package.json and tag as version-final (e.g., "1.2.1-final") for rollback capability per FR-015
- [ ] T069 Run manual testing checklist from quickstart.md including: basic functionality, large file performance, edge cases, and cross-platform testing
- [ ] T070 Verify BigInt serialization with INT64 test data per quickstart.md testing checklist (Constitution Principle II requirement)
- [ ] T071 [P] Test ./package.sh script on available platforms to verify multi-platform DuckDB binary bundling (Constitution Principle V requirement)
- [ ] T072 [P] Create docs/phase-7-manual-testing.md documenting final testing steps (notifications, settings compatibility, cross-platform verification, BigInt serialization)
- [ ] T073 [P] Create git commit for Phase 7 completion with message: "Phase 7: Complete polish and cross-cutting concerns - extension ready for release" (no co-author)

**Checkpoint**: All polish and cross-cutting concerns complete, extension ready for release

---

## Dependencies & Execution Order

### Phase Dependencies

- **Prerequisites (Phase 0)**: No dependencies - MUST be completed first to establish baseline and documentation
- **Setup (Phase 1)**: Depends on Prerequisites completion - can start immediately after Phase 0
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories (must configure ESLint and verify build before DuckDB API migration)
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Stories 1, 2, 3 can proceed in parallel (if staffed) as they focus on different aspects:
    - US1: VSCode compatibility
    - US2: DuckDB API migration
    - US3: Memory/performance verification
  - User Story 4 (development tooling) can proceed in parallel after Setup
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (VSCode Compatibility)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (DuckDB Performance)**: Can start after Foundational (Phase 2) - Code changes from US1 (extension.ts) may need to be integrated
- **User Story 3 (Memory Efficiency)**: Can start after Foundational (Phase 2) - Depends on US2 for DuckDB API migration, but performance testing is independent
- **User Story 4 (Development Tooling)**: Can start after Setup (Phase 1) - Independent of user stories

### Within Each User Story

- US1: No tests (manual verification only)
- US2: Tasks are sequential (T037 → T038 → T039 → T040 → T041 → T042), then parallel testing (T043, T044, T045)
- US3: All testing tasks can run in parallel
- US4: All verification tasks can run in parallel

### Parallel Opportunities

- **Setup Phase**: All dependency updates (T006-T015) can be done in parallel by editing package.json once
- **Foundational Phase**: ESLint flat config creation (T020-T022) can be designed before implementation, but T020-T023 must be sequential
- **User Stories**:
  - US1 and US4 can be worked on in parallel after Setup/Foundational
  - US3 testing tasks (T048-T052) can all run in parallel
  - Polish phase parallel tasks (T061, T064, T065, T067, T071, T072) can run in parallel

---

## Parallel Example: User Story 2

```bash
# After T037-T042 complete (DuckDB API migration), launch tests together:
Task T043: Test with large Parquet files
Task T044: Test complex SQL queries
Task T045: Verify no crashes/memory leaks
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 0: Prerequisites (update README, verify baseline build)
2. Complete Phase 1: Setup (dependency updates)
3. Complete Phase 2: Foundational (ESLint flat config, build verification)
4. Complete Phase 3: User Story 1 (VSCode 1.107 compatibility)
5. Complete Phase 4: User Story 2 (DuckDB API migration)
6. **STOP and VALIDATE**: Test extension thoroughly with large Parquet files
7. If MVP works: User Stories 1 & 2 provide core upgrade value - can deploy/demonstrate

### Incremental Delivery (All User Stories)

1. Complete Prerequisites → Baseline established and documented
2. Complete Setup + Foundational → Foundation ready
3. Add User Story 1 → Test VSCode 1.107+ compatibility → Deploy/Demo (MVP part 1!)
4. Add User Story 2 → Test DuckDB 1.4.3 migration → Deploy/Demo (MVP complete!)
5. Add User Story 3 → Test memory/performance with 10M+ row files → Deploy/Demo
6. Add User Story 4 → Verify development tooling → Deploy/Demo (Full upgrade!)
7. Polish → Final release with all documentation and testing complete

### Parallel Team Strategy

With multiple developers:

1. Team completes Prerequisites + Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (VSCode compatibility)
   - Developer B: User Story 2 (DuckDB API migration)
   - Developer C: User Story 4 (Development tooling)
3. After US2 complete:
   - Developer A/B: User Story 3 (Performance and memory testing)
4. All converge on Polish phase for final testing and documentation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable (except US3 which benefits from US2 completion)
- This is a dependency upgrade with breaking changes accepted - prioritize getting US1 and US2 working correctly
- **Phase 0 is CRITICAL**: Establish baseline and update README before making any dependency changes
- **Every phase includes**: Manual testing documentation in docs/ and git commit (without co-author)
- Manual testing per quickstart.md is the primary validation method (no automated test tasks)
- BigInt serialization verification (T070) is CRITICAL per Constitution Principle II
- Multi-platform build verification (T071) is CRITICAL per Constitution Principle V
- Stop at any checkpoint to validate and demo progress
- Avoid: vague tasks, missing file paths, skipping build verification
- **Total Task Count**: 74 tasks (T000-T073) across 8 phases (including Phase 0 prerequisites)
