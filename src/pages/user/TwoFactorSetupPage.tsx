import { useEffect, useState } from "react";
import { Link, useBlocker, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { clsx } from "clsx";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useConfirmTwoFactor,
  useEnableTwoFactor,
} from "@/hooks/use-two-factor";
import { classifyError } from "@/lib/errors";
import type { ClassifiedError } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { AuthAlert } from "@/components/ui/AuthAlert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Feedback";
import type { TwoFactorEnableData } from "@/hooks/auth";
import { CopyButton } from "@/components/ui/CopyButton";

type Step = "guide" | "scan" | "verify" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "guide", label: "Guide" },
  { id: "scan", label: "Scan & save" },
  { id: "verify", label: "Verify" },
  { id: "done", label: "Done" },
];

const AUTH_APPS = [
  "Google Authenticator",
  "Microsoft Authenticator",
  "Authy",
  "1Password",
  "Bitwarden",
];

export function TwoFactorSetupPage() {
  const navigate = useNavigate();
  const { data: me, isLoading } = useCurrentUser();
  const enable = useEnableTwoFactor();
  const confirm = useConfirmTwoFactor();

  const [step, setStep] = useState<Step>("guide");
  // The secret lives in component state ONLY — never in storage, the URL or
  // the query cache. The backend shows it once, so a refresh loses it by design.
  const [setup, setSetup] = useState<TwoFactorEnableData | null>(null);
  const [savedKey, setSavedKey] = useState(false);
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<ClassifiedError | null>(null);

  const holdsSecret = step === "scan" || step === "verify";

  // Guard against accidentally losing the one-time key (tab close / refresh)…
  useEffect(() => {
    if (!holdsSecret) return;
    function warn(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [holdsSecret]);

  // …and against in-app navigation.
  const blocker = useBlocker(holdsSecret);

  if (isLoading) return <Spinner label="Loading" />;

  if (me?.enabledTwoFactorAuthentication && step !== "done") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <ShieldCheck className="mx-auto size-10 text-emerald-400" aria-hidden />
        <h1 className="mt-4 font-display text-3xl tracking-wide text-paper-100">
          2FA is already on
        </h1>
        <p className="mt-2 text-sm text-paper-500">
          Your account is already protected. You can turn it off from your
          account page.
        </p>
        <Button className="mt-6" onClick={() => navigate("/account")}>
          Back to account
        </Button>
      </div>
    );
  }

  async function handleGenerate() {
    setFormError(null);
    try {
      const data = await enable.mutateAsync();
      setSetup(data);
      setSavedKey(false);
      setOtp("");
      setStep("scan");
    } catch (error) {
      setFormError(classifyError(error));
    }
  }

  async function handleVerify(e: React.FormEvent) {
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
      await confirm.mutateAsync(otp);
      // Done with the secret — drop it from memory.
      setSetup(null);
      setOtp("");
      setStep("done");
      toast.success("Two-factor authentication enabled");
    } catch (error) {
      setOtp("");
      setFormError(classifyError(error));
    }
  }

  const currentIndex = STEPS.findIndex((s) => s.id === step);
  // Groups of 4 are easier to read and to type into an authenticator app.
  const groupedSecret = setup?.secret.match(/.{1,4}/g)?.join(" ") ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {step !== "done" && (
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-paper-500 transition-colors hover:text-gold-400"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to account
        </Link>
      )}

      <h1 className="mt-4 font-display text-4xl tracking-wide text-paper-100">
        Two-step verification
      </h1>
      <p className="mt-2 text-paper-500">
        Add a second lock to your Reelhouse account.
      </p>

      {/* Progress */}
      <ol className="mt-8 flex items-center gap-2" aria-label="Setup progress">
        {STEPS.map((s, i) => {
          const active = i === currentIndex;
          const complete = i < currentIndex;
          return (
            <li
              key={s.id}
              className="flex flex-1 items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={clsx(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                  complete && "border-gold-400 bg-gold-400 text-ink-950",
                  active && "border-gold-400 text-gold-400",
                  !complete && !active && "border-ink-600 text-ink-400",
                )}
              >
                {complete ? "✓" : i + 1}
              </span>
              <span
                className={clsx(
                  "hidden truncate text-xs font-medium sm:inline",
                  active ? "text-paper-100" : "text-paper-500",
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-ink-600" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {/* ───────── Step 1: guide ───────── */}
        {step === "guide" && (
          <div className="flex flex-col gap-6">
            <section className="rounded-card border border-ink-600 bg-ink-800/60 p-5">
              <h2 className="font-display text-xl tracking-wide text-paper-100">
                What is 2FA?
              </h2>
              <p className="mt-2 text-sm text-paper-300">
                After you enter your password, Reelhouse will also ask for a
                6-digit code from an app on your phone. Even if someone learns
                your password, they can't sign in without that code.
              </p>
            </section>

            <section className="rounded-card border border-ink-600 bg-ink-800/60 p-5">
              <h2 className="font-display text-xl tracking-wide text-paper-100">
                How to set it up
              </h2>
              <ol className="mt-4 flex flex-col gap-4 text-sm text-paper-300">
                <li className="flex gap-3">
                  <Smartphone
                    className="mt-0.5 size-5 shrink-0 text-gold-400"
                    aria-hidden
                  />
                  <div>
                    <p className="font-medium text-paper-100">
                      1. Get an authenticator app
                    </p>
                    <p className="mt-0.5 text-paper-500">
                      Install one on your phone, for example{" "}
                      {AUTH_APPS.join(", ")}.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <KeyRound
                    className="mt-0.5 size-5 shrink-0 text-gold-400"
                    aria-hidden
                  />
                  <div>
                    <p className="font-medium text-paper-100">
                      2. Scan the QR code & save your key
                    </p>
                    <p className="mt-0.5 text-paper-500">
                      We'll show a QR code and a secret key. Scan the code (or
                      type the key into the app) and keep a copy of the key
                      somewhere safe.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-gold-400"
                    aria-hidden
                  />
                  <div>
                    <p className="font-medium text-paper-100">
                      3. Enter the 6-digit code
                    </p>
                    <p className="mt-0.5 text-paper-500">
                      Type the code your app shows to confirm everything works.
                      Then 2FA is on.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            <div
              role="note"
              className="flex items-start gap-3 rounded-card border border-gold-500/40 bg-gold-400/10 p-4"
            >
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-gold-400"
                aria-hidden
              />
              <div className="text-sm">
                <p className="font-semibold text-gold-300">
                  Your secret key is shown only once
                </p>
                <p className="mt-1 text-paper-300">
                  For your security we don't store it where you can read it
                  again. Once you leave or refresh the next screen, it's gone.
                  Save it in a password manager or write it down — if you lose
                  both your phone and the key, you won't be able to sign in.
                </p>
              </div>
            </div>

            {formError && <AuthAlert error={formError} />}

            <Button
              size="lg"
              onClick={handleGenerate}
              isLoading={enable.isPending}
              className="w-full sm:w-auto sm:self-start"
            >
              I'm ready — show my QR code
            </Button>
          </div>
        )}

        {/* ───────── Step 2: scan & save ───────── */}
        {step === "scan" && setup && (
          <div className="flex flex-col gap-6">
            <div
              role="alert"
              className="flex items-start gap-3 rounded-card border border-crimson-500/40 bg-crimson-500/10 p-4"
            >
              <ShieldAlert
                className="mt-0.5 size-5 shrink-0 text-crimson-400"
                aria-hidden
              />
              <div className="text-sm">
                <p className="font-semibold text-crimson-400">
                  This is the only time you'll see this key
                </p>
                <p className="mt-1 text-paper-300">
                  Copy it and store it safely before you continue. Leaving or
                  refreshing this page will discard it, and you'd have to start
                  over.
                </p>
              </div>
            </div>

            <div className="grid gap-6 rounded-card border border-ink-600 bg-ink-800/60 p-5 md:grid-cols-[auto_1fr] md:items-start">
              <div className="mx-auto flex w-full max-w-[14rem] flex-col items-center gap-3 md:mx-0">
                <div className="w-full rounded-md bg-paper-100 p-1">
                  <QRCodeSVG
                    value={setup.otpauthUrl}
                    level="M"
                    marginSize={2}
                    bgColor="#f6f4ee"
                    fgColor="#0a0d13"
                    style={{ width: "100%", height: "auto" }}
                    role="img"
                    aria-label="QR code for your authenticator app"
                  />
                </div>
                <a
                  href={setup.otpauthUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-400 hover:text-gold-300 md:hidden"
                >
                  <Smartphone className="size-3.5" aria-hidden />
                  On this phone? Open in authenticator app
                </a>
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-xl tracking-wide text-paper-100">
                  1. Scan the QR code
                </h2>
                <p className="mt-1 text-sm text-paper-500">
                  Open your authenticator app, choose “Add account”, and scan
                  the code.
                </p>

                <h2 className="mt-6 font-display text-xl tracking-wide text-paper-100">
                  2. Or enter the key manually
                </h2>
                <p className="mt-1 text-sm text-paper-500">
                  Can't scan? Type this key into your app instead.
                </p>

                <div className="mt-3 rounded-md border border-ink-600 bg-ink-900 p-3">
                  <p
                    className="select-all break-all font-mono text-base tracking-wider text-gold-300 sm:text-lg"
                    aria-label="Secret key"
                  >
                    {groupedSecret}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CopyButton value={setup.secret} label="Copy secret key" />
                  <span className="inline-flex items-center gap-1 text-xs text-paper-500">
                    <Download className="size-3.5" aria-hidden />
                    Paste it into your password manager
                  </span>
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-card border border-ink-600 bg-ink-800/60 p-4 text-sm text-paper-300">
              <input
                type="checkbox"
                checked={savedKey}
                onChange={(e) => setSavedKey(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-gold-400"
              />
              <span>
                I've saved my secret key somewhere safe and understand it won't
                be shown again.
              </span>
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => navigate("/account")}>
                Cancel setup
              </Button>
              <Button
                disabled={!savedKey}
                onClick={() => {
                  setFormError(null);
                  setStep("verify");
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ───────── Step 3: verify ───────── */}
        {step === "verify" && (
          <form
            onSubmit={handleVerify}
            noValidate
            className="flex flex-col gap-5 rounded-card border border-ink-600 bg-ink-800/60 p-5"
          >
            <div>
              <h2 className="font-display text-xl tracking-wide text-paper-100">
                Enter your 6-digit code
              </h2>
              <p className="mt-1 text-sm text-paper-500">
                Open your authenticator app and type the current code for
                Reelhouse. Codes change every 30 seconds — if one doesn't work,
                wait for the next.
              </p>
            </div>

            {formError && <AuthAlert error={formError} />}

            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={confirm.isPending}
            />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                disabled={confirm.isPending}
                onClick={() => {
                  setFormError(null);
                  setStep("scan");
                }}
              >
                Back to my key
              </Button>
              <Button type="submit" isLoading={confirm.isPending}>
                Verify & enable 2FA
              </Button>
            </div>
          </form>
        )}

        {/* ───────── Step 4: done ───────── */}
        {step === "done" && (
          <div className="rounded-card border border-emerald-400/30 bg-emerald-400/5 p-6 text-center">
            <CheckCircle2
              className="mx-auto size-12 text-emerald-400"
              aria-hidden
            />
            <h2 className="mt-4 font-display text-3xl tracking-wide text-paper-100">
              You're protected
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-paper-300">
              From now on, signing in will ask for your password and a 6-digit
              code from your authenticator app. Keep your secret key safe — it's
              your way back in if you lose your phone.
            </p>
            <Button className="mt-6" onClick={() => navigate("/account")}>
              Back to account
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Leave 2FA setup?"
        description="Your secret key is shown only once. If you leave now it will be discarded and you'll need to start the setup again."
        confirmLabel="Leave and discard"
        onConfirm={() => blocker.state === "blocked" && blocker.proceed()}
        onCancel={() => blocker.state === "blocked" && blocker.reset()}
      />
    </div>
  );
}
