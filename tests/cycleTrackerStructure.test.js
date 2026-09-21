import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cycleDir = path.resolve(here, "../src/features/Services/CycleTracker");

test("cycle tracker page delegates guide, notifications and summary views", () => {
  for (const fileName of [
    "CycleTracker.constants.js",
    "CycleTrackerGuide.jsx",
    "CycleTrackerNotifications.jsx",
    "CycleTrackerSummary.jsx",
  ]) {
    assert.equal(fs.existsSync(path.join(cycleDir, fileName)), true, fileName);
  }

  const source = fs.readFileSync(path.join(cycleDir, "CycleTracker.jsx"), "utf8");
  assert.equal(source.includes("<BarChart"), false);
  assert.equal(source.includes("Hướng dẫn sử dụng CycleTracking"), false);
});
