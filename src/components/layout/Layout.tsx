import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, PlusCircle, History, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
// Wait, I said I would not install clsx unless needed. I can just use template literals.
// But clsx is very useful. I might have installed it? No I didn't. 
// I'll stick to template strings or install it. 
// "Install clsx" is quick. But I'll stick to standard JS for brevity if simple.

interface NavItemProps {
    icon: ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            flex: 1,
            padding: '0.25rem',
            transition: 'var(--transition-fast)'
        }}
    >
        {icon}
        <span style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: 500 }}>{label}</span>
    </button>
);

interface LayoutProps {
    children: ReactNode;
    currentView: 'dashboard' | 'add' | 'trends' | 'history' | 'settings';
    onChangeView: (view: 'dashboard' | 'add' | 'trends' | 'history' | 'settings') => void;
}

export function Layout({ children, currentView, onChangeView }: LayoutProps) {
    const { t } = useTranslation();

    return (
        <div className="container animate-fade-in" style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
            maxWidth: '100%'
        }}>
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                paddingBottom: '2rem'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>

            <nav
                className="glass-panel"
                style={{
                    flexShrink: 0,
                    height: '52px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    width: '100%',
                    zIndex: 1000,
                    borderRadius: 0,
                    border: 'none',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(23, 23, 23, 0.95)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div style={{ display: 'flex', width: '100%', maxWidth: '600px', margin: '0 auto', height: '100%' }}>
                    <NavItem
                        icon={<Home size={24} />}
                        label={t('nav.home')}
                        isActive={currentView === 'dashboard'}
                        onClick={() => onChangeView('dashboard')}
                    />
                    <NavItem
                        icon={<PlusCircle size={24} />}
                        label={t('nav.log')}
                        isActive={currentView === 'add'}
                        onClick={() => onChangeView('add')}
                    />
                    <NavItem
                        icon={<TrendingUp size={24} />}
                        label={t('nav.trends')}
                        isActive={currentView === 'trends'}
                        onClick={() => onChangeView('trends')}
                    />
                    <NavItem
                        icon={<History size={24} />}
                        label={t('nav.history')}
                        isActive={currentView === 'history'}
                        onClick={() => onChangeView('history')}
                    />
                    <NavItem
                        icon={<SettingsIcon size={24} />}
                        label={t('nav.settings')}
                        isActive={currentView === 'settings'}
                        onClick={() => onChangeView('settings')}
                    />
                </div>
            </nav>
        </div>
    );
}
