import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dbService } from '../../lib/db';
import type { GlucoseLog, UserSettings } from '../../lib/types';
import { convertGlucose } from '../../lib/units';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export function Dashboard() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<GlucoseLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<UserSettings>({ targetRange: { min: 70, max: 140 }, preferredUnit: 'mg/dL' });

    useEffect(() => {
        Promise.all([
            dbService.getLogs(),
            dbService.getSettings()
        ]).then(([fetchedLogs, fetchedSettings]) => {
            setLogs(fetchedLogs.sort((a, b) => b.timestamp - a.timestamp));
            if (fetchedSettings) setSettings(fetchedSettings);
            setLoading(false);
        });
    }, []);

    const unit = settings.preferredUnit;

    const latest = logs[0];
    const previous = logs[1];

    const displayValue = (val: number) => convertGlucose(val, unit);

    const getTrend = () => {
        if (!latest || !previous) return <Minus size={20} />;

        // Calculate raw diff in mg/dL first for logic stability
        const rawDiff = latest.value - previous.value;

        if (rawDiff > 5) return <ArrowUp size={20} color="var(--color-warning)" />;
        if (rawDiff < -5) return <ArrowDown size={20} color="var(--color-success)" />;
        return <Minus size={20} color="var(--color-text-muted)" />;
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <header>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t('dashboard.hello', { name: settings.name || 'User' })}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('dashboard.latestUpdate')}</p>
            </header>

            {/* Main Stats Card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px',
                    background: 'var(--color-primary)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.2
                }} />

                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {t('dashboard.currentLevel')}
                </span>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1, color: 'var(--color-primary)' }}>
                        {latest ? displayValue(latest.value) : '--'}
                    </span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>
                        {unit}
                    </span>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                    {getTrend()}
                    <span style={{ fontSize: '0.875rem' }}>
                        {latest ? new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('dashboard.noData')}
                    </span>
                </div>
            </div>

            {/* Recent Activity Mini List */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{t('dashboard.recentHistory')}</h3>
                {logs.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>{t('dashboard.noLogs')}</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {logs.slice(0, 3).map(log => (
                            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{displayValue(log.value)} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{unit}</span></div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t(`context.${log.context}`)}</div>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
