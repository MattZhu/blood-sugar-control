import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dbService } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Camera, Save, X, FileText, Calendar } from 'lucide-react';
import type { ReadingContext, GlucoseUnit } from '../../lib/types';
import { format } from 'date-fns';

interface LogEntryProps {
    onComplete: () => void;
}

export function LogEntry({ onComplete }: LogEntryProps) {
    const { t } = useTranslation();
    const [value, setValue] = useState<string>('');
    const [context, setContext] = useState<ReadingContext>('pre-meal');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [unit, setUnit] = useState<GlucoseUnit>('mg/dL');
    const [dateTime, setDateTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dbService.getSettings().then(s => {
            if (s) setUnit(s.preferredUnit);
        });
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value) return;

        setSaving(true);
        try {
            let valueToSave = parseFloat(value);
            if (unit === 'mmol/L') {
                valueToSave = Math.round(valueToSave * 18);
            }

            await dbService.addLog({
                id: uuidv4(),
                value: valueToSave,
                unit: 'mg/dL', // Always store as mg/dL
                timestamp: new Date(dateTime).getTime(),
                context,
                notes,
                image: image || undefined
            });
            onComplete();
        } catch (err) {
            console.error('Failed to save log', err);
            alert('Failed to save log');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{t('log.title')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('log.subtitle')}</p>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Value Input */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                        {t('log.glucoseLabel')} ({unit})
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="number"
                            inputMode="decimal"
                            step={unit === 'mmol/L' ? "0.1" : "1"}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="0"
                            autoFocus
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '3rem',
                                fontWeight: 700,
                                color: 'var(--color-primary)',
                                textAlign: 'center',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Date Time Input */}
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={20} color="var(--color-text-muted)" />
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                            {t('log.dateTimeLabel')}
                        </label>
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-main)',
                                fontSize: '1rem',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>

                {/* Context Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {(['fasting', 'pre-meal', 'post-meal-1h', 'post-meal-2h', 'bedtime', 'other'] as ReadingContext[]).map((ctx) => (
                        <button
                            key={ctx}
                            type="button"
                            onClick={() => setContext(ctx)}
                            className="glass-card"
                            style={{
                                padding: '0.75rem',
                                border: context === ctx ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
                                background: context === ctx ? 'rgba(20, 184, 166, 0.1)' : undefined,
                                color: context === ctx ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {t(`context.${ctx}`)}
                        </button>
                    ))}
                </div>

                {/* Notes Input */}
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} color="var(--color-text-muted)" />
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('log.notesPlaceholder')}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--color-text-main)'
                        }}
                    />
                </div>

                {/* Image Upload */}
                <div className="glass-card" style={{ padding: '1rem' }}>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                    />

                    {!previewUrl ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                padding: '2rem',
                                border: '2px dashed rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--color-text-muted)'
                            }}
                        >
                            <Camera size={24} />
                            <span>{t('log.addPhoto')}</span>
                        </button>
                    ) : (
                        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <img src={previewUrl} alt="Meal preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <button
                                type="button"
                                onClick={() => {
                                    setImage(null);
                                    setPreviewUrl(null);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    borderRadius: '50%',
                                    padding: '0.25rem',
                                    color: 'white'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!value || saving}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: (!value || saving) ? 0.5 : 1,
                        boxShadow: 'var(--shadow-glow)'
                    }}
                >
                    <Save size={20} />
                    {saving ? t('log.saving') : t('log.save')}
                </button>
            </form>
        </div>
    );
}
