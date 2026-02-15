const mongoose=require("mongoose");
const {seedAdmin}=require("./utils/seedAdmin");

const connectDB = async (MONGO_URL) => {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");
     await seedAdmin();
  };


module.exports = connectDB;