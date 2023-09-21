const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  verifyAccessToken,
  isTokenBlacklisted,
} = require("./src/utils/jwt_helpers");
require("./src/services/init-mongo-db");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

// Auth Route
const AuthRoute = require("./src/routes/auth/Auth.route");

// -----------------------
// Middleware
// -----------------------
app.use(cors());
// To log all the request to server
app.use(morgan("dev"));
// To attach the public assets folder
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Define a simple route
app.get("/", verifyAccessToken, isTokenBlacklisted, async (req, res, next) => {
  res.send("Welcome to the home page");
});
// Connecting the routes to server
app.use("/auth", AuthRoute);

// To Attach the Formatted Error for missing urls
app.use(async (req, res, next) => {
  next(createError.NotFound());
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
