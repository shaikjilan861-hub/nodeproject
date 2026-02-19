const bcrypt = require("bcrypt");
const User = require("../models/userSchema");

const seedAdmin = async (req, res) => {
  try {
    const adminExist = await User.findOne({ email: "admin@gmail.com" });

    if (!adminExist) {
      // define default password here
      const defaultPassword = "admin123";

      // Hash password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const newAdmin = await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin created successfully", newAdmin);
    } else {
      console.log("Admin already exist");
    }

  } catch (error) {
    console.error("Error while seeding admin:", error.message);
  }
};

module.exports = { seedAdmin };
