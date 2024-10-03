import { Level } from 'level';

const db = new Level('./db', { valueEncoding: 'json' });

export default db;
