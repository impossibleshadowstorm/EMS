const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

EmployeeSchema.pre("save", async function (next) {
  try {
    console.log("Called before saving a user to db");
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(this.password, salt);

    this.password = hashedPass;
    next();
  } catch (error) {
    next(error);
  }
});

EmployeeSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    next(error);
  }
};

const Employee = mongoose.model("employee", EmployeeSchema);
module.exports = Employee;
