const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const KYCSchema = new mongoose.Schema(
    {
      profileId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
      },
      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
      aadhaarFileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: false,
      },
      panFileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: false,
      },
      
    },
    { timestamps: true }
  );
  
  const KYC = mongoose.model("KYC", KYCSchema);
  module.exports = KYC;