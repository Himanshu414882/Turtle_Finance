const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const FileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client"
  }
}, { timestamps: true });

const File = mongoose.model("File", FileSchema);
module.exports = File;