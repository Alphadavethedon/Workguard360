const createDemoAdmin = async () => {
  // your existing logic to check and create admin user
};

if (require.main === module) {
  // Called directly with: `node scripts/seedDemoAdmin.js`
  createDemoAdmin().then(() => {
    console.log("✅ Seeding complete");
    process.exit(0);
  }).catch(err => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
} else {
  // Imported into server.js, just run the function without exiting
  createDemoAdmin();
}
