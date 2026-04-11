"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { TIMEOUTS, MESSAGES } from "@/lib/constants";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  inviteUrl: string;
  onSuccess: () => void;
}

export function InviteModal({
  isOpen,
  onClose,
  groupId,
  inviteUrl,
  onSuccess,
}: InviteModalProps) {
  const [searchIdInput, setSearchIdInput] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
  };

  const handleAddMemberBySearchId = async () => {
    if (!searchIdInput.trim()) return;
    setIsAddingMember(true);
    setAddMemberError(null);
    try {
      await api.addMember(groupId, searchIdInput.trim());
      setSearchIdInput("");
      onSuccess();
    } catch {
      setAddMemberError(MESSAGES.ERROR.USER_NOT_FOUND);
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={MESSAGES.UI.MEMBER_INVITE}>
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {MESSAGES.UI.INVITE_METHOD_SEARCH_ID}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="tanaka_123"
              value={searchIdInput}
              onChange={(e) => setSearchIdInput(e.target.value)}
              className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all"
            />
            <Button
              onClick={handleAddMemberBySearchId}
              loading={isAddingMember}
              size="sm"
              className="rounded-xl"
            >
              {MESSAGES.UI.ADD}
            </Button>
          </div>
          {addMemberError && (
            <p className="text-[10px] text-red-500 font-bold">
              {addMemberError}
            </p>
          )}
        </div>

        <div className="h-px bg-white/5"></div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {MESSAGES.UI.INVITE_METHOD_LINK}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-[10px] font-mono text-gray-400"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyInvite}
              className="rounded-xl whitespace-nowrap"
            >
              {copied ? MESSAGES.UI.COPIED : MESSAGES.UI.COPY}
            </Button>
          </div>
          <p className="text-[10px] text-gray-500">
            {MESSAGES.UI.INVITE_LINK_DESCRIPTION}
          </p>
        </div>
      </div>
    </Modal>
  );
}
