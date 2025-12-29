import { Database } from 'duckdb';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test helper for DuckDB operations
 */
export class DuckDBTestHelper {
  private db: Database | null = null;

  /**
   * Create an in-memory DuckDB database for testing
   */
  createDatabase(): Database {
    this.db = new Database(':memory:');
    return this.db;
  }

  /**
   * Create a test Parquet file with sample data
   * Uses DuckDB to write a simple CSV and convert to Parquet
   */
  async createTestParquetFile(filePath: string, rowCount: number = 100): Promise<void> {
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
      `, (createErr: any) => {
        if (createErr) {
          conn.close();
          db.close();
          reject(new Error(`CREATE TABLE failed: ${createErr.message}`));
          return;
        }

        // Export to Parquet with error handling
        conn.exec(`COPY test_data TO '${filePath}' (FORMAT PARQUET);`, (copyErr: any) => {
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
  cleanupTestFiles(filePaths: string[]): void {
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  /**
   * Get the fixtures directory path
   */
  getFixturesDir(): string {
    return path.join(__dirname, 'fixtures');
  }

  /**
   * List all available sample Parquet files in fixtures directory
   */
  listSampleParquetFiles(): string[] {
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
  getSampleParquetFile(fileName: string): string {
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
  async getParquetSchema(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const db = this.createDatabase();
      const conn = db.connect();

      conn.all(`DESCRIBE SELECT * FROM read_parquet('${filePath}')`, (err: any, result: any[]) => {
        conn.close();
        db.close();

        if (err) {
          reject(err);
        } else {
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
  async getParquetRowCount(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const db = this.createDatabase();
      const conn = db.connect();

      conn.all(`SELECT COUNT(*) as count FROM read_parquet('${filePath}')`, (err: any, result: any[]) => {
        conn.close();
        db.close();

        if (err) {
          reject(err);
        } else {
          resolve(result[0].count);
        }
      });
    });
  }
}
