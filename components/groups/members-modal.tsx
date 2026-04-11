"use client";

import { useState } from "react";
import { User } from "@/types/user";
import { Balance } from "@/types/balance";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { useAlert } from "@/components/providers/alert-provider";
import { MESSAGES } from "@/lib/constants";

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  userId: string;
  members: User[];
  createdBy?: string;
  balances: Balance[];
  onRemoveSuccess: (memberId: string) => void;
}

export function MembersModal({
  isOpen,
  onClose,
  groupId,
  userId,
  members,
  createdBy,
  balances,
  onRemoveSuccess,
}: MembersModalProps) {
  const { alert, confirm } = useAlert();
  const [isRemovingMemberId, setIsRemovingMemberId] = useState<string | null>(
    null,
  );

  const handleRemoveMember = async (member: User) => {
    if (member.id === createdBy) return;

    const hasBalance = balances.some(
      (b) => b.fromUserId === member.id || b.toUserId === member.id,
    );
    if (hasBalance) {
      await alert({
        title:
          member.id === userId
            ? MESSAGES.UI.LEAVE_NOT_REMOVABLE
            : MESSAGES.UI.DELETE_NOT_REMOVABLE,
        message:
          member.id === userId
            ? MESSAGES.ERROR.MEMBER_LEAVE_SETTLEMENT_PENDING
            : MESSAGES.ERROR.MEMBER_REMOVE_SETTLEMENT_PENDING,
        type: "warn",
      });
      return;
    }

    const isConfirmed = await confirm({
      title:
        member.id === userId ? MESSAGES.UI.LEAVE_GROUP : MESSAGES.UI.REMOVE,
      message:
        member.id === userId
          ? MESSAGES.UI.CONFIRM_LEAVE_GROUP
          : MESSAGES.UI.CONFIRM_REMOVE_MEMBER,
      type: "danger",
      confirmText:
        member.id === userId ? MESSAGES.UI.LEAVE : MESSAGES.UI.REMOVE,
      cancelText: MESSAGES.UI.BACK,
    });

    if (!isConfirmed) return;

    setIsRemovingMemberId(member.id);
    try {
      await api.removeMember(groupId, member.id);
      onRemoveSuccess(member.id);
    } catch {
      await alert({
        title: MESSAGES.UI.ERROR_TITLE,
        message: MESSAGES.ERROR.MEMBER_REMOVE_FAILED,
        type: "error",
      });
    } finally {
      setIsRemovingMemberId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={MESSAGES.UI.MEMBER_LIST}>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center min-w-0">
              <p className="text-sm font-bold text-white truncate">{m.name}</p>
            </div>
            {m.id === createdBy && (
              <span className="shrink-0 ml-2 text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                {MESSAGES.UI.ROLE_CREATOR}
              </span>
            )}

            {((userId === createdBy && m.id !== createdBy) ||
              (m.id === userId && userId !== createdBy)) && (
              <button
                onClick={() => handleRemoveMember(m)}
                disabled={isRemovingMemberId !== null}
                className={`ml-2 p-1.5 rounded-lg transition-all active:scale-95 ${
                  m.id === userId
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                }`}
                title={m.id === userId ? MESSAGES.UI.LEAVE : MESSAGES.UI.REMOVE}
              >
                {isRemovingMemberId === m.id ? (
                  <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                ) : m.id === userId ? (
                  <span className="text-[10px] font-bold px-1.5">
                    {MESSAGES.UI.LEAVE}
                  </span>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button
          variant="secondary"
          className="w-full rounded-xl"
          onClick={onClose}
        >
          {MESSAGES.UI.CLOSE}
        </Button>
      </div>
    </Modal>
  );
}
