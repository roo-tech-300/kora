const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Capture one angle of a fingerprint enrollment
// Matches the single-step capture in enroll.js lines 28-29
app.post("/api/scanner/enroll", async (req, res) => {
  try {
    const { id, angle } = req.body || {};
    if (!id || !angle) {
      return res.json({ success: false, message: "Missing id or angle" });
    }

    const { capture } = require("./src/scannerService");
    const fileId = `${id}_${angle}`;
    const result = await capture(fileId, "");

    if (result.error) {
      return res.json({ success: false, message: result.status });
    }

    const template = fs.readFileSync(result.filePath, "utf8");

    res.json({ success: true, template, fileId: result.fileId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Scan fingerprint and match against enrolled gallery
app.post("/api/scanner/identify", (_req, res) => {
  const child = exec("node src/identify.js", { cwd: __dirname }, (error, stdout, stderr) => {
    if (stderr) console.error("identify stderr:", stderr);

    const identifiedMatch = stdout.match(/Identified: (.+) \(score: (\d+)\)/);
    if (identifiedMatch) {
      res.json({
        success: true,
        match: { file: identifiedMatch[1], score: Number(identifiedMatch[2]) },
      });
    } else {
      res.json({ success: false, message: "No match found" });
    }
  });

  child.stdin.end();
});

app.listen(PORT, () => {
  console.log(`Fingerprint scanner bridge running on http://127.0.0.1:${PORT}`);
});
