import React from 'react';
import { Menu, PlusCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoBadge } from '../ui/DemoBadge';
import { Button } from '../ui/Button';

interface TopNavbarProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  actions?: React.ReactNode;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  actions,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-surface-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Title & mobile menu button */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-muted"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-ink-primary truncate">
              {title}
            </h1>
            <div className="hidden sm:inline-flex">
              <DemoBadge />
            </div>
          </div>
          {subtitle && (
            <p className="text-xs text-ink-secondary truncate hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side utilities and action buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="sm:hidden">
          <DemoBadge />
        </div>

        {actions}

        <Link to="/report">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="hidden sm:inline-flex"
          >
            Report a Need
          </Button>
        </Link>
      </div>
    </header>
  );
};
