const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Role, User } = require('./src/models');
const appRoutes = require("./src/routes/index")

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({
    message: "Web 2 Midterm Authentication Server",
    status: "Running",
    timestamp: new Date().toISOString()
  })
});

app.use("/api", appRoutes);

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Initialize default roles
    await Role.seedRoles();
    console.log("✅ Default roles seeded successfully")

    // Then initialize default users (after roles exist)
    await User.seedUsers();
    console.log("✅ Default test users seeded successfully");

    console.log('📧 Test Users Created:');
    console.log('   👨‍💼 Admin: admin@example.com / admin123');
    console.log('   ✏️ Editor: editor@example.com / editor123');
    console.log('   👁️ Viewer: viewer@example.com / viewer123');

    app.listen(PORT, () => {
      console.log(`🚀 Web 2 Midterm Server is running on port ${PORT}`);
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log('\n🧪 Ready for testing with pre-created accounts!');
    })
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer()