import { Level } from 'level';

const db = new Level<string, unknown>('./db', { valueEncoding: 'json' });

export default db;
