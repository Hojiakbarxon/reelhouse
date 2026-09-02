import { Trash2, ShieldCheck } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { RoundAvatar } from '@/components/ui/RoundAvatar';
import { formatDate } from '@/lib/format';
import { UserRole, type Review } from '@/api/types';

export function ReviewsList({
  reviews,
  currentUserId,
  currentUserRole,
  onDelete,
  isDeleting,
}: {
  reviews: Review[];
  currentUserId: string | undefined;
  currentUserRole: UserRole | null;
  onDelete: (reviewId: string) => void;
  isDeleting: boolean;
}) {
  const isStaff = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.SUPERADMIN;

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => {
        const isOwn = review.user.id === currentUserId;
        const canDelete = isOwn || isStaff;

        return (
          <div key={review.id} className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800 p-4">
            <RoundAvatar src={review.user.avatar_url} alt={review.user.username} size="sm" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-paper-100">
                    {review.user.username}
                    {isOwn && ' (you)'}
                  </p>
                  {isStaff && !isOwn && <ShieldCheck className="size-3.5 text-gold-400" aria-hidden />}
                  <span className="text-xs text-paper-500">{formatDate(review.created_at)}</span>
                </div>
                {canDelete && (
                  <button
                    onClick={() => onDelete(review.id)}
                    disabled={isDeleting}
                    className="shrink-0 p-1 text-paper-500 hover:text-crimson-400"
                    aria-label={isOwn ? 'Delete your review' : `Delete ${review.user.username}'s review`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <StarRating value={review.rating} />
              <p className="mt-2 text-sm text-paper-300">{review.comment}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}