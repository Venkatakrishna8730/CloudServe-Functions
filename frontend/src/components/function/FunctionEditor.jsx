import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { Save, Play, AlertCircle, CheckCircle } from "lucide-react";
import { updateFunction } from "../../store/slices/functionsSlice";
import api, { ROUTES } from "../../utils/api";

const FunctionEditor = () => {
  const { func } = useOutletContext();
  const dispatch = useDispatch();
  const [code, setCode] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (func?.code) {
      setCode(func.code);
    } else if (func?._id) {
      // Fetch code if not present in func object (though our controller returns it now)
      // For now, assume it's there or we might need to fetch it separately if the list doesn't include full code
      // The list endpoint usually doesn't return full code for performance.
      // We might need to fetch the single function details to get the code.
      fetchFunctionCode(func._id);
    }
  }, [func]);

  const fetchFunctionCode = async (id) => {
    try {
      const { data } = await api.get(ROUTES.FUNCTIONS.DETAILS(id));
      if (data.code) {
        setCode(data.code);
      }
    } catch (error) {
      console.error("Failed to fetch function code", error);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await dispatch(updateFunction({ id: func._id, data: { code } })).unwrap();
      setIsDirty(false);
      setMessage({
        type: "success",
        text: "Function saved and deployed successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save function.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!func) return null;

  return (
    <div className="flex flex-col h-[600px] md:h-full bg-card rounded-xl border border-border-light overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-light bg-background gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">
            index.js
          </span>
          {isDirty && (
            <span
              className="w-2 h-2 rounded-full bg-warning"
              title="Unsaved changes"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <div
              className={`flex items-center gap-1 text-sm ${
                message.type === "success" ? "text-success" : "text-error"
              } mr-2`}
            >
              {message.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span className="truncate max-w-[150px] sm:max-w-none">
                {message.text}
              </span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-background font-bold rounded hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            <Save size={16} />
            {saving ? "Deploying..." : "Save & Deploy"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
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
  );
};

export default FunctionEditor;
