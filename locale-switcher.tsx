import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-x", className)} {...props} />;
}
