import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dbService } from '../../lib/db';
import type { UserSettings, GlucoseUnit } from '../../lib/types';
import { Globe, Ruler, User } from 'lucide-react';

export function SettingsView() {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [name, setName] = useState('');

    useEffect(() => {
        dbService.getSettings().then(s => {
            if (s) {
                setSettings(s);
                setName(s.name || '');
            }
        });
    }, []);

    const updateName = async (newName: string) => {
        setName(newName);
        if (settings) {
            const updated = { ...settings, name: newName };
            await dbService.saveSettings(updated);
            setSettings(updated);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'zh' : 'en';
        i18n.changeLanguage(newLang);
    };

    const updateUnit = async (unit: GlucoseUnit) => {
        if (!settings) return;
        const updated = { ...settings, preferredUnit: unit };
        await dbService.saveSettings(updated);
        setSettings(updated);
    };

    if (!settings) return <div>Loading...</div>;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <header>
                <h2 style={{ fontSize: '1.5rem' }}>{t('settings.title')}</h2>
            </header>

            {/* Name Setting */}
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <User size={20} color="var(--color-primary)" />
                    <span style={{ fontWeight: 500 }}>{t('settings.name')}</span>
                </div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => updateName(e.target.value)}
                    placeholder="User"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'right',
                        color: 'var(--color-text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                        width: '150px'
                    }}
                />
            </div>

            {/* Language Setting */}
            <button
                onClick={toggleLanguage}
                className="glass-card"
                style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Globe size={20} color="var(--color-primary)" />
                    <span style={{ fontWeight: 500 }}>{t('settings.language')}</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    {i18n.language === 'en' ? 'English' : '中文'}
                </span>
            </button>

            {/* Unit Setting */}
            <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Ruler size={20} color="var(--color-primary)" />
                    <span style={{ fontWeight: 500 }}>{t('settings.units')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                        onClick={() => updateUnit('mg/dL')}
                        style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: settings.preferredUnit === 'mg/dL' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                            color: settings.preferredUnit === 'mg/dL' ? 'white' : 'var(--color-text-muted)',
                            border: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        mg/dL
                    </button>
                    <button
                        onClick={() => updateUnit('mmol/L')}
                        style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: settings.preferredUnit === 'mmol/L' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                            color: settings.preferredUnit === 'mmol/L' ? 'white' : 'var(--color-text-muted)',
                            border: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        mmol/L
                    </button>
                </div>
            </div>
        </div>
    );
}
