import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { useDisableTwoFactor } from "@/hooks/use-two-factor";
import { classifyError } from "@/lib/errors";
import type { ClassifiedError } from "@/lib/errors";
import { Badge } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { buttonClass } from "@/components/ui/button-styles";
import { Modal } from "@/components/ui/Modal";
import { OtpInput } from "@/components/ui/OtpInput";
import { AuthAlert } from "@/components/ui/AuthAlert";

export function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const disable = useDisableTwoFactor();
  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<ClassifiedError | null>(null);

  function close() {
    if (disable.isPending) return;
    setOpen(false);
    setOtp("");
    setFormError(null);
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      setFormError({
        kind: "otp",
        message: "Enter all 6 digits from your authenticator app.",
      });
      return;
    }
    setFormError(null);
    try {
      await disable.mutateAsync(otp);
      toast.success("Two-factor authentication disabled");
      setOpen(false);
      setOtp("");
    } catch (error) {
      setOtp("");
      setFormError(classifyError(error));
    }
  }

  return (
    <div className="rounded-card border border-ink-600 bg-ink-800/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {enabled ? (
            <ShieldCheck
              className="mt-0.5 size-6 shrink-0 text-emerald-400"
              aria-hidden
            />
          ) : (
            <ShieldOff
              className="mt-0.5 size-6 shrink-0 text-paper-500"
              aria-hidden
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-paper-100">
                Two-step verification
              </h3>
              <Badge tone={enabled ? "emerald" : "neutral"}>
                {enabled ? "On" : "Off"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-paper-500">
              {enabled
                ? "Sign-in needs your password plus a 6-digit code from your authenticator app."
                : "Add a second step at sign-in using an authenticator app. Strongly recommended."}
            </p>
          </div>
        </div>

        {/* Full-width on phones so it is an obvious, easy tap target. */}
        {enabled ? (
          <Button
            variant="secondary"
            className="w-full sm:w-auto sm:shrink-0"
            onClick={() => setOpen(true)}
          >
            Turn off
          </Button>
        ) : (
          <Link
            to="/account/two-factor"
            className={buttonClass({
              variant: "primary",
              className: "w-full sm:w-auto sm:shrink-0",
            })}
          >
            Set up 2FA
          </Link>
        )}
      </div>

      <Modal open={open} onClose={close} title="Turn off 2FA">
        <form
          onSubmit={handleDisable}
          noValidate
          className="flex flex-col gap-4"
        >
          <p className="text-sm text-paper-300">
            Enter the current 6-digit code from your authenticator app to
            confirm. Your account will be protected by your password only.
          </p>
          {formError && <AuthAlert error={formError} />}
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={disable.isPending}
            autoFocus
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={close}
              disabled={disable.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="w-full sm:order-last sm:w-auto"
              isLoading={disable.isPending}
            >
              Turn off 2FA
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
