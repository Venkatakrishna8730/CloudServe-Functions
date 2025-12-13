import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createFunction } from "../store/slices/functionsSlice";
import { AlertCircle, ArrowLeft, Save, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

const JS_TEMPLATE = `module.exports = async (event) => {
  // Your function logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from CloudServe Functions!" }),
  };
};`;

const TS_TEMPLATE = `interface Event {
  body: any;
  query: Record<string, string>;
}

interface Response {
  statusCode: number;
  body: string;
}

export const handler = async (event: Event): Promise<Response> => {
  // Your function logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from CloudServe Functions!" }),
  };
};`;

const CreateFunctionPage = () => {
  const [name, setName] = useState("");
  const { theme } = useTheme();
  const [code, setCode] = useState(JS_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [language, setLanguage] = useState("javascript");

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (newLanguage === "typescript" && code.trim() === JS_TEMPLATE.trim()) {
      setCode(TS_TEMPLATE);
    } else if (
      newLanguage === "javascript" &&
      code.trim() === TS_TEMPLATE.trim()
    ) {
      setCode(JS_TEMPLATE);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Please provide both a name and source code.");
      return;
    }

    setLoading(true);

    try {
      const filename = language === "typescript" ? "index.ts" : "index.js";
      const resultAction = await dispatch(
        createFunction({ name, code, filename })
      );
      if (createFunction.fulfilled.match(resultAction)) {
        navigate("/functions");
        toast.success("Deployment started. Check status in list.");
      } else {
        toast.error(
          resultAction.payload?.message || "Failed to create function"
        );
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".js") && !file.name.endsWith(".ts")) {
      toast.error("Please upload a JavaScript (.js) or TypeScript (.ts) file.");
      return;
    }

    if (file.name.endsWith(".ts")) {
      setLanguage("typescript");
    } else {
      setLanguage("javascript");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <Link
        to="/functions"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors shrink-0"
      >
        <ArrowLeft size={20} />
        Back to Functions
      </Link>

      <div className="flex-1 bg-card rounded-2xl border border-border-light shadow-lg overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <h1 className="text-xl font-bold">Create New Function</h1>
          <div className="flex flex-row items-center gap-3 w-full md:w-auto">
            <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border-light text-text-primary font-medium rounded-lg hover:bg-background-hover hover:border-text-secondary transition-colors cursor-pointer whitespace-nowrap">
              <Upload size={18} />
              Upload Code
              <input
                type="file"
                accept=".js,.ts"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Save size={18} />
              {loading ? "Deploying..." : "Deploy"}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="w-full lg:w-80 p-6 border-b lg:border-b-0 lg:border-r border-border-light bg-background overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Function Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border border-border-light rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="my-function"
                  required
                />
                <p className="mt-2 text-xs text-text-muted">
                  Use lowercase letters, numbers, and hyphens only.
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-bold text-primary mb-2 text-sm">
                  Quick Tips
                </h3>
                <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4">
                  <li>Function exports an async handler.</li>
                  <li>Return a standard HTTP response object.</li>
                  <li>
                    Access request body via <code>event.body</code>.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[400px]">
            <div className="px-4 py-2 bg-background border-b border-border-light text-xs font-mono text-text-secondary flex items-center justify-between">
              <span>{language === "typescript" ? "index.ts" : "index.js"}</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-card border border-border-light rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "JetBrains Mono",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFunctionPage;
