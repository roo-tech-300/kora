const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.resolve("./.db/minut");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

exports.capture = (id, count) => {
  return new Promise((resolve) => {
    const fileId = count ? `${id}${count}` : id;
    exec(`cd .exec & fcmb.exe ./ ${fileId}`, (error, stdout) => {
      const success = stdout.includes("Fingerprint image is written");
      if (!error && success) {
        const currentPath = path.resolve(".exec", `${fileId}.xyt`);
        const newPath = path.resolve(OUTPUT_DIR, `${fileId}.xyt`);
        if (fs.existsSync(currentPath)) {
          if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
          fs.renameSync(currentPath, newPath);
        }
        resolve({ error: false, status: "success", filePath: newPath, fileId });
      } else {
        const noScanner = stdout.split("\n")[2] === undefined;
        resolve({ error: true, status: noScanner ? "connect scanner" : "try again" });
      }
    });
  });
};

if (require.main === module) {
  const id = process.argv[2] || `scan_${Date.now()}`;
  const count = process.argv[3] || 1;
  exports.capture(id, count).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.error ? 1 : 0);
  });
}