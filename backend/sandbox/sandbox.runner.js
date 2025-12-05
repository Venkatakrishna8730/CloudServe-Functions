import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const executeFunction = (code, context) => {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, "sandbox.worker.js");
    const child = fork(workerPath);

    let isDone = false;

    // Timeout for the entire execution (including VM setup)
    const timeout = setTimeout(() => {
      if (!isDone) {
        child.kill();
        isDone = true;
        resolve({
          success: false,
          error: "Execution timed out",
          logs: [],
        });
      }
    }, 6000); // 6 seconds (slightly more than VM timeout)

    child.on("message", (message) => {
      if (!isDone) {
        clearTimeout(timeout);
        isDone = true;
        resolve(message);
      }
    });

    child.on("error", (error) => {
      if (!isDone) {
        clearTimeout(timeout);
        isDone = true;
        resolve({
          success: false,
          error: `Worker error: ${error.message}`,
          logs: [],
        });
      }
    });

    child.on("exit", (code) => {
      if (!isDone) {
        clearTimeout(timeout);
        isDone = true;
        if (code !== 0) {
          resolve({
            success: false,
            error: `Worker exited with code ${code}`,
            logs: [],
          });
        }
      }
    });

    // Send the code and context to the worker
    child.send({ type: "execute", code, context });
  });
};
