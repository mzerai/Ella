/**
 * Ella's avatar — the warm "E" circle used throughout the UI.
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
        background: "linear-gradient(135deg, #E94560, #FF6B6B)",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[60%] h-[60%]">
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill="currentColor"/>
      </svg>
    </div>
  );
}
