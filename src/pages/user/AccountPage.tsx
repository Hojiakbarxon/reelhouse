import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUpdateAccount, useUpdateProfile } from '@/hooks/use-account';
import { accountSchema, profileSchema, type AccountFormValues, type ProfileFormValues } from './schemas';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner, ErrorState } from '@/components/ui/Feedback';
import { MySubscriptions } from '@/components/user/MySubscriptions';

export function AccountPage() {
  const { data: me, isLoading, isError, refetch } = useCurrentUser();
  const updateAccount = useUpdateAccount();
  const updateProfile = useUpdateProfile();

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    values: me ? { username: me.username, email: me.email } : undefined,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: me?.profile
      ? {
          full_name: me.profile.full_name ?? '',
          phone: me.profile.phone ?? '',
          country: me.profile.country ?? '',
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
    const changed: { username?: string; email?: string } = {};
    if (values.username !== me!.username) changed.username = values.username;
    if (values.email !== me!.email) changed.email = values.email;
    if (Object.keys(changed).length === 0) return;
    updateAccount.mutate(changed);
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
          <Input
            label="Email"
            type="email"
            error={accountForm.formState.errors.email?.message}
            {...accountForm.register('email')}
          />
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
          <Input label="Phone" error={profileForm.formState.errors.phone?.message} {...profileForm.register('phone')} />
          <Input label="Country" error={profileForm.formState.errors.country?.message} {...profileForm.register('country')} />
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
