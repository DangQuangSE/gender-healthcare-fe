import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reportDir = path.resolve(
  here,
  "../src/features/Dashboard/AdminDashboard/DashboardReports"
);

test("dashboard reports delegates data, constants and view sections", () => {
  for (const fileName of [
    "DashboardReports.constants.js",
    "useDashboardReports.js",
    "DashboardReportsHeader.jsx",
    "DashboardStatistics.jsx",
    "DashboardReportsSections.jsx",
    "DashboardReports.columns.jsx",
  ]) {
    assert.equal(fs.existsSync(path.join(reportDir, fileName)), true, fileName);
  }

  const source = fs.readFileSync(
    path.join(reportDir, "DashboardReports.jsx"),
    "utf8"
  );
  assert.equal(source.includes("fetchDashboardData"), false);
  assert.equal(source.includes("console."), false);
});
