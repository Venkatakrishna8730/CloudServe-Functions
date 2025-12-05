import { NodeVM } from "vm2";

process.on("message", async (message) => {
  if (message.type === "execute") {
    const { code, context } = message;
    const logs = [];

    const vm = new NodeVM({
      console: "redirect",
      sandbox: {},
      timeout: 5000, // 5 seconds timeout inside VM
      require: {
        external: true,
        builtin: ["*"],
        root: "./",
      },
      wrapper: "commonjs",
    });

    const formatLog = (args) => {
      return args
        .map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");
    };

    vm.on("console.log", (...args) => {
      logs.push({
        level: "log",
        message: formatLog(args),
      });
    });

    vm.on("console.error", (...args) => {
      logs.push({
        level: "error",
        message: formatLog(args),
      });
    });

    try {
      const userModule = vm.run(code, "userFunc.js");

      let result;
      let userFunc;

      // Check if the user exported a function
      if (typeof userModule === "function") {
        userFunc = userModule;
      } else if (
        typeof userModule === "object" &&
        typeof userModule.default === "function"
      ) {
        userFunc = userModule.default;
      } else if (
        typeof userModule === "object" &&
        typeof userModule.handler === "function"
      ) {
        userFunc = userModule.handler;
      }

      if (userFunc) {
        // Execute the exported function with context
        result = await userFunc(context);
      } else {
        // Treat as a script execution
        // userModule contains the exports. If it's empty, maybe the script just ran.
        // We can return userModule as the result, or null if it's just {}
        if (Object.keys(userModule).length === 0) {
          result = null;
        } else {
          result = userModule;
        }
      }

      const memoryUsage = process.memoryUsage();
      process.send({
        success: true,
        result: result,
        logs: logs,
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
        },
      });
    } catch (error) {
      process.send({
        success: false,
        error: error.message,
        logs: logs,
      });
    } finally {
      process.exit();
    }
  }
});
