export const convertGlucose = (valueMs: number, targetUnit: 'mg/dL' | 'mmol/L'): number => {
    if (targetUnit === 'mg/dL') return Math.round(valueMs);
    return parseFloat((valueMs / 18).toFixed(1));
};
