import axios from "axios";

const SANDBOX_URL = process.env.SANDBOX_URL || "http://localhost:5002";

export const executeFunction = async (code, context = {}, depHash = null) => {
  try {
    const response = await axios.post(`${SANDBOX_URL}/execute`, {
      code,
      context,
      depHash,
    });
    return response.data;
  } catch (error) {
    console.error("Sandbox execution failed:", error.message);
    return {
      success: false,
      error: `Sandbox execution failed: ${error.message}`,
      logs: [],
    };
  }
};
