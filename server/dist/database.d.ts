import pkg from 'pg';
declare const pool: pkg.Pool;
export declare function setupDatabase(): Promise<void>;
export declare function query(text: string, params?: any[]): Promise<any[] | undefined>;
export { pool };
