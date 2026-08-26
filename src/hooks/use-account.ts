import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi, type UpdateProfilePayload } from '@/api/users';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/auth-store';

export function useUpdateAccount() {
  const userId = useAuthStore((s) => s.userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { username?: string; avatar?: File }) =>
      usersApi.updateAccount(userId as string, payload),
    onSuccess: () => {
      toast.success('Account updated');
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateProfile() {
  const userId = useAuthStore((s) => s.userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateProfile(userId as string, payload),
    onSuccess: () => {
      toast.success('Profile updated');
      // The backend's PATCH /users/:id/profile returns a raw TypeORM UpdateResult,
      // not the updated profile — refetch the user to get accurate fresh values.
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

// Every account holder — regular user, admin, or superadmin — can delete
// their own account (DELETE /users/:userId). On success the session is
// cleared locally, since the account backing it no longer exists.
export function useDeleteMyAccount() {
  const userId = useAuthStore((s) => s.userId);
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => usersApi.remove(userId as string),
    onSuccess: () => {
      toast.success('Your account has been deleted');
      logout();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}