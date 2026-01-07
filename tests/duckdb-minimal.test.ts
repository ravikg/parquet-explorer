import { Database } from 'duckdb';

describe('DuckDB Minimal Tests', () => {
  test('should create in-memory database', () => {
    const db = new Database(':memory:');
    expect(db).toBeDefined();

    const conn = db.connect();
    expect(conn).toBeDefined();

    conn.close();
    db.close();
  });

  test('should execute simple SQL command', () => {
    const db = new Database(':memory:');
    const conn = db.connect();

    // Use exec synchronously without callback for simple commands
    conn.exec('CREATE TABLE test (id INTEGER, name TEXT)');
    conn.exec('INSERT INTO test VALUES (1, "test")');

    conn.close();
    db.close();
  });
});
