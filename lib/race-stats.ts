
import { createClient } from "./supabase/client";

type RaceResult = {
  wpm: number;
  accuracy: number;
  mistakes: number;
  durationMs: number;
};

export async function saveRaceResult(race: RaceResult) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Please sign in before saving a race.",
    };
  }

  const { error } = await supabase.from("race_results").insert({
    user_id: user.id,
    wpm: Math.max(0, Math.round(race.wpm)),
    accuracy: Math.min(100, Math.max(0, Math.round(race.accuracy))),
    mistakes: Math.max(0, Math.round(race.mistakes)),
    duration_ms: Math.max(0, Math.round(race.durationMs)),
  });

  if (error) {
    console.error("Could not save race:", error.message);
    return {
      success: false,
      error: "Your race could not be saved. Please try again.",
    };
  }

  return { success: true, error: null };
}
