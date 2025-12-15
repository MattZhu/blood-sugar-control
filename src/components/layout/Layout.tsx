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
            padding: '0.5rem',
            transition: 'var(--transition-fast)'
        }}
    >
        {icon}
        <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>{label}</span>
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
        <div className="container animate-fade-in">
            <main style={{ paddingBottom: '2rem' }}>
                {children}
            </main>

            <nav
                className="glass-panel"
                style={{
                    position: 'fixed',
                    bottom: 'max(1rem, var(--safe-area-bottom))',
                    left: '1rem',
                    right: '1rem',
                    height: '64px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    maxWidth: '600px',
                    margin: '0 auto',
                    zIndex: 50,
                }}
            >
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
            </nav>
        </div>
    );
}
