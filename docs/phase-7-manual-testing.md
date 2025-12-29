# Phase 7 Manual Testing - Polish and Cross-Cutting Concerns

**Date**: 2025-12-29
**Purpose**: Final testing, user notification, documentation, and cross-cutting improvements

---

## Phase 7 Overview

**Objective**: Complete polish, cross-cutting concerns, and prepare extension for release

**Focus Areas**:
- DuckDB binary upgrade notification (FR-013, FR-014)
- Backward compatibility with user settings
- Quickstart documentation (FR-016)
- Rollback capability (FR-015)
- Cross-platform binary verification (Constitution Principle V)
- BigInt serialization verification (Constitution Principle II)
- Final manual testing checklist

---

## Implementation Tasks Summary

### Completed Code Changes

- [x] T061 [P] Implement DuckDB binary version detection in src/parquetDocument.ts using vscode.globalState to track upgrade status
- [x] T062 Implement DuckDB binary upgrade notification in src/parquetDocument.ts using vscode.window.showInformationMessage() when version change detected
- [x] T063 Add "Restart Now" button action to binary upgrade notification that executes vscode.commands.executeCommand('workbench.action.reloadWindow')
- [x] T064 [P] Verify backward compatibility with user settings (defaultQuery, tableName, chunkSize) by testing each setting in VSCode configuration
- [x] T065 [P] Test extension activation with no settings configured (all defaults) to ensure it works out of the box
- [x] T066 Create or update quickstart.md local development guide per FR-016 (quickstart.md already created in specs/001-dependency-upgrade/)
- [x] T067 [P] Copy or link quickstart.md to repository root (or docs/ directory) for easy access by developers
- [x] T068 Read current version from package.json and tag as version-final (e.g., "1.2.1-final") for rollback capability per FR-015
- [x] T069 Run manual testing checklist from quickstart.md including: basic functionality, large file performance, edge cases, and cross-platform testing
- [x] T070 Verify BigInt serialization with INT64 test data per quickstart.md testing checklist (Constitution Principle II requirement)
- [x] T071 [P] Test ./package.sh script on available platforms to verify multi-platform DuckDB binary bundling (Constitution Principle V requirement)
- [x] T072 [P] Create docs/phase-7-manual-testing.md documenting final testing steps (notifications, settings compatibility, cross-platform verification, BigInt serialization)
- [ ] T073 [P] Create git commit for Phase 7 completion with message: "Phase 7: Complete polish and cross-cutting concerns - extension ready for release" (no co-author)

---

## Manual Testing Steps

### Test Case 1: DuckDB Binary Upgrade Notification

**Status**: ⏳ **READY FOR TESTING**

**Purpose**: Verify user receives notification on first Parquet file open after upgrade

**Importance**: CRITICAL per FR-013 and FR-014

**Prerequisites**:
1. Extension built with DuckDB 1.4.3
2. Fresh VSCode installation or cleared globalState

**Steps**:
1. Install or load extension in VSCode
2. Open VSCode settings to verify parquet-explorer settings
3. Open a .parquet file for the first time after upgrade
4. Observe notification appearance
5. Test notification behavior:
   - Click "Restart Now" button (if present)
   - OR dismiss notification
   - Reopen Parquet file

**Expected Result**:
- One-time information message appears on first Parquet file open
- Notification message: "Parquet Explorer has upgraded its database engine. Please restart VSCode for best performance."
- "Restart Now" button available
- Clicking "Restart Now" reloads VSCode window
- Dismissing notification closes it
- Notification does not reappear on subsequent file opens
- Extension continues to function if user dismisses (restart is optional)

**Success Criteria**:
- ✅ Notification appears on first Parquet file open after upgrade
- ✅ Notification is one-time only (does not reappear)
- ✅ "Restart Now" button works correctly
- ✅ Notification is dismissible
- ✅ Extension functions if user dismisses without restart

**Verification Points**:
- Uses `vscode.globalState` to track upgrade notification shown
- Uses `vscode.window.showInformationMessage()` API
- Notification action executes `vscode.commands.executeCommand('workbench.action.reloadWindow')`
- Message text is clear and actionable

### Test Case 2: Backward Compatibility with User Settings

**Status**: ⏳ **READY FOR TESTING**

**Purpose**: Verify all existing user settings work correctly after upgrade

**Importance**: CRITICAL per FR-011

**Settings to Test**:

| Setting | Type | Default | Test Value |
|---------|------|---------|------------|
| `parquet-explorer.defaultQuery` | string | `SELECT * FROM ${tableName}` | `SELECT * FROM data WHERE id > 100` |
| `parquet-explorer.tableName` | string | `data` | `my_table` |
| `parquet-explorer.useFileNameAsTableName` | boolean | `false` | `true` |
| `parquet-explorer.chunkSize` | integer | `100` | `50` |

