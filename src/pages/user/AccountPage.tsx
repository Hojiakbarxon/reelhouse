import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUpdateAccount, useUpdateProfile } from '@/hooks/use-account';
import { accountSchema, profileSchema, type AccountFormValues, type ProfileFormValues } from './schemas';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner, ErrorState } from '@/components/ui/Feedback';
import { MySubscriptions } from '@/components/user/MySubscriptions';
import { Country } from '@/api/types';

export function AccountPage() {
  const { data: me, isLoading, isError, refetch } = useCurrentUser();
  const updateAccount = useUpdateAccount();
  const updateProfile = useUpdateProfile();

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    values: me ? { username: me.username } : undefined,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: me?.profile
      ? {
          full_name: me.profile.full_name ?? '',
          country: (me.profile.country as Country) ?? '',
        }
      : undefined,
  });

  if (isLoading) return <Spinner label="Loading account" />;
  if (isError || !me) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  function handleAvatarSelect(file: File) {
    updateAccount.mutate({ avatar: file });
  }

  function handleAccountSubmit(values: AccountFormValues) {
    if (values.username === me!.username) return;
    updateAccount.mutate({ username: values.username });
  }

  function handleProfileSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl tracking-wide text-paper-100">Account</h1>
      <p className="mt-2 text-paper-500">Manage your profile, subscription, and how you sign in.</p>

      <section className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-paper-100">Photo</h2>
        <div className="mt-4">
          <AvatarPicker currentUrl={me.avatar_url} onSelect={handleAvatarSelect} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-paper-100">Account details</h2>
        <form
          onSubmit={accountForm.handleSubmit(handleAccountSubmit)}
          noValidate
          className="mt-4 flex max-w-sm flex-col gap-4"
        >
          <Input
            label="Username"
            error={accountForm.formState.errors.username?.message}
            {...accountForm.register('username')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-paper-300">Email</label>
            <div className="flex items-center justify-between gap-2 rounded-md border border-ink-600 bg-ink-800/60 px-3 py-2.5 text-paper-500">
              <span className="truncate">{me.email}</span>
              <Lock className="size-4 shrink-0" aria-hidden />
            </div>
            <p className="text-xs text-paper-500">Your email is fixed to this account and can't be changed.</p>
          </div>
          <Button type="submit" isLoading={updateAccount.isPending} className="self-start">
            Save changes
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-paper-100">Profile</h2>
        <form
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
          noValidate
          className="mt-4 flex max-w-sm flex-col gap-4"
        >
          <Input label="Full name" error={profileForm.formState.errors.full_name?.message} {...profileForm.register('full_name')} />
          <Select
            label="Country"
            error={profileForm.formState.errors.country?.message}
            {...profileForm.register('country')}
          >
            <option value="">Select a country</option>
            {Object.values(Country).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>
          <Button type="submit" isLoading={updateProfile.isPending} className="self-start">
            Save profile
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl tracking-wide text-paper-100">My subscriptions</h2>
        <div className="mt-4">
          <MySubscriptions />
        </div>
      </section>
    </div>
  );
}


