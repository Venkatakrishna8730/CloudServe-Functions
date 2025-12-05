import Log from "../../shared/models/log.model.js";

const getLogs = async (req, res) => {
  try {
    const { functionId } = req.params;
    const logs = await Log.find({ functionId });
    res.json(logs.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearLogs = async (req, res) => {
  try {
    const { functionId } = req.params;
    await Log.deleteMany({ functionId });
    res.json({ message: "Logs cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLog = async (req, res) => {
  try {
    const { functionId, logId } = req.params;
    const log = await Log.findOne({ functionId, _id: logId });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLog = async (req, res) => {
  try {
    const { functionId, logId } = req.params;
    await Log.deleteOne({ functionId, _id: logId });
    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getLog, deleteLog, getLogs, clearLogs };
