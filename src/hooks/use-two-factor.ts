import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth';


// Errors are intentionally NOT toasted here — the 2FA screens render them
// inline with <AuthAlert>, the same way the login and OTP pages do.

export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: async () => (await authApi.enableTwoFactor()).data.data,
  });
}

export function useConfirmTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otp: string) => authApi.confirmTwoFactor(otp),
    onSuccess: () => {
      // Not returned on purpose: the screens must not wait on the refetch.
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otp: string) => authApi.disableTwoFactor(otp),
    onSuccess: () => {
      // Not returned on purpose: the screens must not wait on the refetch.
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
