const express = require('express');
const mongoose=require("mongoose");
const router=require("./routes/user");
const {seedAdmin}=require("./utils/seedAdmin");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
.then(async()=>{
  console.log("MongoDB connected");
  await seedAdmin();
});

app.use(express.json());

app.use('/user',router );


app.listen(PORT, () => {
  console.log(`Server started at PORT : ${PORT}`);
});
