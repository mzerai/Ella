import Image from "next/image";

/**
 * Ella's avatar — using the custom transparent Ella-new.png image.
 * Square style as requested.
 */

interface EllaAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
  xl: "w-48 h-48 md:w-64 md:h-64",
};

export default function EllaAvatar({
  size = "md",
  className = "",
}: EllaAvatarProps) {
  const isLarge = size === "xl";

  return (
    <div
      className={`overflow-hidden flex items-center justify-center shrink-0 ${sizes[size]} ${className} ${
        !isLarge ? "bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm" : ""
      } transition-transform duration-500 hover:scale-105`}
    >
      <Image
        src="/assets/Ella-new.png"
        alt="Ella"
        width={300}
        height={300}
        className="w-full h-full object-contain"
        priority={isLarge}
      />
    </div>
  );
}
