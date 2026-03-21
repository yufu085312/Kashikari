-- group_members テーブルの削除ポリシーを更新
-- 従来の「自分自身のみ削除（退会）可能」に加えて、「グループ作成者が他メンバーを削除可能」を追加

DROP POLICY IF EXISTS "Members delete by authenticated" ON public.group_members;

CREATE POLICY "Members delete by creator or self" ON public.group_members
FOR DELETE USING (
  user_id = auth.uid() OR 
  group_id IN (SELECT id FROM public.groups WHERE created_by = auth.uid())
);
