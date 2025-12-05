import generateApiKey from "../../shared/utils/apikey.util.js";

const getApiKeyController = async (req, res) => {
  try {
    const apiKey = req.user.apiKey;
    res.json({ apiKey });
  } catch (error) {
    console.error("Get API Key error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const regenerateApiKeyController = async (req, res) => {
  try {
    const newApiKey = generateApiKey();

    req.user.apiKey = newApiKey;
    await req.user.save();

    res.json({ apiKey: newApiKey });
  } catch (error) {
    console.error("Get API Key error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getApiKeyController, regenerateApiKeyController };
