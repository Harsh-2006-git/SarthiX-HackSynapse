import { sequelize, connectDB } from "./config/database.js";

async function cleanIndexes() {
  try {
    await connectDB();
    console.log("🔍 Fetching indexes for 'clients' table...");

    const [results] = await sequelize.query("SHOW INDEX FROM clients");

    // We want to keep only the PRIMARY and the first instance of unique constraints
    const seen = new Set(['PRIMARY']);
    const toDrop = [];

    results.forEach(idx => {
      const keyName = idx.Key_name;
      // Sequelize often creates names like 'phone', 'phone_2', 'phone_3' etc.
      // Or 'clients_phone_unique'
      if (seen.has(keyName)) {
        // This shouldn't happen with SHOW INDEX as it returns one row per column in a multi-col index
        // But we are looking for redundant separate indexes for the same purpose.
      }

      // Heuristic: If it's a unique index on a column already covered, OR if it's a mangled name
      if (keyName !== 'PRIMARY' && (keyName.includes('_2') || keyName.includes('_3') || keyName.length > 30)) {
        toDrop.push(keyName);
      }
    });

    // More precise approach: identify all unique indexes and keep only one per column
    const columnToIndex = {};
    results.forEach(idx => {
      if (idx.Key_name === 'PRIMARY') return;
      if (!columnToIndex[idx.Column_name]) {
        columnToIndex[idx.Column_name] = idx.Key_name;
      } else {
        toDrop.push(idx.Key_name);
      }
    });

    if (toDrop.length === 0) {
      console.log("✅ No redundant indexes found.");
    } else {
      console.log(`⚠️  Found ${toDrop.length} redundant indexes to drop...`);
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      for (const indexName of [...new Set(toDrop)]) {
        try {
          console.log(`Dropping index: ${indexName}`);
          await sequelize.query(`ALTER TABLE clients DROP INDEX \`${indexName}\``);
        } catch (e) {
          console.log(`Failed to drop ${indexName}: ${e.message}`);
        }
      }
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("✅ Cleanup complete.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

cleanIndexes();
