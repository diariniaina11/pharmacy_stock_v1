import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertTriangle,
  FileText,
  CheckSquare,
  History,
  Pill,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const isAdmin = true;
  const user = { prenom: 'Admin', nom: 'System' };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/produits', icon: Package, label: 'Produits' },
    { to: '/ventes', icon: ShoppingCart, label: 'Ventes' },
    { to: '/peremptions', icon: AlertTriangle, label: 'Péremptions' },
    { to: '/demandes', icon: FileText, label: 'Demandes' },
    { to: '/validation', icon: CheckSquare, label: 'Validation' },
    { to: '/historique', icon: History, label: 'Historique' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Pill className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">PharmaSys</h1>
            <p className="text-xs text-sidebar-foreground/70">Gestion de pharmacie</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-sidebar-foreground/70">
              Administrateur
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
