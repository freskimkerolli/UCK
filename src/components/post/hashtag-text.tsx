import Link from "next/link";
import { Fragment } from "react";

export function HashtagText({ content }: { content: string }) {
  const parts = content.split(/(#[\p{L}0-9_]{2,40})/gu);
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          return (
            <Link
              key={i}
              href={`/explore?tag=${encodeURIComponent(part.slice(1).toLowerCase())}`}
              className="text-primary hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </p>
  );
}
