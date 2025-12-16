import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dbService } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Camera, Save, X, FileText, Calendar } from 'lucide-react';
import type { ReadingContext, GlucoseLog, UserSettings } from '../../lib/types';
import { format } from 'date-fns';
import { convertGlucose } from '../../lib/units';

interface LogEntryProps {
    onComplete: () => void;
    initialData?: GlucoseLog | undefined;
}

export function LogEntry({ onComplete, initialData }: LogEntryProps) {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const [context, setContext] = useState<ReadingContext>('fasting');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState<Blob | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [dateStr, setDateStr] = useState(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dbService.getSettings().then(s => {
            if (s) setSettings(s);
        });
    }, []);

    useEffect(() => {
        if (initialData && settings) {
            const displayVal = convertGlucose(initialData.value, settings.preferredUnit);
            setValue(displayVal.toString());
            setContext(initialData.context);
            setNotes(initialData.notes || '');
            setImage(initialData.image || null);
            if (initialData.image) {
                setImagePreview(URL.createObjectURL(initialData.image));
            }
            setDateStr(format(initialData.timestamp, 'yyyy-MM-dd\'T\'HH:mm'));
        }
    }, [initialData, settings]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value || !settings) return;

        let numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        // Save strictly in mg/dL
        if (settings.preferredUnit === 'mmol/L') {
            numValue = Math.round(numValue * 18);
        }

        const log: GlucoseLog = {
            id: initialData ? initialData.id : uuidv4(),
            value: numValue,
            unit: 'mg/dL',
            context,
            timestamp: new Date(dateStr).getTime(),
            notes,
            image: image || undefined
        };

        await dbService.addLog(log);
        onComplete();
    };

    if (!settings) return <div>Loading...</div>;

    const contexts = [
        { id: 'fasting', label: t('context.fasting') },
        { id: 'pre-meal', label: t('context.pre-meal') },
        { id: 'post-meal-1h', label: t('context.post-meal-1h') },
        { id: 'post-meal-2h', label: t('context.post-meal-2h') },
        { id: 'bedtime', label: t('context.bedtime') }
    ];

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
            <header>
                <h2 style={{ fontSize: '1.5rem' }}>
                    {initialData ? t('history.update') : t('nav.log')}
                </h2>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Glucose Input */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <input
                            type="number"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="0"
                            style={{
                                fontSize: '4rem',
                                fontWeight: 700,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-main)',
                                textAlign: 'center',
                                width: '180px',
                                outline: 'none'
                            }}
                        />
                        <span style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            {settings.preferredUnit}
                        </span>
                    </div>
                </div>

                {/* Date & Time Input */}
                <div className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <Calendar size={20} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>{t('log.dateTimeLabel')}</span>
                    </div>
                    <input
                        type="datetime-local"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        style={{
                            width: '95%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--color-text-main)',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Context Selection */}
                <div className="glass-card" style={{ padding: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {t('log.contextLabel')}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {contexts.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setContext(c.id as ReadingContext)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: context === c.id ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                    background: context === c.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: context === c.id ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes Input */}
                <div className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <FileText size={20} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>{t('log.notes')}</span>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('log.notesPlaceholder')}
                        rows={3}
                        style={{
                            width: '95%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-main)',
                            fontSize: '1rem',
                            resize: 'none',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Image Upload */}
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!imagePreview ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '1.5rem',
                                width: '100%'
                            }}
                        >
                            <Camera size={32} />
                            <span>{t('log.addPhoto')}</span>
                        </button>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <img src={imagePreview} alt="Meal" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <button
                                type="button"
                                onClick={() => {
                                    setImage(null);
                                    setImagePreview(null);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '0.25rem',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>

                <button
                    type="submit"
                    className="button-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        fontSize: '1.125rem',
                        marginTop: '0.5rem',
                        width: '100%'
                    }}
                >
                    <Save size={20} />
                    {initialData ? t('history.update') : t('log.save')}
                </button>
            </form>
        </div>
    );
}
