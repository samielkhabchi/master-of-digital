"use client";

/** Sort dropdown that submits its surrounding GET form on change. */
export function SortSelect({ value, options, label }: { value: string; options: { value: string; label: string }[]; label: string }) {
  return (
    <select
      name="sort"
      defaultValue={value}
      aria-label={label}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-semibold focus:border-violet focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
