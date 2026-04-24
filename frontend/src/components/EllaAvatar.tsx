import Image from "next/image";

/**
 * Ella's avatar — using the custom Avatar-Ella.png image.
 */

interface EllaAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10 text-lg",
  lg: "w-14 h-14 text-2xl",
  xl: "w-32 h-32 md:w-48 md:h-48",
};

export default function EllaAvatar({
  size = "md",
  className = "",
}: EllaAvatarProps) {
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center shrink-0 ${sizes[size]} ${className} border-2 border-white/20 shadow-xl shadow-black/10 bg-white/5 backdrop-blur-sm transition-transform duration-500 hover:scale-105`}
    >
      <Image
        src="/assets/Avatar-Ella.png"
        alt="Ella"
        width={200}
        height={200}
        className="w-full h-full object-cover"
        priority={size === "xl"}
      />
    </div>
  );
}
