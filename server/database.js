import pkg from 'pg';
const { Pool } = pkg;
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const pool = new Pool({
    // your configuration here
});
