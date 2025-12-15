export type GlucoseUnit = 'mg/dL' | 'mmol/L';
export type ReadingContext = 'fasting' | 'pre-meal' | 'post-meal' | 'post-meal-1h' | 'post-meal-2h' | 'bedtime' | 'other';

export interface GlucoseLog {
    id: string;
    value: number;
    unit: GlucoseUnit;
    timestamp: number; // Unix timestamp
    context: ReadingContext;
    notes?: string;
    image?: Blob; // Stored directly in IndexedDB
}

export interface UserSettings {
    targetRange: {
        min: number;
        max: number;
    };
    preferredUnit: GlucoseUnit;
    name?: string;
}
