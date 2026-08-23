import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ShieldCheck, UserRound } from 'lucide-react';
import { createUserSchema, type CreateUserFormValues } from '../schemas';
import { useAdminUsers, useCreateUser, useCreateAdminUser, useDeleteUser } from '@/hooks/use-admin-users';
import { useAuthStore } from '@/store/auth-store';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Feedback';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatDate } from '@/lib/format';
import { UserRole, type User } from '@/api/types';

const roleTone: Record<UserRole, 'neutral' | 'gold' | 'crimson'> = {
  [UserRole.USER]: 'neutral',
  [UserRole.ADMIN]: 'gold',
  [UserRole.SUPERADMIN]: 'crimson',
};

export function AdminUsersPage() {
  const currentUserId = useAuthStore((s) => s.userId);
  const currentRole = useAuthStore((s) => s.role);
  const isSuperAdmin = currentRole === UserRole.SUPERADMIN;

  const { data: users, isLoading, isError, refetch } = useAdminUsers();
  const createUser = useCreateUser();
  const createAdmin = useCreateAdminUser();
  const deleteUser = useDeleteUser();

  const [creating, setCreating] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) });

  function openCreate() {
    setAsAdmin(false);
    reset({ username: '', email: '', password: '' });
    setCreating(true);
  }

  function onSubmit(values: CreateUserFormValues) {
    const mutation = asAdmin ? createAdmin : createUser;
    mutation.mutate(values, { onSuccess: () => setCreating(false) });
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    deleteUser.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-paper-100">Users</h2>
          <p className="text-sm text-paper-500">{users?.length ?? 0} accounts</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          New user
        </Button>
      </div>

      {isLoading ? (
        <Spinner label="Loading users" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !users || users.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-700 bg-ink-800 text-xs uppercase tracking-wide text-paper-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-ink-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-ink-700">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserRound className="size-4 text-ink-400" aria-hidden />
                        )}
                      </div>
                      <span className="font-medium text-paper-100">
                        {user.username}
                        {user.id === currentUserId && ' (you)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-paper-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={roleTone[user.role]}>
                      {user.role === UserRole.SUPERADMIN && <ShieldCheck className="mr-1 inline size-3" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-paper-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {isSuperAdmin && user.id !== currentUserId && (
                      <button
                        onClick={() => setToDelete(user)}
                        className="rounded-md p-1.5 text-paper-500 hover:bg-ink-700 hover:text-crimson-400"
                        aria-label={`Delete ${user.username}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isSuperAdmin && (
        <p className="mt-4 text-xs text-paper-500">
          Only superadmins can delete users or create new admin accounts.
        </p>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New user">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input label="Username" error={errors.username?.message} {...register('username')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          {isSuperAdmin && (
            <label className="flex items-center gap-2 text-sm text-paper-300">
              <input type="checkbox" checked={asAdmin} onChange={(e) => setAsAdmin(e.target.checked)} />
              Grant admin access
            </label>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createUser.isPending || createAdmin.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete user"
        description={`Permanently delete ${toDelete?.username}'s account? This can't be undone.`}
        isLoading={deleteUser.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
