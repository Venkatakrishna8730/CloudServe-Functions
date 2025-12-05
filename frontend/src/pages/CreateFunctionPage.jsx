import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createFunction } from "../store/slices/functionsSlice";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import Editor from "@monaco-editor/react";

const CreateFunctionPage = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState(`module.exports = async (event) => {
  // Your function logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from FaaS!" }),
  };
};`);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      setError("Please provide both a name and source code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resultAction = await dispatch(createFunction({ name, code }));
      if (createFunction.fulfilled.match(resultAction)) {
        navigate("/functions");
      } else {
        setError(resultAction.payload?.message || "Failed to create function");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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
        <div className="p-6 border-b border-border-light flex items-center justify-between bg-background">
          <h1 className="text-xl font-bold">Create New Function</h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {loading ? "Deploying..." : "Deploy Function"}
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error shrink-0">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Settings Sidebar */}
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

          {/* Editor Area */}
          <div className="flex-1 flex flex-col min-h-[400px]">
            <div className="px-4 py-2 bg-background border-b border-border-light text-xs font-mono text-text-secondary">
              index.js
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
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
