import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputImagePath = 'public/assets/aistudio/051b4db4-2617-43ec-8dc2-fe6459cf7756_616cbc15.png';
const outDir = 'public/assets/preschool';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const metadata = await sharp(inputImagePath).metadata();
  console.log('Image dimensions:', metadata.width, metadata.height);

  // 1. Top Scene Banner: From Y: 0 to Y: 375, Full Width
  await sharp(inputImagePath)
    .extract({ left: 0, top: 0, width: 1536, height: 375 })
    .toFile(path.join(outDir, 'hero_scene.png'));
  console.log('Saved hero_scene.png');

  // 2. The 5 Main Category Cards (full cards with their 3D kids and buttons):
  // Let's extract each of the 5 cards:
  // Card 1: Nhan thuc (X: 45, width: 282, top: 370, height: 295)
  await sharp(inputImagePath)
    .extract({ left: 45, top: 370, width: 282, height: 295 })
    .toFile(path.join(outDir, 'card_cognitive.png'));

  // Card 2: Ngon ngu (X: 350, width: 282, top: 370, height: 295)
  await sharp(inputImagePath)
    .extract({ left: 350, top: 370, width: 282, height: 295 })
    .toFile(path.join(outDir, 'card_language.png'));

  // Card 3: Tham my (X: 654, width: 282, top: 370, height: 295)
  await sharp(inputImagePath)
    .extract({ left: 654, top: 370, width: 282, height: 295 })
    .toFile(path.join(outDir, 'card_aesthetic.png'));

  // Card 4: The chat (X: 958, width: 282, top: 370, height: 295)
  await sharp(inputImagePath)
    .extract({ left: 958, top: 370, width: 282, height: 295 })
    .toFile(path.join(outDir, 'card_physical.png'));

  // Card 5: Tinh cam - KNXH (X: 1262, width: 282, top: 370, height: 295)
  await sharp(inputImagePath)
    .extract({ left: 1262, top: 370, width: 230, height: 295 })
    .toFile(path.join(outDir, 'card_social.png'));

  // 3. The 4 Feature Cards (Row 2):
  // Feature 1: Tieng Anh mam non (X: 45, width: 350, top: 680, height: 220)
  await sharp(inputImagePath)
    .extract({ left: 45, top: 680, width: 350, height: 220 })
    .toFile(path.join(outDir, 'feature_english.png'));

  // Feature 2: Hoat dong hang ngay (X: 418, width: 350, top: 680, height: 220)
  await sharp(inputImagePath)
    .extract({ left: 418, top: 680, width: 350, height: 220 })
    .toFile(path.join(outDir, 'feature_daily.png'));

  // Feature 3: Thu vien cua be (X: 792, width: 350, top: 680, height: 220)
  await sharp(inputImagePath)
    .extract({ left: 792, top: 680, width: 350, height: 220 })
    .toFile(path.join(outDir, 'feature_library.png'));

  // Feature 4: Thong tin & Ke hoach (X: 1165, width: 326, top: 680, height: 220)
  await sharp(inputImagePath)
    .extract({ left: 1165, top: 680, width: 326, height: 220 })
    .toFile(path.join(outDir, 'feature_teacher.png'));

  // 4. Mascot / Kid Avatars & Bottom Sun:
  // Sun: (X: 1370, Y: 860, width: 140, height: 140)
  await sharp(inputImagePath)
    .extract({ left: 1370, top: 860, width: 140, height: 140 })
    .toFile(path.join(outDir, 'smiling_sun.png'));

  console.log('All slices generated successfully!');
}

run().catch(console.error);
