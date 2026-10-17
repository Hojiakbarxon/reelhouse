import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ShieldCheck, UserRound, Search } from "lucide-react";
import { createUserSchema, type CreateUserFormValues } from "../schemas";
import {
  useAdminUsers,
  useCreateUser,
  useCreateAdminUser,
  useDeleteUser,
} from "@/hooks/use-admin-users";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Feedback";
import { Spinner, EmptyState, ErrorState } from "@/components/ui/Feedback";
import { formatDate } from "@/lib/format";
import { UserRole, type User } from "@/api/types";

const PAGE_SIZE = 10;

const roleTone: Record<UserRole, "neutral" | "gold" | "crimson"> = {
  [UserRole.USER]: "neutral",
  [UserRole.ADMIN]: "gold",
  [UserRole.SUPERADMIN]: "crimson",
};

// Matches the backend's delete rule: superadmins can delete anyone; admins
// can delete regular users and themselves. Nobody else reaches this table —
// RequireAdmin already gates the route to admin/superadmin.
function canDelete(
  currentRole: UserRole | undefined,
  currentUserId: string | null,
  target: User,
): boolean {
  if (currentRole === UserRole.SUPERADMIN) return true;
  if (currentRole === UserRole.ADMIN)
    return target.role === UserRole.USER || target.id === currentUserId;
  return false;
}

export function AdminUsersPage() {
  const currentUserId = useAuthStore((s) => s.userId);
  const { data: me } = useCurrentUser();
  const isSuperAdmin = me?.role === UserRole.SUPERADMIN;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError, refetch, isPlaceholderData } =
    useAdminUsers({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      role: role || undefined,
    });
  const users = data?.users;
  const pagination = data?.pagination;
  const isFiltering = !!debouncedSearch.trim() || !!role;
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
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  });

  function openCreate() {
    setAsAdmin(false);
    reset({ username: "", email: "", password: "" });
    setCreating(true);
  }

  function onSubmit(values: CreateUserFormValues) {
    const mutation = asAdmin ? createAdmin : createUser;
    mutation.mutate(values, { onSuccess: () => setCreating(false) });
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    deleteUser.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        // Deleted the last row on this page — step back so we don't land on an empty page.
        if (users?.length === 1 && page > 1) setPage(page - 1);
      },
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-paper-100">
            Users
          </h2>
          <p className="text-sm text-paper-500">
            {pagination?.total ?? 0} accounts
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          New user
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-sm">
          <label htmlFor="admin-user-search" className="sr-only">
            Search users
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-500" />
          <input
            id="admin-user-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by username…"
            className="w-full rounded-md border border-ink-600 bg-ink-800 py-2.5 pl-9 pr-3 text-paper-100 placeholder:text-ink-400 focus:border-gold-400"
          />
        </div>
        <Select
          aria-label="Filter by role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as UserRole | "");
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All roles</option>
          <option value={UserRole.USER}>User</option>
          <option value={UserRole.ADMIN}>Admin</option>
          <option value={UserRole.SUPERADMIN}>Superadmin</option>
        </Select>
      </div>

      {isLoading ? (
        <Spinner label="Loading users" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !users || users.length === 0 ? (
        isFiltering ? (
          <EmptyState
            title="No matches"
            description="No users match your search or role filter."
          />
        ) : (
          <EmptyState title="No users yet" />
        )
      ) : (
        <div
          style={{
            opacity: isPlaceholderData ? 0.6 : 1,
            transition: "opacity 150ms",
          }}
        >
          {/* Phones: one card per user with a big, labelled Delete button. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <li
                key={user.id}
                className="rounded-card border border-ink-700 bg-ink-800 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-700">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="size-5 text-ink-400" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-paper-100">
                      {user.username}
                      {user.id === currentUserId && " (you)"}
                    </p>
                    <p className="break-all text-sm text-paper-300">
                      {user.email}
                    </p>
                    <p className="mt-0.5 text-xs text-paper-500">
                      Joined {formatDate(user.created_at)}
                    </p>
                  </div>
                  <Badge tone={roleTone[user.role]}>{user.role}</Badge>
                </div>
                {canDelete(me?.role, currentUserId, user) && (
                  <Button
                    variant="dangerOutline"
                    className="mt-4 w-full"
                    onClick={() => setToDelete(user)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete user
                  </Button>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-card border border-ink-700 md:block">
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
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound
                              className="size-4 text-ink-400"
                              aria-hidden
                            />
                          )}
                        </div>
                        <span className="font-medium text-paper-100">
                          {user.username}
                          {user.id === currentUserId && " (you)"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-paper-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={roleTone[user.role]}>
                        {user.role === UserRole.SUPERADMIN && (
                          <ShieldCheck className="mr-1 inline size-3" />
                        )}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-paper-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canDelete(me?.role, currentUserId, user) && (
                        <IconButton
                          icon={Trash2}
                          tone="danger"
                          label={`Delete ${user.username}`}
                          onClick={() => setToDelete(user)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && (
        <div className="mt-6">
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onChange={setPage}
          />
        </div>
      )}

      {!isSuperAdmin && (
        <p className="mt-4 text-xs text-paper-500">
          As an admin, you can delete regular users and your own account. Only
          superadmins can delete other admins or grant admin access.
        </p>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New user"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            label="Username"
            error={errors.username?.message}
            {...register("username")}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <PasswordInput
            label="Password"
            error={errors.password?.message}
            {...register("password")}
          />
          {isSuperAdmin && (
            <label className="flex items-center gap-2 text-sm text-paper-300">
              <input
                type="checkbox"
                checked={asAdmin}
                onChange={(e) => setAsAdmin(e.target.checked)}
              />
              Grant admin access
            </label>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreating(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createUser.isPending || createAdmin.isPending}
            >
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
