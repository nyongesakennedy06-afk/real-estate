import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Shield,
  ShieldAlert,
  UserX,
  UserCheck,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast.error('Could not load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (targetUser: ProfileRow) => {
    if (targetUser.id === currentUser?.id) {
      toast.error('You cannot change your own administrator role.');
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const actionDesc = newRole === 'admin' ? 'promote to Administrator' : 'demote to standard Client';

    if (!confirm(`Are you sure you want to ${actionDesc} for ${targetUser.full_name || targetUser.email}?`)) {
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUser.id);

      if (error) throw error;

      toast.success(`User role changed to ${newRole}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (targetUser: ProfileRow) => {
    if (targetUser.id === currentUser?.id) {
      toast.error('You cannot deactivate your own account.');
      return;
    }

    const newActive = !targetUser.is_active;
    const actionDesc = newActive ? 'reactivate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${actionDesc} ${targetUser.full_name || targetUser.email}?`)) {
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newActive })
        .eq('id', targetUser.id);

      if (error) throw error;

      toast.success(`User ${newActive ? 'activated' : 'deactivated'}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newActive } : u))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.full_name?.toLowerCase() || '';
    const email = u.email.toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = name.includes(q) || email.includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
          User &amp; Access Management
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Review accounts, assign administrator privileges, and manage account access states.
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-brand-border bg-white text-xs text-brand-ink"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Clients (Users)</option>
            </select>
            <Badge variant="outline" className="text-xs">
              Total: {filteredUsers.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-brand-muted">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-muted mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-brand-muted">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isBusy = updatingId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-brand-background/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-brand-primary flex items-center gap-1.5">
                            <span>{u.full_name || 'Client Account'}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-brand-background text-brand-primary px-1.5 py-0.5 rounded border border-brand-border font-medium">
                                You
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs">
                          <div className="flex items-center gap-1 text-brand-ink">
                            <Mail className="w-3 h-3 text-brand-muted flex-shrink-0" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone_number && (
                            <div className="flex items-center gap-1 text-brand-muted mt-0.5">
                              <Phone className="w-3 h-3 text-brand-muted flex-shrink-0" />
                              <span>{u.phone_number}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant={u.role === 'admin' ? 'default' : 'outline'}
                            className="capitalize text-xs font-semibold"
                          >
                            {u.role === 'admin' ? 'Administrator' : 'Client'}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-xs">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              Deactivated
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs text-brand-muted">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          {isSelf ? (
                            <span className="text-xs text-brand-muted italic px-2">
                              Current User
                            </span>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => handleToggleRole(u)}
                                className="h-8 px-2 text-xs border-brand-border text-brand-primary hover:bg-brand-background"
                              >
                                {isBusy ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : u.role === 'admin' ? (
                                  <span className="flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                                    <span>Demote</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3 text-brand-accent" />
                                    <span>Make Admin</span>
                                  </span>
                                )}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => handleToggleActive(u)}
                                className={`h-8 px-2 text-xs ${
                                  u.is_active
                                    ? 'border-red-200 text-rose-600 hover:bg-rose-50'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {isBusy ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : u.is_active ? (
                                  <span className="flex items-center gap-1">
                                    <UserX className="w-3 h-3" />
                                    <span>Deactivate</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    <span>Reactivate</span>
                                  </span>
                                )}
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
