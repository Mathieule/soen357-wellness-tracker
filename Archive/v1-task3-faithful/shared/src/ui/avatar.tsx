/**
 * Profile picture placeholder (Task 3, C3). No photo upload exists in the
 * prototype, so the initials are drawn in a circle and exposed to assistive
 * technology as an image with descriptive alternative text (AR6).
 */
export function Avatar({ name, size = 96 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
  return (
    <span
      role="img"
      aria-label={`Profile picture of ${name}`}
      className="inline-flex items-center justify-center rounded-full border-4 border-ink bg-sleep font-bold"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      <span aria-hidden="true">{initials}</span>
    </span>
  );
}
