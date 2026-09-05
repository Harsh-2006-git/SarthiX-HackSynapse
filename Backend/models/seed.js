// models/seed.js
import { connectDB } from "../config/database.js";
import Zone from "./zone.js";


// 🔹 random vertices generator
const generateVertices = (cx, cy, count = 6) => {
  return Array.from({ length: count }, () => ({
    x: cx + Math.floor(Math.random() * 10 - 5),
    y: cy + Math.floor(Math.random() * 10 - 5),
  }));
};

const zonesData = [
  { name: "Mahakaleshwar Mandir", display_id: 1, location_info: "23.1740° N, 75.7901° E", x: 45, y: 50 },
  { name: "Ram Ghat", display_id: 2, location_info: "23.1748° N, 75.7950° E", x: 55, y: 45 },
  { name: "Kshipra Bridge", display_id: 3, location_info: "23.1765° N, 75.7970° E", x: 65, y: 40 },
  { name: "Harsiddhi Mandir", display_id: 4, location_info: "23.1772° N, 75.7905° E", x: 35, y: 55 },
  { name: "Bada Ganesh Mandir", display_id: 5, location_info: "23.1755° N, 75.7885° E", x: 40, y: 40 },
  { name: "Kal Bhairav Mandir", display_id: 6, location_info: "23.1730° N, 75.7880° E", x: 50, y: 65 },
];

export const seedZones = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    for (const zone of zonesData) {
      await Zone.upsert({
        ...zone,
        vertices: JSON.stringify(generateVertices(zone.x, zone.y)),
      });
    }

    console.log("✅ Zones seeded successfully");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
};

(async () => {
  await connectDB();
  await seedZones();
  process.exit(0);
})();

export default seedZones;
