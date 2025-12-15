import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { GlucoseLog, UserSettings } from './types';

interface SugarControlDB extends DBSchema {
    logs: {
        key: string;
        value: GlucoseLog;
        indexes: { 'by-date': number };
    };
    settings: {
        key: string;
        value: UserSettings;
    };
}

const DB_NAME = 'sugar-control-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SugarControlDB>>;

export const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<SugarControlDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Logs store
                if (!db.objectStoreNames.contains('logs')) {
                    const store = db.createObjectStore('logs', { keyPath: 'id' });
                    store.createIndex('by-date', 'timestamp');
                }
                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            },
        });
    }
    return dbPromise;
};

export const dbService = {
    async addLog(log: GlucoseLog) {
        const db = await initDB();
        return db.put('logs', log);
    },

    async getLogs() {
        const db = await initDB();
        return db.getAllFromIndex('logs', 'by-date');
    },

    async deleteLog(id: string) {
        const db = await initDB();
        return db.delete('logs', id);
    },

    async getSettings() {
        const db = await initDB();
        return db.get('settings', 'user-settings');
    },

    async saveSettings(settings: UserSettings) {
        const db = await initDB();
        return db.put('settings', settings, 'user-settings');
    }
};
