const fs = require("fs");
const path = require("path");
const Property = require("../models/Property");

const normalizeArray = (value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((v) => v.trim()).filter(Boolean);
};

const createProperty = async (req, res, next) => {
  try {
    const {
      title, description, propertyType, price, location,
      bedrooms, bathrooms, areaSqFt, interior, amenities
    } = req.body;

    if (!title || !description || !propertyType || price === undefined ||
        !location?.city || !location?.area || bedrooms === undefined ||
        bathrooms === undefined || areaSqFt === undefined || !interior) {
      return res.status(400).json({
        success: false,
        message: "All required property fields must be provided."
      });
    }

    const property = await Property.create({
      title,
      description,
      propertyType,
      price: Number(price),
      location,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      areaSqFt: Number(areaSqFt),
      interior,
      amenities: normalizeArray(amenities) || [],
      owner: req.user._id
    });

    res.status(201).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

const getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    next(error);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "name email");

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own property."
      });
    }

    const allowed = [
      "title", "description", "propertyType", "price", "location",
      "bedrooms", "bathrooms", "areaSqFt", "interior", "amenities"
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = field === "amenities"
          ? normalizeArray(req.body[field])
          : req.body[field];
      }
    });

    await property.save();
    res.json({ success: true, message: "Property updated.", data: property });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own property."
      });
    }

    const files = property.images || [];
    for (const imageUrl of files) {
      const filename = imageUrl.split("/").pop();
      const filePath = path.join(__dirname, "..", "uploads", filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await property.deleteOne();

    res.json({ success: true, message: "Property deleted." });
  } catch (error) {
    next(error);
  }
};

const uploadImages = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can upload images only to your own property."
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required."
      });
    }

    const urls = req.files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    property.images.push(...urls);
    await property.save();

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully.",
      images: property.images
    });
  } catch (error) {
    next(error);
  }
};

const searchProperties = async (req, res, next) => {
  try {
    const {
      minBudget,
      maxBudget,
      interior,
      propertyType,
      location,
      minBedrooms,
      amenities,
      sortBy = "relevance"
    } = req.query;

    const filter = {};

    if (minBudget !== undefined) filter.price = { ...(filter.price || {}), $gte: Number(minBudget) };
    if (maxBudget !== undefined) filter.price = { ...(filter.price || {}), $lte: Number(maxBudget) };
    if (minBedrooms !== undefined) filter.bedrooms = { $gte: Number(minBedrooms) };

    if (interior) {
      const interiors = String(interior).split(",").map((v) => v.trim());
      filter.interior = { $in: interiors };
    }

    if (propertyType) {
      const types = String(propertyType).split(",").map((v) => v.trim());
      filter.propertyType = { $in: types };
    }

    if (location) {
      filter.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.area": { $regex: location, $options: "i" } }
      ];
    }

    if (amenities) {
      const requestedAmenities = String(amenities)
        .split(",").map((v) => v.trim()).filter(Boolean);
      filter.amenities = { $all: requestedAmenities };
    }

    let sort = { createdAt: -1 };
    if (sortBy === "price_asc") sort = { price: 1 };
    if (sortBy === "price_desc") sort = { price: -1 };
    if (sortBy === "bedrooms_desc") sort = { bedrooms: -1 };

    const properties = await Property.find(filter)
      .populate("owner", "name email")
      .sort(sort);

    // Relevance score: budget fit + interior/type/location/bedroom matches.
    const requestedInteriors = interior
      ? String(interior).split(",").map((v) => v.trim().toLowerCase())
      : [];
    const requestedTypes = propertyType
      ? String(propertyType).split(",").map((v) => v.trim().toLowerCase())
      : [];

    const scored = properties.map((p) => {
      let score = 0;

      if (maxBudget && p.price <= Number(maxBudget)) score += 3;
      if (minBudget && p.price >= Number(minBudget)) score += 1;
      if (requestedInteriors.includes(p.interior.toLowerCase())) score += 4;
      if (requestedTypes.includes(p.propertyType.toLowerCase())) score += 2;
      if (location) {
        const text = `${p.location.city} ${p.location.area}`.toLowerCase();
        if (text.includes(String(location).toLowerCase())) score += 3;
      }
      if (minBedrooms && p.bedrooms >= Number(minBedrooms)) score += 2;

      return { ...p.toObject(), relevanceScore: score };
    });

    if (sortBy === "relevance") {
      scored.sort((a, b) => b.relevanceScore - a.relevanceScore || a.price - b.price);
    }

    res.json({
      success: true,
      count: scored.length,
      filters: req.query,
      data: scored
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  uploadImages,
  searchProperties
};
