import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dbService } from '../../lib/db';
import type { GlucoseLog, GlucoseUnit } from '../../lib/types';
import { convertGlucose } from '../../lib/units';
import { subDays, subMonths, startOfDay, endOfDay, isWithinInterval, format } from 'date-fns';
import { Calendar } from 'lucide-react';

type TimeRange = 'today' | '7d' | '30d' | '6m' | 'custom';

export function TrendsView() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<GlucoseLog[]>([]);
    const [unit, setUnit] = useState<GlucoseUnit>('mg/dL');
    const [range, setRange] = useState<TimeRange>('7d');
    const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            dbService.getLogs(),
            dbService.getSettings()
        ]).then(([fetchedLogs, fetchedSettings]) => {
            setLogs(fetchedLogs);
            if (fetchedSettings) setUnit(fetchedSettings.preferredUnit);
            setLoading(false);
        });
    }, []);

    const filteredLogs = useMemo(() => {
        const now = new Date();
        let start: Date;
        let end = endOfDay(now);

        if (range === 'today') start = startOfDay(now);
        else if (range === '7d') start = subDays(startOfDay(now), 7);
        else if (range === '30d') start = subDays(startOfDay(now), 30);
        else if (range === '6m') start = subMonths(startOfDay(now), 6);
        else {
            start = startOfDay(new Date(customStart));
            end = endOfDay(new Date(customEnd));
        }

        return logs
            .filter(log => isWithinInterval(new Date(log.timestamp), { start, end }))
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(log => ({
                ...log,
                displayValue: convertGlucose(log.value, unit),
                dateStr: format(log.timestamp, range === 'today' ? 'HH:mm' : range === '7d' ? 'EEE HH:mm' : 'MM/dd')
            }));
    }, [logs, range, customStart, customEnd, unit]);

    const stats = useMemo(() => {
        if (filteredLogs.length === 0) return { avg: 0, min: 0, max: 0 };
        const values = filteredLogs.map(l => l.displayValue);
        const sum = values.reduce((a, b) => a + b, 0);
        return {
            avg: parseFloat((sum / values.length).toFixed(1)),
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }, [filteredLogs]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <header>
                <h2 style={{ fontSize: '1.5rem' }}>{t('trends.title')}</h2>
            </header>

            {/* Range Selector */}
            <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
                {(['today', '7d', '30d', '6m', 'custom'] as TimeRange[]).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        style={{
                            flex: 1,
                            padding: '0.5rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: range === r ? 'var(--color-primary)' : 'transparent',
                            color: range === r ? 'white' : 'var(--color-text-muted)',
                            border: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        {t(`trends.${r === '7d' ? 'last7Days' : r === '30d' ? 'last30Days' : r === '6m' ? 'last6Months' : r}`)}
                    </button>
                ))}
            </div>

            {range === 'custom' && (
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{t('trends.startDate')}</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', width: '100%', color: 'var(--color-text-main)' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{t('trends.endDate')}</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', width: '100%', color: 'var(--color-text-main)' }}
                        />
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="glass-panel" style={{ height: '300px', padding: '1rem 0 0 0', position: 'relative' }}>
                {filteredLogs.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredLogs} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="dateStr" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: 'var(--color-text-main)' }}
                            />
                            <Area type="monotone" dataKey="displayValue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                        <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>{t('dashboard.noLogs')}</p>
                    </div>
                )}
            </div>

            {/* Stats */}
            {filteredLogs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('trends.avg')}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.avg}</span>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('trends.min')}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>{stats.min}</span>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('trends.max')}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-warning)' }}>{stats.max}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
