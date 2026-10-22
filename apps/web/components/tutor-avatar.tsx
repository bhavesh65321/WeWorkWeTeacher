function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function TutorAvatar({
  name,
  photoUrl,
  className = "h-12 w-12 text-sm",
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl && /^(https?:\/\/|\/)/i.test(photoUrl)) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`shrink-0 rounded-2xl object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--wtws-blue))] font-bold text-white ${className}`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
