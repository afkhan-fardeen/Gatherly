import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className = "" }: LogoProps) {
  const text = (
    <span className="font-logo text-2xl md:text-3xl font-normal tracking-tight">
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
