import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Trash2, AlertTriangle, Save } from "lucide-react";
import {
  deleteFunction,
  updateFunction,
} from "../../store/slices/functionsSlice";

const FunctionSettings = () => {
  const { func } = useOutletContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(func?.name || "");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteFunction(func._id)).unwrap();
      navigate("/functions");
    } catch (error) {
      alert("Failed to delete function: " + error.message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!func) return null;

  return (
    <div className="w-full space-y-8 relative">
      {}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border-light rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-error mb-4">
              <div className="p-3 bg-error/10 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Delete Function?
              </h3>
            </div>

            <p className="text-text-secondary mb-2">
              Are you sure you want to delete{" "}
              <span className="font-bold text-text-primary">"{func.name}"</span>
              ?
            </p>
            <p className="text-text-muted text-sm mb-6">
              This action is permanent and cannot be undone. All resources,
              logs, and settings associated with this function will be
              destroyed.
            </p>

            <div className="mb-6">
              <label className="block text-sm text-text-secondary mb-2">
                To confirm, type{" "}
                <span className="font-bold select-all">{func.name}</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full bg-background border border-border-light rounded-lg px-4 py-2 text-text-primary focus:border-error focus:ring-1 focus:ring-error transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmation("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-border-light/50 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || deleteConfirmation !== func.name}
                className="px-4 py-2 bg-error text-white font-bold rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="bg-card rounded-xl border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-xl font-bold">General Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Function Name
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={name}
                disabled
                className="flex-1 bg-background border border-border-light rounded-lg px-4 py-3 text-text-muted cursor-not-allowed"
                title="Renaming functions is not supported yet"
              />
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Function names cannot be changed after creation.
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-card rounded-xl border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-xl font-bold">Function Status</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-text-primary mb-1">
                {func.isActive ? "Active" : "Inactive"}
              </h3>
              <p className="text-text-secondary text-sm">
                {func.isActive
                  ? "Your function is currently active and can be invoked."
                  : "Your function is currently inactive and cannot be invoked."}
              </p>
            </div>
            <button
              onClick={() =>
                dispatch(
                  updateFunction({
                    id: func._id,
                    data: { isActive: !func.isActive },
                  })
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shrink-0 ${
                func.isActive ? "bg-primary" : "bg-border-heavy"
              }`}
            >
              <span
                className={`${
                  func.isActive ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="rounded-xl border border-error/20 overflow-hidden">
        <div className="p-6 border-b border-error/20">
          <h2 className="text-xl font-bold text-error flex items-center gap-2">
            <AlertTriangle size={24} />
            Danger Zone
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-text-primary mb-1">
                Delete Function
              </h3>
              <p className="text-text-secondary text-sm">
                Permanently delete this function and all of its resources.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-error text-white font-bold rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Trash2 size={18} />
              Delete Function
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionSettings;
