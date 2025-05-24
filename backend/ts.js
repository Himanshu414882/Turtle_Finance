const mongoose = require("mongoose");
const Client = require("./models/client"); // Adjust the path
const Advisor = require("./models/advisor"); // Adjust the path

async function dropPhoneIndex() {
  await mongoose.connect(""); // Change to your actual DB URI
  await Advisor.collection.dropIndex("phone_1");
  console.log("Dropped 'phone_1' index");
  process.exit();
}

dropPhoneIndex();
