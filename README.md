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

--------------------‐-------
const fs = require("fs");
const cron = require("node-cron");

// Path to the file where rule hits will be saved
const persistenceFilePath = "./ruleHits.json";

// Initialize rule structure
const ruleHits = {
  "60014": {
    hits: [],
    frequency: 8,
    timeframe: 240,
  },
};

// Read the saved hits data from the file
function loadRuleHits() {
  try {
    if (fs.existsSync(persistenceFilePath)) {
      const data = fs.readFileSync(persistenceFilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading persistence file:", error.message);
  }
  return ruleHits; // Return default if no file exists
}

// Save the current state of rule hits to the file
function saveRuleHits() {
  try {
    fs.writeFileSync(persistenceFilePath, JSON.stringify(ruleHits, null, 2), "utf-8");
    console.log("Rule hits saved successfully.");
  } catch (error) {
    console.error("Error saving persistence file:", error.message);
  }
}

// Function to handle new event trigger
function handleRuleTrigger(ruleId) {
  const rule = ruleHits[ruleId];
  if (!rule) return;

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

  // Save the current state to file
  saveRuleHits();
}

// Simulate rule triggers for testing
cron.schedule("* * * * *", () => {
  // Simulate rule 60014 being triggered every minute for testing
  handleRuleTrigger("60014");
});

// Load persisted rule hits on application start
ruleHits = loadRuleHits();
console.log("Loaded rule hits from persistence file:", ruleHits);

