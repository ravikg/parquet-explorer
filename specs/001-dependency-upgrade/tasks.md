---

description: "Task list for dependency upgrade feature implementation"
---

# Tasks: Dependency Upgrade for Performance and Compatibility

**Input**: Design documents from `/specs/001-dependency-upgrade/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Per specification, tests are NOT explicitly requested. This is a dependency upgrade with manual testing procedures documented in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, tests/, package.json, eslint.config.js at repository root
- Paths shown below reflect the actual project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency version updates

- [ ] T001 Update VSCode engine version to ^1.107.0 in package.json
- [ ] T002 Update DuckDB dependency from ^0.10.2 to ^1.4.3 in package.json
- [ ] T003 Update TypeScript to pinned version 5.9.3 in package.json devDependencies
- [ ] T004 Update @types/vscode to 1.107.0 in package.json devDependencies
- [ ] T005 Update @types/node to 25.0.3 in package.json devDependencies
- [ ] T006 Update esbuild to 0.27.2 in package.json devDependencies
- [ ] T007 Update ESLint to 9.39.2 in package.json devDependencies
- [ ] T008 Update @typescript-eslint/eslint-plugin to latest 9.x-compatible version in package.json devDependencies
- [ ] T009 Update @typescript-eslint/parser to latest 9.x-compatible version in package.json devDependencies
- [ ] T010 Update TypeScript compiler options in tsconfig.json for strict mode (if not already enabled)
- [ ] T011 Run `npm install` to install all updated dependencies and resolve any peer dependency conflicts
- [ ] T012 Fix any TypeScript compilation errors introduced by new type definitions or strict mode

**Checkpoint**: All dependencies updated and installed successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and configuration that MUST be complete before ANY user story implementation

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

- [ ] T013 Create eslint.config.js with flat config format to replace .eslintrc.json (ESLint 9.x requirement)
- [ ] T014 Configure TypeScript parser and @typescript-eslint plugin in eslint.config.js using flat config format
- [ ] T015 Migrate existing linting rules from .eslintrc.json to eslint.config.js (preserve all existing rules)
- [ ] T016 Delete old .eslintrc.json file after eslint.config.js is created and verified working
- [ ] T017 Run `npm run lint` to verify ESLint 9.39.2 flat config works correctly without errors
- [ ] T018 Verify `npm run vscode:prepublish` build script correctly bundles DuckDB 1.4.3 binary to ./out/binding/duckdb.node
- [ ] T019 Update package.json binary configuration to point to DuckDB 1.4.3 S3 hosting structure (if needed)
- [ ] T020 Run `npm run vscode:prepublish` and verify build completes without errors across all platforms

**Checkpoint**: Foundation ready - DuckDB API migration and user story implementation can now begin

---

## Phase 3: User Story 1 - Maintain Performance with Latest VSCode (Priority: P1) 🎯 MVP

**Goal**: Ensure extension activates and works correctly on VSCode 1.107+

**Independent Test**: Install extension on VSCode 1.107+, open .parquet files, verify normal operation

### Implementation for User Story 1

- [ ] T021 [US1] Test extension activation on VSCode 1.107+ by opening a .parquet file in Extension Development Host
- [ ] T022 [US1] Verify Custom Editor Provider API works correctly with VSCode 1.107 in src/extension.ts
- [ ] T023 [US1] Test that all .parquet, .parq, and .pq file extensions are still supported in package.json customEditors selector
- [ ] T024 [US1] Verify SQL query execution works correctly on VSCode 1.107+ by running test queries in development instance
- [ ] T025 [US1] Test query results display correctly in the webview interface on VSCode 1.107+

**Checkpoint**: At this point, User Story 1 should be fully functional - extension works on VSCode 1.107+

---

## Phase 4: User Story 2 - Leverage DuckDB Performance Improvements (Priority: P1)

**Goal**: Upgrade to DuckDB 1.4.3 API for better query performance and bug fixes

**Independent Test**: Open large Parquet files (>1M rows), execute complex queries, verify performance is equal to or better than previous version

### Implementation for User Story 2

- [ ] T026 [P] [US2] Update DuckDB imports in src/parquetDocument.ts (if using default imports, verify compatibility with 1.4.3)
- [ ] T027 [US2] Migrate DuckDB connection initialization from `new Database()` to `Database.connect()` pattern in src/parquetDocument.ts constructor
- [ ] T028 [US2] Add `connection` attribute to ParquetDocument class in src/parquetDocument.ts to hold DuckDB 1.4.3 connection object
- [ ] T029 [US2] Update query execution method in src/parquetDocument.ts from `db.exec()` to `await conn.all()` pattern
- [ ] T030 [US2] Update ParquetDocument dispose method in src/parquetDocument.ts to close connection before closing database: `connection.close()` then `database.close()`
- [ ] T031 [US2] Verify BigInt serialization in src/parquetDocument.ts still works correctly with DuckDB 1.4.3 BigInt handling (test with INT64 columns)
- [ ] T032 [US2] Test query execution with large Parquet files (>1M rows) and verify results return within expected timeframes
- [ ] T033 [US2] Test complex SQL queries (joins, aggregations, filters) and verify results are accurate and complete
- [ ] T034 [US2] Verify no native module crashes, memory leaks, or hanging processes when using DuckDB 1.4.3 by monitoring during testing

**Checkpoint**: At this point, User Story 2 should be fully functional - DuckDB 1.4.3 API migration complete

---

## Phase 5: User Story 3 - Memory Efficiency and Performance Optimization (Priority: P1)

**Goal**: Leverage DuckDB 1.4.3 optimizations for memory efficiency and performance on large files

**Independent Test**: Open very large Parquet files (10M+ rows), monitor memory usage and query execution times, verify no regression

### Implementation for User Story 3

- [ ] T035 [P] [US3] Verify progressive rendering (chunked results) still works correctly with DuckDB 1.4.3 in src/parquetDocument.ts query results handling
- [ ] T036 [US3] Test memory usage when opening very large Parquet files (10M+ rows) using Task Manager / Activity Monitor
- [ ] T037 [US3] Verify query performance is equal to or better than previous version by executing queries and comparing execution times
- [ ] T038 [US3] Test working with multiple large Parquet files in succession and verify extension properly releases resources between file switches
- [ ] T039 [US3] Verify no memory accumulation across sessions by monitoring memory usage after opening/closing multiple large files

**Checkpoint**: At this point, User Story 3 should be fully functional - memory efficiency verified with large files

---

## Phase 6: User Story 4 - Modern Development Tooling (Priority: P2)

**Goal**: Upgrade development tooling for long-term maintainability

**Independent Test**: Run build process and linting to verify all tooling works correctly

### Implementation for User Story 4

- [ ] T040 [US4] Verify TypeScript 5.9.3 compilation completes without type errors by running `npm run compile` or `tsc -p ./`
- [ ] T041 [US4] Verify esbuild 0.27.2 bundling works correctly by running `npm run vscode:prepublish` and checking output
- [ ] T042 [US4] Verify ESLint 9.39.2 with flat config executes successfully by running `npm run lint` with no warnings or errors
- [ ] T043 [US4] Test that all dependencies install without conflicts by running `npm install` in a fresh environment

**Checkpoint**: At this point, User Story 4 should be fully functional - all development tooling upgraded successfully

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalization, user notification, documentation, and cross-cutting improvements

- [ ] T044 [P] Implement DuckDB binary upgrade notification in src/parquetDocument.ts using vscode.window.showInformationMessage()
- [ ] T045 Add "Restart Now" button action to binary upgrade notification that executes vscode.commands.executeCommand('workbench.action.reloadWindow')
- [ ] T046 [P] Verify backward compatibility with user settings (defaultQuery, tableName, chunkSize) by testing each setting in VSCode configuration
- [ ] T047 [P] Test extension activation with no settings configured (all defaults) to ensure it works out of the box
- [ ] T048 Create or update quickstart.md local development guide per FR-016 (quickstart.md already created in specs/001-dependency-upgrade/)
- [ ] T049 [P] Copy or link quickstart.md to repository root (or docs/ directory) for easy access by developers
- [ ] T050 Tag previous extension version as v1.2.1-final (or appropriate version) for rollback capability per FR-015
- [ ] T051 Run manual testing checklist from quickstart.md including: basic functionality, large file performance, edge cases, and cross-platform testing
- [ ] T052 Verify BigInt serialization with INT64 test data per quickstart.md testing checklist (Constitution Principle II requirement)
- [ ] T053 [P] Test ./package.sh script on available platforms to verify multi-platform DuckDB binary bundling (Constitution Principle V requirement)

**Checkpoint**: All polish and cross-cutting concerns complete, extension ready for release

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
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
- US2: Tasks are sequential (T026 → T027 → T028 → T029 → T030 → T031), then parallel testing (T032, T033, T034)
- US3: All testing tasks can run in parallel
- US4: All verification tasks can run in parallel

### Parallel Opportunities

- **Setup Phase**: All dependency updates (T001-T010) can be done in parallel by editing package.json once
- **Foundational Phase**: ESLint flat config creation (T013-T015) can be designed before implementation, but T013-T016 must be sequential
- **User Stories**:
  - US1 and US4 can be worked on in parallel after Setup/Foundational
  - US3 testing tasks (T036-T039) can all run in parallel
  - Polish phase parallel tasks (T046, T047, T049, T052, T053) can run in parallel

---

## Parallel Example: User Story 2

```bash
# After T025-T030 complete (DuckDB API migration), launch tests together:
Task T032: Test with large Parquet files
Task T033: Test complex SQL queries
Task T034: Verify no crashes/memory leaks
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup (dependency updates)
2. Complete Phase 2: Foundational (ESLint flat config, build verification)
3. Complete Phase 3: User Story 1 (VSCode 1.107 compatibility)
4. Complete Phase 4: User Story 2 (DuckDB API migration)
5. **STOP and VALIDATE**: Test extension thoroughly with large Parquet files
6. If MVP works: User Stories 1 & 2 provide core upgrade value - can deploy/demonstrate

### Incremental Delivery (All User Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test VSCode 1.107+ compatibility → Deploy/Demo (MVP part 1!)
3. Add User Story 2 → Test DuckDB 1.4.3 migration → Deploy/Demo (MVP complete!)
4. Add User Story 3 → Test memory/performance with 10M+ row files → Deploy/Demo
5. Add User Story 4 → Verify development tooling → Deploy/Demo (Full upgrade!)
6. Polish → Final release with all documentation and testing complete

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
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
- Manual testing per quickstart.md is the primary validation method (no automated test tasks)
- BigInt serialization verification (T052) is CRITICAL per Constitution Principle II
- Multi-platform build verification (T053) is CRITICAL per Constitution Principle V
- Stop at any checkpoint to validate and demo progress
- Avoid: vague tasks, missing file paths, skipping build verification
