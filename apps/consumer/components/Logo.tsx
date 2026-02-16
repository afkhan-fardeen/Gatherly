import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
  compact?: boolean;
}

export function Logo({ href = "/", className = "", compact }: LogoProps) {
  const sizeClass = className.includes("text-") ? "" : (compact ? "text-lg md:text-xl" : "text-2xl md:text-3xl");
  const text = (
    <span className={`font-logo font-normal tracking-tight ${sizeClass || className}`}>
      Gatherly
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={`inline-block ${className}`}>
        {text}
      </Link>
    );
  }

  return <span className={className}>{text}</span>;
}
