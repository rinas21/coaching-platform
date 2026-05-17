const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '.tmp', 'data.db');
const UPLOADS_PATH = path.join(__dirname, 'public', 'uploads');
const ARTIFACT_DIR = '/home/rinas/.gemini/antigravity/brain/bc074419-7c70-4f7c-8fb9-39c796c30008';

const teamPhotos = [
  { id: 2, image: 'team_jane_smith_photo_1775908163269.png', name: 'jane-smith.png', hash: 'team_jane_smith' },
  { id: 3, image: 'team_alan_watts_photo_1775908184536.png', name: 'alan-watts.png', hash: 'team_alan_watts' },
  // For Sarah, use an existing image in uploads
  { id: 4, existingFile: 'anna_hliamshyna_VDR_u_VIHP_8_unsplash_769509fd5e.jpg', field: 'photo' }
];

try {
  const db = new Database(DB_PATH);
  console.log('Connected to database.');

  // 1. Cleanup: Remove duplicate team members
  console.log('Cleaning up duplicate entries...');
  db.prepare('DELETE FROM team_members WHERE id = 1').run();

  // 2. Helper to link image
  const linkImage = (fileId, relatedId, type, field) => {
    const insertMorph = db.prepare(`
      INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
      VALUES (?, ?, ?, ?, 1)
    `);
    insertMorph.run(fileId, relatedId, type, field);
  };

  // 3. Process Team Photos
  for (const p of teamPhotos) {
    let fileId;
    if (p.image) {
      const srcPath = path.join(ARTIFACT_DIR, p.image);
      const destName = `${p.hash}.png`;
      const destPath = path.join(UPLOADS_PATH, destName);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        const stats = fs.statSync(destPath);
        const size = (stats.size / 1024).toFixed(2);
        const info = db.prepare(`
          INSERT INTO files (name, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(p.name, p.hash, '.png', 'image/png', size, `/uploads/${destName}`, 'local');
        fileId = info.lastInsertRowid;
      }
    } else if (p.existingFile) {
      const row = db.prepare('SELECT id FROM files WHERE url LIKE ?').get(`%${p.existingFile}%`);
      if (row) fileId = row.id;
    }

    if (fileId) {
      linkImage(fileId, p.id, 'api::team-member.team-member', 'photo');
      console.log(`Linked photo to Team ID ${p.id}`);
    }
  }

  db.close();
  console.log('✅ Successfully updated content and seeded team images!');
} catch (error) {
  console.error('❌ Error during seeding:', error);
}
