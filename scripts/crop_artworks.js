import sharp from 'sharp';
import path from 'path';

const inputImagePath = 'public/assets/aistudio/051b4db4-2617-43ec-8dc2-fe6459cf7756_616cbc15.png';
const outDir = 'public/assets/preschool';

async function cropArtworks() {
  await sharp(inputImagePath)
    .extract({ left: 45, top: 372, width: 281, height: 188 })
    .toFile(path.join(outDir, 'art_cognitive.png'));

  await sharp(inputImagePath)
    .extract({ left: 348, top: 372, width: 281, height: 188 })
    .toFile(path.join(outDir, 'art_language.png'));

  await sharp(inputImagePath)
    .extract({ left: 651, top: 372, width: 281, height: 188 })
    .toFile(path.join(outDir, 'art_aesthetic.png'));

  await sharp(inputImagePath)
    .extract({ left: 954, top: 372, width: 281, height: 188 })
    .toFile(path.join(outDir, 'art_physical.png'));

  await sharp(inputImagePath)
    .extract({ left: 1208, top: 372, width: 281, height: 188 })
    .toFile(path.join(outDir, 'art_social.png'));

  // Feature cards pure 3D artwork (strictly no text):
  await sharp(inputImagePath)
    .extract({ left: 48, top: 768, width: 345, height: 120 })
    .toFile(path.join(outDir, 'art_english.png'));

  await sharp(inputImagePath)
    .extract({ left: 421, top: 768, width: 345, height: 120 })
    .toFile(path.join(outDir, 'art_daily.png'));

  await sharp(inputImagePath)
    .extract({ left: 794, top: 768, width: 345, height: 120 })
    .toFile(path.join(outDir, 'art_library.png'));

  await sharp(inputImagePath)
    .extract({ left: 1143, top: 768, width: 345, height: 120 })
    .toFile(path.join(outDir, 'art_teacher.png'));

  console.log('Clean text-free 3D artworks cropped successfully!');
}

cropArtworks().catch(console.error);
