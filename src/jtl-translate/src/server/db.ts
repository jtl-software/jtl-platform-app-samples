import { join } from "node:path";
import { readFile, writeFile, stat, mkdir } from "node:fs/promises";

/**
 * Path to the file where we will persist our data
 */

class Database {
  
  dataFileDir = join(process.cwd(), 'data');
  dataFilePath: string;

  constructor(name: string) {
    this.dataFilePath = join(this.dataFileDir, `${name}.json`);
  }

  /**
   * Creates an empty database file if it does not yet exist
   */
  private async ensureDatabaseFileExists() {
    const info = await stat(this.dataFilePath).catch(() => null);
    if (!info) {
      await mkdir(this.dataFileDir, { recursive: true });
      await writeFile(this.dataFilePath, JSON.stringify({}));
    }
  }

  /**
   * Reads the contents of our database
   */
  private async readDatabase() {
    await this.ensureDatabaseFileExists();
    const data = await readFile(this.dataFilePath, 'utf-8');
    const db = JSON.parse(data);
    return (db ?? {}) as Record<string, unknown>;
  }

  /**
   * Writes the contents of our database
   */
  private async writeDatabase(db: Record<string, unknown>) {
    await this.ensureDatabaseFileExists();
    await writeFile(this.dataFilePath, JSON.stringify(db, null, 2));
  }

  /**
   * Reads the value of key.
   */
  async getKey<ReturnType>(key: string): Promise<ReturnType | undefined> {
    const db = await this.readDatabase();
    return db?.[key] as ReturnType | undefined;
  }

  /**
   * Sets the value of key.
   */
  async setKey(key: string, value: unknown): Promise<void> {
    const db = await this.readDatabase();
    db[key] = value;
    await this.writeDatabase(db);
  }

}

/**
 * Provides access to a key / value store database
 */
export const getDatabase = (name: string) => new Database(name);