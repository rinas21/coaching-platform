const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '.tmp', 'data.db');
const UPLOADS_PATH = path.join(__dirname, 'public', 'uploads');
const ARTIFACT_DIR = '/home/rinas/.gemini/antigravity/brain/bc074419-7c70-4f7c-8fb9-39c796c30008';

const images = [
  {
    id: 3,
    title: 'Self-Care Toolkit (PDF bundle)',
    imagePath: 'self_care_toolkit_cover_1775907088139.png',
    name: 'self-care-toolkit-cover.png',
    hash: 'self_care_toolkit_cover_1775907088139',
  },
  {
    id: 4,
    title: '1-on-1 Priority Consultation',
    imagePath: 'priority_consultation_cover_1775907105806.png',
    name: 'priority-consultation-cover.png',
    hash: 'priority_consultation_cover_1775907105806',
  },
  {
    id: 5,
    title: 'Mindfulness Audio Series',
    imagePath: 'mindfulness_audio_series_cover_1775907150091.png',
    name: 'mindfulness-audio-series-cover.png',
    hash: 'mindfulness_audio_series_cover_1775907150091',
  },
  {
    id: 6,
    title: 'Corporate Wellness Strategy Guide',
    imagePath: 'corporate_wellness_guide_cover_1775907233952.png',
    name: 'corporate-wellness-guide-cover.png',
    hash: 'corporate_wellness_guide_cover_1775907233952',
  }
];

try {
  const db = new Database(DB_PATH);
  console.log('Connected to Strapi database.');

  for (const img of images) {
    const srcPath = path.join(ARTIFACT_DIR, img.imagePath);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Source image not found: ${srcPath}`);
      continue;
    }

    const destName = `${img.hash}.png`;
    const destPath = path.join(UPLOADS_PATH, destName);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${img.name} to uploads.`);

    const stats = fs.statSync(destPath);
    const size = (stats.size / 1024).toFixed(2);

    // Insert into files
    const insertFile = db.prepare(`
      INSERT INTO files (name, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const info = insertFile.run(img.name, img.hash, '.png', 'image/png', size, `/uploads/${destName}`, 'local');
    const fileId = info.lastInsertRowid;

    // Link to item_sales (cover)
    const insertMorph = db.prepare(`
      INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
      VALUES (?, ?, ?, ?, ?)
    `);
    insertMorph.run(fileId, img.id, 'api::item-sale.item-sale', 'cover', 1);
    
    // Also link to item_sales (gallery) - adding the same image as first gallery item
    insertMorph.run(fileId, img.id, 'api::item-sale.item-sale', 'gallery', 1);

    console.log(`Linked ${img.name} to Item ID ${img.id}`);
  }

  db.close();
  console.log('✅ Successfully seeded store images!');
} catch (error) {
  console.error('❌ Failed to seed images:', error);
}
