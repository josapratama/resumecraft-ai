#!/usr/bin/env node
/**
 * 🌐 [ResumeCraft AI] Build-Time Translation Synchronizer
 * Downloads latest translations from Polyglot Hub (https://polyglot-hub.josapratama.com)
 * or local fallback, generating clean nested JSON files in client/src/locales/ with ZERO runtime lag.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_SLUG = process.argv[2] || "resumecraft";
const TARGET_DIR = path.resolve(process.cwd(), process.argv[3] || "client/src/locales");
const POLYGLOT_URL = (process.argv[4] || process.env.POLYGLOT_HUB_URL || "https://polyglot-hub.josapratama.com").replace(/\/+$/, "");

async function syncTranslations() {
  console.log("\n======================================================");
  console.log("🌐 [Polyglot Hub] Build-Time Translation Sync");
  console.log("======================================================");
  console.log(`📦 Project     : "${PROJECT_SLUG}"`);
  console.log(`📡 Server URL  : ${POLYGLOT_URL}`);
  console.log(`📁 Target Dir  : ${TARGET_DIR}`);

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const languages = [
    { code: "en", name: "English" },
    { code: "id", name: "Bahasa Indonesia" },
    { code: "ja", name: "Japanese" }
  ];

  let successCount = 0;

  for (const lang of languages) {
    const exportUrl = `${POLYGLOT_URL}/api/v1/export/${PROJECT_SLUG}/${lang.code}?common=true&format=nested`;
    const targetFile = path.join(TARGET_DIR, `${lang.code}.json`);
    let synced = false;

    try {
      const res = await fetch(exportUrl, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const dictionary = await res.json();
        if (dictionary && Object.keys(dictionary).length > 0) {
          fs.writeFileSync(targetFile, JSON.stringify(dictionary, null, 2), "utf-8");
          console.log(`  ✓ Synced ${lang.code}.json from Polyglot Hub server`);
          synced = true;
          successCount++;
        }
      }
    } catch {
      // Fallback handled below
    }

    if (!synced) {
      if (fs.existsSync(targetFile)) {
        console.log(`  ✓ Using local cache for ${lang.code}.json`);
        successCount++;
      } else {
        console.warn(`  ⚠️ Could not sync ${lang.code}.json`);
      }
    }
  }

  console.log(`\n✨ Translation sync finished (${successCount}/${languages.length} languages ready)`);
  console.log("======================================================\n");
}

syncTranslations().catch(err => {
  console.error("Sync error:", err.message);
  process.exit(0); // Never break build
});
