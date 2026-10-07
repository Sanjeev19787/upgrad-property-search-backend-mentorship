const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    minBudget: {
      type: Number,
      min: 0,
      default: 0
    },
    maxBudget: {
      type: Number,
      min: 0,
      default: null
    },
    propertyTypes: {
      type: [String],
      default: []
    },
    interiors: {
      type: [String],
      default: []
    },
    preferredLocations: {
      type: [String],
      default: []
    },
    minBedrooms: {
      type: Number,
      min: 0,
      default: 0
    },
    amenities: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preference", preferenceSchema);
