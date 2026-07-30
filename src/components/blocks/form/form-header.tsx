"use client";
import FunctionLogo from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { useThemeColors } from "@/components/common/use-theme-colors";
import { usePathname } from "next/navigation";

interface FormHeaderProps {
  onClose?: (() => void) | undefined;
  className?: string;
}

export default function FormHeader({ onClose, className }: FormHeaderProps) {
  const colors = useThemeColors();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className={cn("flex flex-row justify-between items-stretch", className)}
    >
      <Link
        href="/#home"
        className="flex-shrink-0 flex items-center group"
        {...(isHome && onClose ? { onClick: () => onClose() } : {})}
      >
        <FunctionLogo
          className={cn(
            "origin-left xs:scale-100 scale-119 group-hover:fill-[#FF3F1A] transition-colors ease-in-out duration-300",
            colors.conditional("fill-[#151516]", "fill-[#F0EDE8]")
          )}
        />
      </Link>

      <div className="flex items-center gap-3">
        {/* Версия для маленьких экранов (< 430px) - только текст */}
        <span
          className={cn(
            "xs:hidden cursor-pointer text-[#151516] hover:text-[#FF3F1A] transition-colors duration-300 font-medium"
          )}
          onClick={onClose}
        >
          Close
        </span>
        {/* Версия для больших экранов (>= 430px) - кнопка */}
        <button
          className={cn(
            "hidden xs:inline-flex items-center px-5 text-sm py-0.5 font-normal leading-[2.125rem] text-nowrap tracking-[0%] rounded-full transition-colors",
            colors.buttonBg,
            colors.buttonText,
            colors.conditional(
              "hover:bg-[#FF3F1A] hover:text-[#151516]",
              "hover:bg-[#FF3F1A] hover:text-[#151516]"
            ),
            className
          )}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