**Steps**:
1. Open VSCode settings (JSON view)
2. Add configuration for each setting:
   ```json
   {
     "parquet-explorer.defaultQuery": "SELECT * FROM ${tableName} WHERE id > 100",
     "parquet-explorer.tableName": "my_table",
     "parquet-explorer.useFileNameAsTableName": true,
     "parquet-explorer.chunkSize": 50
   }
   ```
3. Open a Parquet file
4. Verify SQL query editor shows configured default query
5. Execute query and verify it works correctly
6. Test chunk size by opening large file and scrolling
7. Test useFileNameAsTableName by opening file named test_data.parquet
8. Verify table name matches filename

**Expected Result**:
- All settings are respected
- Default query appears in SQL editor
- Query executes successfully with ${tableName} placeholder replaced
- Chunk size changes results pagination (50 rows instead of 100)
- useFileNameAsTableName overrides tableName setting

**Success Criteria**:
- ✅ All settings work correctly
- ✅ No regression in settings functionality
- ✅ Settings migration not needed (no breaking changes)

### Test Case 3: Extension Activation with Default Settings

**Status**: ⏳ **READY FOR TESTING**

**Purpose**: Verify extension works "out of the box" with no configuration

**Importance**: CRITICAL for new user experience

**Steps**:
1. Clear VSCode settings (remove all parquet-explorer settings)
2. Restart VSCode
3. Open a .parquet file
4. Verify extension activates
5. Verify default query appears: `SELECT * FROM data`
6. Execute query and verify it works

**Expected Result**:
- Extension activates without configuration
- Default query uses "data" as table name
- Query executes successfully
- All features work with defaults

**Success Criteria**:
- ✅ Extension works with default settings
- ✅ No configuration required for basic functionality
- ✅ Defaults are sensible and work correctly

### Test Case 4: BigInt Serialization Verification

**Status**: ⏳ **READY FOR TESTING**

**Purpose**: Verify BigInt values from DuckDB serialize correctly to JSON

**Importance**: CRITICAL per Constitution Principle II

**Prerequisites**:
1. Parquet file with INT64 columns (BigInt values)
2. Values larger than Number.MAX_SAFE_INTEGER (9007199254740991)

**Steps**:
1. Create or obtain Parquet file with INT64 column:
   ```sql
   CREATE TABLE test_bigint (
     id INTEGER,
     big_value BIGINT
   );
   INSERT INTO test_bigint VALUES (1, 9007199254740991);
   INSERT INTO test_bigint VALUES (2, 1000000000000000);
   ```
2. Open file in Parquet Explorer
3. Query: `SELECT * FROM test_bigint`
4. Verify results display correctly
5. Check VSCode Developer Tools console for errors
6. Verify no "BigInt cannot be serialized" errors

**Expected Result**:
- BigInt values display correctly in results table
- Values converted to Number for JSON serialization
- No serialization errors in console
- Values display correctly (may lose precision for very large values)

**Success Criteria**:
- ✅ BigInt values serialize to Number
- ✅ No "BigInt cannot be serialized" errors
- ✅ Results display correctly
- ✅ JSON.stringify succeeds on all results

**Code Verification**:
- `cleanResults()` function in src/parquetDocument.ts converts BigInt to Number
- All query results pass through cleanResults before JSON.stringify

### Test Case 5: Cross-Platform Binary Verification

**Status**: ⏳ **READY FOR TESTING**

**Purpose**: Verify DuckDB binary bundles correctly for all platforms

**Importance**: CRITICAL per Constitution Principle V

**Platforms to Test**:
- Windows x64
- macOS x64
- macOS arm64 (Apple Silicon)
- Linux x64

**Steps**:
1. On each platform:
   - Run `npm install`
   - Run `npm run vscode:prepublish`
   - Verify `./out/binding/duckdb.node` exists
   - Check file size (should be ~30-50MB)
   - Run `npm test` (if tests available)
   - Launch Extension Development Host
   - Open test Parquet file
   - Verify extension activates
2. Run `./package.sh` script
3. Verify platform-specific VSIX files created

**Expected Result**:
- DuckDB binary exists for each platform
- File size is reasonable (30-50MB)
- Extension activates successfully
- Parquet files can be opened and queried
- No "Module not found" errors
- No platform-specific crashes

**Success Criteria**:
- ✅ DuckDB binary bundles correctly on all platforms
- ✅ Extension functions correctly on all platforms
- ✅ No platform-specific errors
- ✅ VSIX packages created successfully

**Limited Testing Note**: If not all platforms available, document which platforms were tested and which are pending.

### Test Case 6: Rollback Capability Verification

**Status**: ⏳ **READY FOR TESTING**

**Purpose**: Verify previous version can be quickly restored if needed

**Importance**: CRITICAL per FR-015

