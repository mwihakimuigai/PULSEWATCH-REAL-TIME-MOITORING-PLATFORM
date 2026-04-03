import { pool } from "../db/connection";
import { generateDemoEvents } from "../utils/eventFactory";

const run = async () => {
  const events = generateDemoEvents(120);
  let createdHighSeverity = 0;

  for (const event of events) {
    if (!event.createdAt) {
      continue;
    }

    const [result] = await pool.execute(
      "INSERT INTO events (type, message, severity, source, created_at) VALUES (?, ?, ?, ?, ?)",
      [event.type, event.message, event.severity, event.source, event.createdAt]
    );
    const eventId = (result as { insertId: number }).insertId;

    if (event.severity === "high" && createdHighSeverity < 12) {
      await pool.execute(
        "INSERT INTO alerts (event_id, trigger_type, status, resolved_at, created_at) VALUES (?, 'high_severity_threshold', ?, ?, ?)",
        [
          eventId,
          createdHighSeverity % 3 === 0 ? "resolved" : "unresolved",
          createdHighSeverity % 3 === 0 ? event.createdAt : null,
          event.createdAt
        ]
      );
      createdHighSeverity += 1;
    }
  }

  console.log(`Seeded ${events.length} demo events into PulseWatch.`);
  await pool.end();
};

run().catch(async (error) => {
  console.error("Failed to seed demo events", error);
  await pool.end();
  process.exit(1);
});
