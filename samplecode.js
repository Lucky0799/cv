import cron from "node-cron";

// Interface for Rule Hit Data
interface Rule {
  hits: number[];       // Timestamps of hits
  frequency: number;    // Max allowed hits within timeframe
  timeframe: number;    // Timeframe in seconds
}

interface RuleHits {
  [ruleId: string]: Rule;  // Dynamic rule ID keys
}

// Initialize an object to track rule hits
const ruleHits: RuleHits = {};

// Function to handle new event trigger
function handleRuleTrigger(ruleId: string, frequency: number = 8, timeframe: number = 240): void {
  // Check if the rule exists, if not, add it dynamically
  if (!ruleHits[ruleId]) {
    ruleHits[ruleId] = {
      hits: [],
      frequency,
      timeframe,
    };
    console.log(`Rule ${ruleId} added with frequency ${frequency} and timeframe ${timeframe}.`);
  }

  const rule = ruleHits[ruleId];  // Now the rule exists, so we can safely access it

  const currentTime = Date.now() / 1000; // Current timestamp in seconds

  // Add current timestamp to hits
  rule.hits.push(currentTime);

  // Remove events that are older than the timeframe
  rule.hits = rule.hits.filter((timestamp) => currentTime - timestamp <= rule.timeframe);

  // Check if rule triggered enough events within the timeframe
  if (rule.hits.length >= rule.frequency) {
    console.log(`Rule ${ruleId} triggered! Frequency limit exceeded.`);
    // Add your custom logic for rule action (e.g., alert, log, etc.)

    // Reset hits after triggering
    rule.hits = [];
  } else {
    console.log(`Rule ${ruleId} count: ${rule.hits.length}`);
  }
}

// Simulate rule triggers for testing
cron.schedule("* * * * *", () => {
  // Simulate rule 60014 and 60015 being triggered every minute for testing
  handleRuleTrigger("60014");  // Automatically adds rule if not present
  handleRuleTrigger("60015", 5, 300);  // Another rule with custom frequency and timeframe
  handleRuleTrigger("60016");  // Automatically adds rule if not present
});