const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    propertyType: {
      type: String,
      enum: ["Apartment", "Villa", "House", "Plot", "Commercial"],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    location: {
      city: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true }
    },
    bedrooms: {
      type: Number,
      min: 0,
      required: true
    },
    bathrooms: {
      type: Number,
      min: 0,
      required: true
    },
    areaSqFt: {
      type: Number,
      min: 0,
      required: true
    },
    interior: {
      type: String,
      enum: ["Unfurnished", "Semi-Furnished", "Furnished"],
      required: true
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

propertySchema.index({ price: 1 });
propertySchema.index({ "location.city": 1 });
propertySchema.index({ interior: 1 });
propertySchema.index({ bedrooms: 1 });

module.exports = mongoose.model("Property", propertySchema);
