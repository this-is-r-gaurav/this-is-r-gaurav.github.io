import sharp from "sharp";
import pngToIco from "png-to-ico";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const inputPath = path.join(__dirname, "../public/og-character.png");

  // Standard 32x32 Favicon for browser tabs
  const faviconPath = path.join(__dirname, "../public/favicon.png");

  // High-res Apple Touch Icon for iOS/Mac home screens 
  const appleTouchIconPath = path.join(__dirname, "../public/apple-touch-icon.png");

  // Legacy .ico format
  const icoPath = path.join(__dirname, "../public/favicon.ico");

  if (!fs.existsSync(inputPath)) {
    console.error("❌ og-character.png not Skipping. Skipping Generation.");
    process.exit(0);
  }

  console.log("--- Generating Favicons from Character ---");

  try {
    // Generate standard 32x32 favicon (transparent background)
    await sharp(inputPath)
      .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(faviconPath);
    console.log(`✅ Created favicon.png (32x32) at ${faviconPath}`);

    // Generate legacy .ico from the newly created 32x32 png
    const icoBuffer = await pngToIco(faviconPath);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log(`✅ Created favicon.ico (legacy) at ${icoPath}`);

    // Generate Apple Touch Icon 180x180 (needs solid background for iOS, matching your theme color #111418)
    await sharp(inputPath)
      .resize(180, 180, { fit: "contain", background: { r: 17, g: 20, b: 24, alpha: 1 } })
      .toFile(appleTouchIconPath);
    console.log(`✅ Created apple-touch-icon.png (180x180) at ${appleTouchIconPath}`);

  } catch (error) {
    console.error("!!! Favicon generation failed:", error);
    process.exit(1);
  }

  console.log("--- Done ---");
}

main();
