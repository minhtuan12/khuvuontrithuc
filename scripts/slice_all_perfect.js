import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputImagePath = 'public/assets/aistudio/051b4db4-2617-43ec-8dc2-fe6459cf7756_616cbc15.png';
const outDir = 'public/assets/preschool';

async function run() {
  // Top Banner (Hero scene with 2 waving kids, logo, title, greeting bubble, school)
  await sharp(inputImagePath)
    .extract({ left: 0, top: 0, width: 1536, height: 366 })
    .toFile(path.join(outDir, 'hero_banner.png'));

  // Row 1: The 5 Cards (Height is 292, Top is 367)
  // 1. Nhận thức: left: 45, width: 281
  await sharp(inputImagePath)
    .extract({ left: 45, top: 367, width: 281, height: 292 })
    .toFile(path.join(outDir, 'card_cognitive.png'));

  // 2. Ngôn ngữ: left: 348, width: 281
  await sharp(inputImagePath)
    .extract({ left: 348, top: 367, width: 281, height: 292 })
    .toFile(path.join(outDir, 'card_language.png'));

  // 3. Thẩm mỹ: left: 651, width: 281
  await sharp(inputImagePath)
    .extract({ left: 651, top: 367, width: 281, height: 292 })
    .toFile(path.join(outDir, 'card_aesthetic.png'));

  // 4. Thể chất: left: 954, width: 281
  await sharp(inputImagePath)
    .extract({ left: 954, top: 367, width: 281, height: 292 })
    .toFile(path.join(outDir, 'card_physical.png'));

  // 5. Tình cảm - KNXH: left: 1208, width: 281
  await sharp(inputImagePath)
    .extract({ left: 1208, top: 367, width: 281, height: 292 })
    .toFile(path.join(outDir, 'card_social.png'));

  // Row 2: The 4 Feature Cards (Height is 214, Top is 678)
  // Card 1: Tiếng Anh mầm non (left: 45, width: 351)
  await sharp(inputImagePath)
    .extract({ left: 45, top: 678, width: 351, height: 214 })
    .toFile(path.join(outDir, 'feature_english.png'));

  // Card 2: Hoạt động hàng ngày (left: 418, width: 351)
  await sharp(inputImagePath)
    .extract({ left: 418, top: 678, width: 351, height: 214 })
    .toFile(path.join(outDir, 'feature_daily.png'));

  // Card 3: Thư viện của bé (left: 791, width: 351)
  await sharp(inputImagePath)
    .extract({ left: 791, top: 678, width: 351, height: 214 })
    .toFile(path.join(outDir, 'feature_library.png'));

  // Card 4: Thông tin & Kế hoạch (left: 1140, width: 351)
  await sharp(inputImagePath)
    .extract({ left: 1140, top: 678, width: 351, height: 214 })
    .toFile(path.join(outDir, 'feature_teacher.png'));

  // Bottom Sun & Rainbow peek on bottom right (left: 1370, top: 830, width: 160, height: 160)
  await sharp(inputImagePath)
    .extract({ left: 1370, top: 830, width: 160, height: 160 })
    .toFile(path.join(outDir, 'smiling_sun_rainbow.png'));

  console.log('All 5 category cards and 4 feature cards cropped with pixel precision!');
}

run().catch(console.error);
