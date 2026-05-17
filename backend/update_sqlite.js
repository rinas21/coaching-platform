const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '.tmp', 'data.db');

try {
  const db = new Database(DB_PATH);
  console.log('Connected to SQLite database.');

  // 1. Update site_settings
  db.prepare(`
    UPDATE site_settings
    SET tagline = ?, default_seo_title = ?, default_seo_description = ?
  `).run(
    "Professional coaching platform for business, executive, career, and life transformation.",
    "The Safe Space Global | Professional Coaching Platform",
    "High-end professional coaching for business growth, executive leadership, career advancement, and personal life transformation."
  );
  console.log('Updated site_settings.');

  // 2. Update team_members
  db.prepare(`
    UPDATE team_members
    SET name = ?, credentials = ?, role = ?, bio = ?, specialisations = ?
  `).run(
    "Sarah Thompson, MBA, MCC",
    "Master Certified Coach (MCC), MBA",
    "Executive & Business Coach",
    '[{"type":"paragraph","children":[{"type":"text","text":"Sarah Thompson has over 15 years of experience coaching C-suite executives, entrepreneurs, and professionals. She specializes in leadership development, strategic decision-making, and driving organizational growth through high-impact coaching."}]}]',
    "Executive leadership, business scaling, career transition, and high-performance life coaching."
  );
  console.log('Updated team_members.');

  // 3. Update blog_posts
  db.prepare(`
    UPDATE blog_posts
    SET title = ?, slug = ?, body = ?, categories = ?, tags = ?
  `).run(
    "Strategies for Sustainable Business Growth",
    "strategies-for-sustainable-business-growth",
    '[{"type":"paragraph","children":[{"type":"text","text":"In today\'s fast-paced market, sustainable business growth requires a strategic balance between aggressive innovation and core organizational stability. Executive leadership plays a pivotal role in shaping a resilient culture that adapts to industry shifts while maintaining operational excellence. By focusing on clear career development pathways for talent and robust executive coaching, organizations can unlock untapped potential and drive long-term profitability."}]}]',
    "business coaching",
    "leadership, growth"
  );
  console.log('Updated blog_posts.');

  // 4. Update events
  db.prepare(`
    UPDATE events
    SET title = ?, slug = ?, description = ?, summary = ?
  `).run(
    "Executive Leadership & Business Growth Masterclass",
    "executive-leadership-business-growth-masterclass",
    '[{"type":"paragraph","children":[{"type":"text","text":"An intensive, high-impact masterclass designed for business leaders, executives, and ambitious professionals seeking to scale their organizations and elevate their strategic leadership capabilities."}]}]',
    "Master advanced leadership strategies and business scaling techniques in this professional masterclass."
  );
  console.log('Updated events.');

  // 5. Update item_sales
  db.prepare(`
    UPDATE item_sales
    SET title = ?, slug = ?, description = ?
  `).run(
    "Executive Growth Strategy Planner",
    "executive-growth-strategy-planner",
    "A premium, structured strategic planner designed for executives and business leaders. Includes proven frameworks for goal setting, organizational alignment, career mapping, and quarterly execution tracking."
  );
  console.log('Updated item_sales.');

  // 6. Insert testimonials if empty
  const existingTestimonials = db.prepare('SELECT count(*) as cnt FROM testimonials').get();
  if (existingTestimonials.cnt === 0) {
    const now = new Date().toISOString();
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (document_id, name, date, testimonials, created_at, updated_at, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertTestimonial.run(
      "testim-doc-1",
      "Executive VP, Tech Enterprise",
      "2026-03-15",
      "Working with The Safe Space Global transformed our leadership team. The strategic clarity and executive coaching helped us scale our operations while maintaining alignment.",
      now, now, now
    );

    insertTestimonial.run(
      "testim-doc-2",
      "Founder & CEO, FinTech Scaling",
      "2026-04-10",
      "The business coaching provided unparalleled insights into our market strategy and organizational structure. It has been the most high-return investment for our executive team.",
      now, now, now
    );

    insertTestimonial.run(
      "testim-doc-3",
      "Senior Director, Global Operations",
      "2026-05-02",
      "My career coaching sessions gave me the exact tools and confidence needed to transition into executive leadership. Truly world-class guidance and support.",
      now, now, now
    );
    console.log('Inserted testimonials.');
  } else {
    // If not empty, update them
    db.prepare(`
      UPDATE testimonials
      SET testimonials = 'Working with The Safe Space Global transformed our leadership team. The strategic clarity and executive coaching helped us scale our operations while maintaining alignment.',
          name = 'Executive VP, Tech Enterprise'
      WHERE id = 1
    `).run();
    console.log('Updated existing testimonials.');
  }

  db.close();
  console.log('✅ SQLite database successfully updated with premium coaching content!');
} catch (error) {
  console.error('❌ Error updating SQLite database:', error);
}
