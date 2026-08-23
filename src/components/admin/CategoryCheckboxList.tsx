import type { Category } from '@/api/types';

export function CategoryCheckboxList({
  categories,
  selected,
  onToggle,
  error,
}: {
  categories: Category[];
  selected: string[];
  onToggle: (id: string) => void;
  error?: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-paper-300">Categories</p>
      {categories.length === 0 ? (
        <p className="text-sm text-paper-500">No categories yet — create one first on the Categories tab.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const checked = selected.includes(category.id);
            return (
              <label
                key={category.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  checked
                    ? 'border-gold-500 bg-gold-400/15 text-gold-300'
                    : 'border-ink-600 text-paper-300 hover:border-ink-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(category.id)}
                  className="sr-only"
                />
                {category.name}
              </label>
            );
          })}
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-crimson-400">{error}</p>}
    </div>
  );
}
