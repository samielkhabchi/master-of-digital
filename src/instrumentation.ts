// Starts the background catalog sync when the Node server boots.
export async function register() {
  // Written as an if-block (not an early return) so the bundler drops this import from the edge build.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/catalog/scheduler");
    startScheduler();
  }
}
