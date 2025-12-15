import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dbService } from '../../lib/db';
import type { GlucoseLog } from '../../lib/types';
import { convertGlucose } from '../../lib/units';
import { Trash2, Image as ImageIcon, Pencil } from 'lucide-react';

interface HistoryViewProps {
    onEdit?: (log: GlucoseLog) => void;
}

export function HistoryView({ onEdit }: HistoryViewProps) {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<GlucoseLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [unit, setUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');

    useEffect(() => {
        loadLogs();
    }, []);

    async function loadLogs() {
        try {
            const [data, settings] = await Promise.all([
                dbService.getLogs(),
                dbService.getSettings()
            ]);
            setLogs(data.sort((a, b) => b.timestamp - a.timestamp));
            if (settings) setUnit(settings.preferredUnit);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm(t('history.deleteConfirm'))) {
            await dbService.deleteLog(id);
            loadLogs();
        }
    };

    const groupLogsByDate = (logs: GlucoseLog[]) => {
        const groups: { [key: string]: GlucoseLog[] } = {};
        logs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });
        return groups;
    };

    const groupedLogs = groupLogsByDate(logs);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
            <header>
                <h2 style={{ fontSize: '1.5rem' }}>{t('history.title')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('history.subtitle')}</p>
            </header>

            {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                <div key={date}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{date}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dayLogs.map(log => (
                            <div key={log.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '60px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span style={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1 }}>{convertGlucose(log.value, unit)}</span>
                                        <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{unit}</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                            {t(`context.${log.context}`)}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(log)}
                                            style={{ padding: '0.5rem', color: 'var(--color-primary)', background: 'none', border: 'none' }}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    )}
                                    {log.image && (
                                        <button
                                            onClick={() => setSelectedImage(URL.createObjectURL(log.image!))}
                                            style={{ padding: '0.5rem', color: 'var(--color-text-main)', background: 'none', border: 'none' }}
                                        >
                                            <ImageIcon size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(log.id)}
                                        style={{ padding: '0.5rem', color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <p>{t('history.empty')}</p>
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Meal"
                        style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 'var(--radius-lg)' }}
                    />
                </div>
            )}
        </div>
    );
}
