const Preference = require("../models/Preference");

const upsertPreferences = async (req, res, next) => {
  try {
    const {
      minBudget, maxBudget, propertyTypes, interiors,
      preferredLocations, minBedrooms, amenities
    } = req.body;

    if (maxBudget !== undefined && maxBudget !== null &&
        minBudget !== undefined && Number(maxBudget) < Number(minBudget)) {
      return res.status(400).json({
        success: false,
        message: "maxBudget must be greater than or equal to minBudget."
      });
    }

    const preference = await Preference.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          ...(minBudget !== undefined && { minBudget: Number(minBudget) }),
          ...(maxBudget !== undefined && { maxBudget: maxBudget === null ? null : Number(maxBudget) }),
          ...(propertyTypes !== undefined && { propertyTypes }),
          ...(interiors !== undefined && { interiors }),
          ...(preferredLocations !== undefined && { preferredLocations }),
          ...(minBedrooms !== undefined && { minBedrooms: Number(minBedrooms) }),
          ...(amenities !== undefined && { amenities })
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: "Preferences saved.", data: preference });
  } catch (error) {
    next(error);
  }
};

const getPreferences = async (req, res, next) => {
  try {
    const preference = await Preference.findOne({ user: req.user._id });

    res.json({
      success: true,
      data: preference || null
    });
  } catch (error) {
    next(error);
  }
};

const deletePreferences = async (req, res, next) => {
  try {
    await Preference.findOneAndDelete({ user: req.user._id });

    res.json({ success: true, message: "Preferences deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertPreferences,
  getPreferences,
  deletePreferences
};
