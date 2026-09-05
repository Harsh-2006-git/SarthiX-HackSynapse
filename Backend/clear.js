import { sequelize } from "./config/database.js";
import Zone from "./models/zone.js";
import ZoneTracker from "./models/zoneTracker.js";

const clearTables = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // Clear history
    await ZoneTracker.destroy({ where: {} });
    console.log("🗑️ History cleared.");

    // Reset counts
    await Zone.update({ client_count: 0 }, { where: {} });
    console.log("✅ Pilgrim counts reset.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting rows:", error);
    process.exit(1);
  }
};

clearTables();
