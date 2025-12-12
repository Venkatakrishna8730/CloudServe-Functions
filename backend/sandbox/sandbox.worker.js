import { NodeVM } from "vm2";
import path from "path";
import fs from "fs";

process.on("message", async (message) => {
  if (message.type === "execute") {
    const { context, root } = message;
    const logs = [];

    const vm = new NodeVM({
      console: "redirect",
      sandbox: {},
      timeout: 5000,
      require: {
        external: true,
        builtin: ["*"],
        root,
      },
      wrapper: "commonjs",
    });

    // Log capture
    const formatLog = (args) =>
      args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(" ");

    vm.on("console.log", (...args) =>
      logs.push({ level: "log", message: formatLog(args) })
    );

    vm.on("console.error", (...args) =>
      logs.push({ level: "error", message: formatLog(args) })
    );

    try {
      const filePath = path.join(root, "index.js");

      // Load bundled file through runFile() → THIS ENABLES require("axios")
      const userModule = vm.runFile(filePath);

      let userFunc;

      if (typeof userModule === "function") userFunc = userModule;
      else if (userModule?.default) userFunc = userModule.default;
      else if (userModule?.handler) userFunc = userModule.handler;

      let result;
      if (userFunc) result = await userFunc(context);
      else result = userModule;

      // Serialize result safely
      const safe = (x) => JSON.parse(JSON.stringify(x));

      process.send({
        success: true,
        result: safe(result),
        logs,
        memoryUsage: safe(process.memoryUsage()),
      });
    } catch (err) {
      process.send({
        success: false,
        error: err.message,
        logs,
      });
    } finally {
      process.exit();
    }
  }
});
