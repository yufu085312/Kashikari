"use client";

import Link from "next/link";
import { Group } from "@/types/group";
import { MESSAGES } from "@/lib/constants";

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-200 cursor-pointer active:scale-95">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
            {group.name.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg truncate">
              {group.name}
            </h3>
            {group.members && (
              <p className="text-sm text-gray-400 mt-0.5">
                {group.members.length}
                {MESSAGES.UI.MEMBER_COUNT_SUFFIX}
              </p>
            )}
          </div>

          {/* Arrow */}
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
