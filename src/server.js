const express = require('express');
const connectDB=require("./connection");
const router=require("./routes/user");
const helmet = require("helmet");

const { swaggerUi, specs } = require("./src/docs/swagger");

require("dotenv").config();

const app = express();



const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

connectDB(MONGO_URL);


app.use(express.json());



app.use(helmet());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use('/user',router );


app.listen(PORT, () => {
  console.log(`Server started at PORT : ${PORT}`);
});
