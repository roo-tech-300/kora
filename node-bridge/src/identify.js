const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const ENROLL_DIR = path.resolve("./.db/minut");
const EXEC_DIR = path.resolve("./.exec");
const MATCHER_DIR = path.resolve("./.exec/exec");
const LIS_PATH = path.resolve(ENROLL_DIR, "m.lis");
const PROBE_PATH = path.resolve(EXEC_DIR, "probe.xyt");
const THRESHOLD = 40;

function buildGalleryList() {
  const files = fs.readdirSync(ENROLL_DIR)
    .filter(f => f.endsWith(".xyt") && f !== "match.xyt" && f !== "probe.xyt")
    .map(f => path.resolve(ENROLL_DIR, f))
    .join("\n");
  fs.writeFileSync(LIS_PATH, files + "\n", "utf8");
}

function scanProbe(id) {
  return new Promise((resolve, reject) => {
    exec(`cd .exec & fcmb.exe ./ ${id}`, (error, stdout) => {
      const success = stdout.includes("Fingerprint image is written");
      if (!error && success) {
        const src = path.resolve(EXEC_DIR, `${id}.xyt`);
        if (fs.existsSync(src)) {
          fs.renameSync(src, PROBE_PATH);
        }
        resolve();
      } else {
        const noScanner = stdout.split("\n")[2] === undefined;
        reject(new Error(noScanner ? "connect scanner" : "try again"));
      }
    });
  });
}

function matchProbe() {
  return new Promise((resolve, reject) => {
    exec(`cd "${MATCHER_DIR}" & bozorth3 -p "${PROBE_PATH}" -G "${LIS_PATH}"`, (err, stdout) => {
      if (err) return reject(err);
      const scores = stdout.trim().split(/\r?\n/).filter(Boolean).map(Number);
      if (scores.length === 0) return resolve(null);

      const maxScore = Math.max(...scores);
      if (maxScore < THRESHOLD) return resolve(null);

      const idx = scores.indexOf(maxScore);
      const lines = fs.readFileSync(LIS_PATH, "utf8").split(/\r?\n/).filter(Boolean);
      if (idx >= lines.length) return resolve(null);
      const matchedFile = path.basename(lines[idx]);
      resolve({ file: matchedFile, score: maxScore });
    });
  });
}

async function identify() {
  const probeId = `probe_${Date.now()}`;
  const enrolled = fs.readdirSync(ENROLL_DIR).filter(f => f.endsWith(".xyt") && f !== "match.xyt" && f !== "probe.xyt");

  if (enrolled.length === 0) {
    console.log("No enrolled fingerprints found in .db/minut/");
    process.exit(1);
  }

  console.log("Place your finger on the scanner...");
  buildGalleryList();
  await scanProbe(probeId);

  const result = await matchProbe();
  if (result) {
    console.log(`Identified: ${result.file} (score: ${result.score})`);
  } else {
    console.log("No match found");
  }

  // Cleanup probe
  if (fs.existsSync(PROBE_PATH)) fs.unlinkSync(PROBE_PATH);
}

identify().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});