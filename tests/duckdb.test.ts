import { Database } from 'duckdb';
import { DuckDBTestHelper } from './helper';

describe('DuckDB 1.4.3 API Migration', () => {
  let helper: DuckDBTestHelper;

  beforeAll(() => {
    helper = new DuckDBTestHelper();
  });

  // Ensure fixtures directory exists
  beforeAll(() => {
    const fs = require('fs');
    const path = require('path');
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
  });

  describe('Connection Initialization', () => {
    test('should create in-memory database successfully', () => {
      const db = new Database(':memory:');
      expect(db).toBeDefined();
      expect(db).toBeInstanceOf(Database);

      // Clean up
      const conn = db.connect();
      conn.close();
      db.close();
    });

    test('should create connection from database', () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      expect(connection).toBeDefined();
      expect(connection).toHaveProperty('all');
      expect(connection).toHaveProperty('exec');

      // Clean up
      connection.close();
      db.close();
    });

    test('should execute SQL commands on connection', async () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      // Execute CREATE TABLE synchronously
      connection.exec('CREATE TABLE test (id INTEGER, name TEXT)');

      // Verify table was created using Promise wrapper
      const result = await new Promise<any[]>((resolve, reject) => {
        connection.all('SELECT * FROM test', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      expect(result).toEqual([]);

      connection.close();
      db.close();
    });
  });

  describe('Query Execution', () => {
    test('should execute SELECT query and return results', async () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      // Create test data
      connection.exec(`
        CREATE TABLE users (
          id INTEGER,
          name TEXT,
          age INTEGER
        )
      `);

      connection.exec(`
        INSERT INTO users VALUES (1, 'Alice', 30), (2, 'Bob', 25), (3, 'Charlie', 35)
      `);

      // Execute query using Promise wrapper
      const result = await new Promise<any[]>((resolve, reject) => {
        connection.all('SELECT * FROM users ORDER BY id', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'Alice',
        age: 30
      });

      connection.close();
      db.close();
    });

    test('should execute aggregation queries', async () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      connection.exec('CREATE TABLE sales (product TEXT, amount INTEGER)');
      connection.exec(`INSERT INTO sales VALUES
        ('Widget A', 100),
        ('Widget B', 200),
        ('Widget A', 150)
      `);

      const result = await new Promise<any[]>((resolve, reject) => {
        connection.all(
          'SELECT product, SUM(amount) as total FROM sales GROUP BY product',
          (err: any, result: any[]) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      expect(result).toHaveLength(2);

      // DuckDB may return BigInt for SUM aggregation
      const widgetATotal = typeof result[0].total === 'bigint' ? Number(result[0].total) : result[0].total;
      const widgetBTotal = typeof result[1].total === 'bigint' ? Number(result[1].total) : result[1].total;

      expect(widgetATotal).toBe(250); // Widget A
      expect(widgetBTotal).toBe(200); // Widget B

      connection.close();
      db.close();
    });

    test('should handle query errors gracefully', async () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      // Expect the Promise to reject with an error
      await expect(new Promise<any[]>((resolve, reject) => {
        connection.all('SELECT * FROM nonexistent_table', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      })).rejects.toThrow();

      connection.close();
      db.close();
    });
  });

  describe('BigInt Serialization', () => {
    test('should handle BigInt values in query results', async () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      // Create table with BIGINT values
      await new Promise<void>((resolve, reject) => {
        connection.exec('CREATE TABLE big_data (id INTEGER, value BIGINT)', (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await new Promise<void>((resolve, reject) => {
        connection.exec(`
          INSERT INTO big_data VALUES
          (1, 9007199254740991),
          (2, 1000000000000000),
          (3, 0)
        `, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const result = await new Promise<any[]>((resolve, reject) => {
        connection.all('SELECT * FROM big_data ORDER BY id', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // Debug: Check if result has data
      expect(result).toBeDefined();
      expect(result.length).toBe(3);

      // DuckDB returns BigInt for large integers
      expect(result[0].value).toEqual(BigInt(9007199254740991));
      expect(result[1].value).toEqual(BigInt(1000000000000000));

      // Test serialization (this is what the extension does)
      const cleaned = result.map((row: any) => {
        const newRow: any = { ...row };
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'bigint') {
            newRow[key] = Number(value);
          }
        }
        return newRow;
      });

      // After conversion, values should be Numbers
      expect(typeof cleaned[0].value).toBe('number');
      expect(cleaned[0].value).toBe(9007199254740991);

      connection.close();
      db.close();
    });

    test('should JSON.stringify results after BigInt conversion', async () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      connection.exec('CREATE TABLE data (value BIGINT)');
      connection.exec("INSERT INTO data VALUES (9007199254740991)");

      const result = await new Promise<any[]>((resolve, reject) => {
        connection.all('SELECT * FROM data', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // Clean BigInt values (like the extension does)
      const cleaned = result.map((row: any) => {
        const newRow: any = { ...row };
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'bigint') {
            newRow[key] = Number(value);
          }
        }
        return newRow;
      });

      // Should not throw error
      expect(() => {
        JSON.stringify(cleaned);
      }).not.toThrow();

      const json = JSON.stringify(cleaned);
      expect(JSON.parse(json)[0].value).toBe(9007199254740991);

      connection.close();
      db.close();
    });
  });

  describe('Resource Cleanup', () => {
    test('should close connection before database', () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      // This should not throw
      expect(() => {
        connection.close();
        db.close();
      }).not.toThrow();
    });

    test('should handle multiple connections from same database', async () => {
      const db = new Database(':memory:');
      const conn1 = db.connect();
      const conn2 = db.connect();

      conn1.exec('CREATE TABLE test1 (id INTEGER)');
      conn2.exec('CREATE TABLE test2 (id INTEGER)');

      const result1 = await new Promise<any[]>((resolve, reject) => {
        conn1.all('SELECT * FROM test1', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      expect(result1).toEqual([]);

      const result2 = await new Promise<any[]>((resolve, reject) => {
        conn2.all('SELECT * FROM test2', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      expect(result2).toEqual([]);

      // Clean up both connections
      conn1.close();
      conn2.close();
      db.close();
    });

    test('should handle connection reuse', async () => {
      const db = new Database(':memory:');
      const connection = db.connect();

      connection.exec('CREATE TABLE test (id INTEGER)');
      connection.exec("INSERT INTO test VALUES (1), (2), (3)");

      // Execute multiple queries on same connection
      const result1 = await new Promise<any[]>((resolve, reject) => {
        connection.all('SELECT COUNT(*) as count FROM test', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // DuckDB returns BigInt for COUNT aggregation
      const countValue = typeof result1[0].count === 'bigint' ? Number(result1[0].count) : result1[0].count;
      expect(countValue).toBe(3);

      const result2 = await new Promise<any[]>((resolve, reject) => {
        connection.all('SELECT SUM(id) as total FROM test', (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // DuckDB returns BigInt for SUM aggregation
      const totalValue = typeof result2[0].total === 'bigint' ? Number(result2[0].total) : result2[0].total;
      expect(totalValue).toBe(6);

      connection.close();
      db.close();
    });
  });

  describe('Parquet File Operations', () => {
    let testFilePath: string;

    beforeEach(() => {
      testFilePath = helper.getFixturesDir() + '/test.parquet';
    });

    afterEach(() => {
      // Clean up test files after each test
      if (testFilePath) {
        helper.cleanupTestFiles([testFilePath]);
      }
    });

    test('should create and read Parquet file', async () => {
      await helper.createTestParquetFile(testFilePath, 50);

      const db = new Database(':memory:');
      const connection = db.connect();

      // Query Parquet file directly using read_parquet function
      const result = await new Promise<any[]>((resolve, reject) => {
        connection.all(`SELECT * FROM read_parquet('${testFilePath}') LIMIT 5`, (err: any, result: any[]) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('int_col');
      expect(result[0]).toHaveProperty('string_col');
      expect(result[0]).toHaveProperty('bigint_col');
      expect(result[0]).toHaveProperty('double_col');
      expect(result[0]).toHaveProperty('boolean_col');

      connection.close();
      db.close();
    });

    test('should query Parquet file with filters', async () => {
      await helper.createTestParquetFile(testFilePath, 100);

      const db = new Database(':memory:');
      const connection = db.connect();

      const result = await new Promise<any[]>((resolve, reject) => {
        connection.all(
          `SELECT * FROM read_parquet('${testFilePath}') WHERE int_col > 50 ORDER BY int_col LIMIT 5`,
          (err: any, result: any[]) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      expect(result.length).toBeLessThanOrEqual(5);
      if (result.length > 0) {
        expect(result[0].int_col).toBeGreaterThan(50);
      }

      connection.close();
      db.close();
    });
  });
});
