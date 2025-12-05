import Usage from "../../shared/models/usage.model.js";

const getUsages = async (req, res) => {
  try {
    const { functionId } = req.params;
    const userId = req.user._id;
    const usages = await Usage.find({ functionId, userId });
    res.json(usages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearUsages = async (req, res) => {
  try {
    const { functionId } = req.params;
    const userId = req.user._id;
    await Usage.deleteMany({ functionId, userId });
    res.json({ message: "Usages cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsage = async (req, res) => {
  try {
    const { functionId, usageId } = req.params;
    const userId = req.user._id;
    const usage = await Usage.findOne({ functionId, userId, _id: usageId });
    res.json(usage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUsage = async (req, res) => {
  try {
    const { functionId, usageId } = req.params;
    const userId = req.user._id;
    await Usage.deleteOne({ functionId, userId, _id: usageId });
    res.json({ message: "Usage deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsages = async (req, res) => {
  try {
    const userId = req.user._id;
    const usages = await Usage.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate("functionId", "name");
    res.json(usages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getUsage, deleteUsage, getUsages, clearUsages, getAllUsages };
