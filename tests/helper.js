"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBTestHelper = void 0;
const duckdb_1 = require("duckdb");
const fs = require("fs");
const path = require("path");
/**
 * Test helper for DuckDB operations
 */
class DuckDBTestHelper {
    constructor() {
        this.db = null;
    }
    /**
     * Create an in-memory DuckDB database for testing
     */
    createDatabase() {
        this.db = new duckdb_1.Database(':memory:');
        return this.db;
    }
    /**
     * Create a test Parquet file with sample data
     * Uses DuckDB to write a simple CSV and convert to Parquet
     */
    async createTestParquetFile(filePath, rowCount = 100) {
        return new Promise((resolve, reject) => {
            const db = this.createDatabase();
            const conn = db.connect();
            // Create a simple table and insert test data
            conn.exec(`
        CREATE TABLE test_data AS
        SELECT
          range_col AS int_col,
          'test_' || range_col::VARCHAR AS string_col,
          (range_col * 100) AS bigint_col,
          (range_col * 1.5) AS double_col,
          range_col % 2 = 0 AS boolean_col
        FROM range(${rowCount}) t(range_col);
      `, (createErr) => {
                if (createErr) {
                    conn.close();
                    db.close();
                    reject(new Error(`CREATE TABLE failed: ${createErr.message}`));
                    return;
                }
                // Export to Parquet with error handling
                conn.exec(`COPY test_data TO '${filePath}' (FORMAT PARQUET);`, (copyErr) => {
                    conn.close();
                    db.close();
                    if (copyErr) {
                        reject(new Error(`COPY command failed: ${copyErr.message}`));
                        return;
                    }
                    // Verify file was created
                    if (!fs.existsSync(filePath)) {
                        reject(new Error(`Failed to create Parquet file at ${filePath}`));
                        return;
                    }
                    resolve();
                });
            });
        });
    }
    /**
     * Clean up test files
     */
    cleanupTestFiles(filePaths) {
        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
    /**
     * Get the fixtures directory path
     */
    getFixturesDir() {
        return path.join(__dirname, 'fixtures');
    }
    /**
     * List all available sample Parquet files in fixtures directory
     */
    listSampleParquetFiles() {
        const fixturesDir = this.getFixturesDir();
        if (!fs.existsSync(fixturesDir)) {
            return [];
        }
        return fs.readdirSync(fixturesDir)
            .filter(file => file.endsWith('.parquet') || file.endsWith('.pq') || file.endsWith('.parq'))
            .map(file => path.join(fixturesDir, file));
    }
    /**
     * Load a sample Parquet file from fixtures directory
     * @param fileName Name of the Parquet file in fixtures directory (e.g., 'sample-data.parquet')
     * @returns Full path to the sample file
     */
    getSampleParquetFile(fileName) {
        const fixturesDir = this.getFixturesDir();
        const fullPath = path.join(fixturesDir, fileName);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Sample Parquet file not found: ${fullPath}`);
        }
        return fullPath;
    }
    /**
     * Get schema information from a Parquet file
     * @param filePath Path to Parquet file
     * @returns Promise resolving to schema information
     */
    async getParquetSchema(filePath) {
        return new Promise((resolve, reject) => {
            const db = this.createDatabase();
            const conn = db.connect();
            conn.all(`DESCRIBE SELECT * FROM read_parquet('${filePath}')`, (err, result) => {
                conn.close();
                db.close();
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    /**
     * Get row count from a Parquet file
     * @param filePath Path to Parquet file
     * @returns Promise resolving to row count
     */
    async getParquetRowCount(filePath) {
        return new Promise((resolve, reject) => {
            const db = this.createDatabase();
            const conn = db.connect();
            conn.all(`SELECT COUNT(*) as count FROM read_parquet('${filePath}')`, (err, result) => {
                conn.close();
                db.close();
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result[0].count);
                }
            });
        });
    }
}
exports.DuckDBTestHelper = DuckDBTestHelper;
//# sourceMappingURL=helper.js.map