"use client";

import { useEffect, useMemo, useState } from "react";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl"
} as const;

function initialsFromName(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

export function UserAvatar({ name, image, size = "md", className = "" }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = useMemo(() => initialsFromName(name), [name]);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  const showImage = Boolean(image?.trim()) && !imageFailed;

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-cyan-700 font-black text-white ring-1 ring-slate-200 ${sizeClasses[size]} ${className}`}
      aria-label={`${name} profile photo`}
    >
      {showImage ? (
        <img
          src={image!}
          alt={`${name} profile`}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
