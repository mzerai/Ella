/**
 * ELLA's avatar — the warm "E" circle used throughout the UI.
 */

interface EllaAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-lg",
  lg: "w-14 h-14 text-2xl",
};

export default function EllaAvatar({
  size = "md",
  className = "",
}: EllaAvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${sizes[size]} ${className}`}
      style={{
        background: "linear-gradient(135deg, #EF9F27, #D85A30)",
      }}
    >
      E
    </div>
  );
}
