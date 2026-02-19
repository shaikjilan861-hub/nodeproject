require("dotenv").config();
const express = require('express');
const connectDB=require("./connection");

const helmet = require("helmet");

const errorHandler=require("./middlewares/errorHandler");

const { swaggerUi, specs } = require("../src/docs/swagger");

const morgan = require("morgan");



const app = express();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

connectDB(MONGO_URL);

app.use(express.json());
app.use(errorHandler);
app.use(helmet());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use("/api", swaggerUi.serve, swaggerUi.setup(specs));

app.use('/',require("./routes/user") );
app.use('/user',require("./routes/collection") );

app.listen(PORT, () => {
  console.log(`Server started at PORT : ${PORT}`);
});
