const mongoose = require("mongoose");

const dbURI = process.env.MONGODB_URI;

// Connect to MongoDB using Mongoose
mongoose
  .connect(dbURI, {
    dbName: "ems",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:");
    console.error(err);
  });

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB..!");
});

mongoose.connection.on("error", (err) => {
  console.log(`Mongoose Error on connecting to DB due to ${err.message}..!`);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection is disconnected..!");
});

// While we press ctrl+c to stop the running server
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