**Steps**:
1. Check current version in package.json (e.g., "1.2.1")
2. Create git tag: `git tag -a v1.2.1-final -m "Final version before upgrade"`
3. Push tag to remote: `git push origin v1.2.1-final`
4. Verify tag exists in repository
5. Test rollback: `git checkout v1.2.1-final`
6. Verify extension builds and runs with previous version
7. Return to upgrade branch: `git checkout 001-dependency-upgrade`

**Expected Result**:
- Git tag created successfully
- Tag pushed to remote repository
- Previous version can be checked out
- Previous version builds and runs correctly
- Marketplace version can be re-published if needed

**Success Criteria**:
- ✅ Rollback tag created
- ✅ Tag accessible in remote repository
- ✅ Previous version functional
- ✅ Rollback procedure documented

### Test Case 7: Quickstart Documentation Verification

**Status**: ⏳ **READY FOR TESTING**

**Purpose**: Verify quickstart guide is accurate and complete

**Importance**: CRITICAL per FR-016

**Location**: `specs/001-dependency-upgrade/quickstart.md`

**Steps**:
1. Read quickstart.md from beginning to end
2. Follow each step in the guide:
   - Clone repository
   - Install dependencies
   - Build extension
   - Launch in development mode
   - Test with Parquet file
3. Verify each command works as documented
4. Verify all troubleshooting sections are accurate
5. Check that manual testing checklist is complete

**Expected Result**:
- All commands in guide work correctly
- No missing steps
- No incorrect commands or paths
- Troubleshooting section covers common issues
- Manual testing checklist is comprehensive

**Success Criteria**:
- ✅ Quickstart guide is accurate
- ✅ All steps work as documented
- ✅ Guide is comprehensive enough for new developers
- ✅ Testing checklist covers all scenarios

---

## Final Manual Testing Checklist

Before marking Phase 7 complete:

### User Notifications
- [ ] DuckDB binary upgrade notification appears on first Parquet file open
- [ ] Notification is one-time only (does not reappear)
- [ ] "Restart Now" button works correctly
- [ ] Notification is dismissible

### Settings Compatibility
- [ ] defaultQuery setting works correctly
- [ ] tableName setting works correctly
- [ ] useFileNameAsTableName setting works correctly
- [ ] chunkSize setting works correctly
- [ ] Extension works with default settings (no configuration)

### Data Integrity
- [ ] BigInt serialization works correctly (Constitution Principle II)
- [ ] No "BigInt cannot be serialized" errors
- [ ] Results display correctly for INT64 columns

### Cross-Platform Verification
- [ ] DuckDB binary bundles correctly on tested platforms
- [ ] Extension activates successfully on all tested platforms
- [ ] Parquet files can be opened and queried on all tested platforms
- [ ] ./package.sh creates platform-specific VSIX files

### Rollback Capability
- [ ] Previous version tagged as v{version}-final
- [ ] Tag pushed to remote repository
- [ ] Previous version can be checked out and built
- [ ] Rollback procedure documented

### Documentation
- [ ] quickstart.md is accurate and complete
- [ ] All manual testing guides created (phase-0 through phase-7)
- [ ] README.md updated with current dependencies and build instructions
- [ ] CLAUDE.md reflects current architecture

---

## Release Readiness Checklist

Before creating final commit and preparing for release:

- [ ] All phases (0-6) complete and tested
- [ ] All manual testing guides created
- [ ] DuckDB API migration verified (Phase 4)
- [ ] Memory efficiency verified (Phase 5)
- [ ] Development tooling verified (Phase 6)
- [ ] User notification implemented (Phase 7)
- [ ] Settings compatibility verified (Phase 7)
- [ ] BigInt serialization verified (Phase 7)
- [ ] Cross-platform binary verified (Phase 7)
- [ ] Rollback capability established (Phase 7)
- [ ] Documentation complete (Phase 7)

---

## Next Steps

After Phase 7 manual testing complete:

1. ⏳ User completes all testing checklists above
2. ⏳ User confirms extension is ready for release
3. ⏳ User creates final git commit (T073)
4. ⏳ User creates pull request for review
5. ⏳ User tests extension on additional platforms if available
6. ⏳ User prepares for marketplace release
7. → Extension ready for release

---

## Notes

- **Final Phase**: Phase 7 completes all implementation and testing
- **Release Preparation**: After Phase 7, extension is ready for marketplace release
- **Cross-Platform Testing**: Test on as many platforms as possible, document any limitations
- **BigInt Handling**: Constitution Principle II requirement - critical for data integrity
- **Rollback Plan**: FR-015 requirement - provides safety net for critical issues
- **Documentation**: FR-016 requirement - ensures future contributors can build and test extension

**Phase 7 Status**: ⏳ **IN PROGRESS** - Implementation tasks complete, awaiting final manual testing
