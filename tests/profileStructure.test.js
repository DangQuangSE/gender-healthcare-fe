import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const profileDir = path.resolve(here, "../src/pages/UserProfile/Profile");

test("profile page delegates data and UI responsibilities to focused modules", () => {
  for (const fileName of [
    "Profile.constants.js",
    "useProfileData.js",
    "ProfileForm.jsx",
    "ProfileAvatar.jsx",
    "CertificateList.jsx",
    "CertificateModal.constants.js",
  ]) {
    assert.equal(fs.existsSync(path.join(profileDir, fileName)), true, fileName);
  }

  const source = fs.readFileSync(path.join(profileDir, "Profile.jsx"), "utf8");
  assert.equal(source.includes("getCurrentUser"), false);
  assert.equal(source.includes("updateProfile"), false);
  assert.equal(source.includes("updateAvatar"), false);
});
