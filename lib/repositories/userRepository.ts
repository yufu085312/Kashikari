import { createClient } from "@/utils/supabase/server";
import { DatabaseError } from "@/lib/errors";

export async function findUsersBySearchIds(searchIds: string[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, search_id")
    .in("search_id", searchIds);

  if (error) throw new DatabaseError(error.message);
  return data || [];
}
