import gatewayService from "./gateway.service.js";

const gatewayController = async (req, res) => {
  const username = req.user.userName;
  const functionName = req.params.functionName;

  const requestContext = {
    body: req.body,
    query: req.query,
    headers: req.headers,
    method: req.method,
  };

  const result = await gatewayService(username, functionName, requestContext);

  res.status(result.status).json(result.data || { message: result.message });
};

export default gatewayController;
