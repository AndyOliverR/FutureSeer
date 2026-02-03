"use strict";

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const input = path.join(
  root,
  "assets",
  "c__Users_HP_AppData_Roaming_Cursor_User_workspaceStorage_b0278f10875cd81450f44f1f19716c26_images_image-a0869348-2475-4472-8129-a35ed5202a03.png"
);
const outDir = path.join(root, "#Naveen");
const output = path.join(outDir, "vedarasa-label-9x6cm.png");

async function main() {
  try {
    if (!fs.existsSync(input)) {
      throw new Error(`Input image not found: ${input}`);
    }
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(input)
      .resize(1063, 709, { fit: "cover", position: "center" })
      .png()
      .toFile(output);
    console.log("Saved:", output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
