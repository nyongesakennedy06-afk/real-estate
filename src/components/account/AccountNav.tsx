import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, ClipboardList, User } from 'lucide-react';

export const AccountNav: React.FC = () => {
  const links = [
    { to: '/account/bookings', label: 'Bookings', icon: Calendar },
    { to: '/account/valuations', label: 'Valuations', icon: ClipboardList },
    { to: '/account/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex border-b border-brand-border gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-brand-muted hover:text-brand-ink'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
