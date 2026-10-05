import { config } from "@/lib/config";
import { runSync } from "./sync";

let started = false;

/** Sync once on boot, then every SYNC_INTERVAL_MINUTES. */
export function startScheduler() {
  const minutes = config.syncIntervalMinutes;
  if (started || minutes <= 0) return;
  started = true;
  const tick = () => runSync().catch((err) => console.error("[sync] crashed", err));
  setTimeout(tick, 2_000);
  setInterval(tick, minutes * 60_000).unref();
  console.log(`[sync] scheduler running every ${minutes} min`);
}
