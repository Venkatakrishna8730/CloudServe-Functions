import { useSelector, useDispatch } from "react-redux";
import { User, Key, Copy, RefreshCw, Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { regenerateApiKey } from "../store/slices/authSlice";
import { useToast } from "../context/ToastContext";
import { copyText } from "../utils/clipboard.util";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopyApiKey = async () => {
    if (user?.apiKey) {
      const success = await copyText(user.apiKey);
      if (success) {
        setCopied(true);
        toast.success("API Key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error("Failed to copy API Key");
      }
    }
  };

  const handleRegenerateApiKey = async () => {
    setRegenerating(true);
    try {
      await dispatch(regenerateApiKey()).unwrap();
      toast.success("API Key regenerated successfully");
    } catch (error) {
      toast.error(error || "Failed to regenerate API Key");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
      </header>

      <div className="space-y-6">
        {/* User Details Card */}
        <div className="bg-card rounded-xl border border-border-light overflow-hidden">
          <div className="p-6 border-b border-border-light">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-primary" />
              Personal Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Full Name
              </label>
              <div className="text-sm md:text-lg font-medium text-text-primary break-all">
                {user?.fullName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Username
              </label>
              <div className="text-sm md:text-lg font-medium text-text-primary break-all">
                {user?.userName}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <div className="text-sm md:text-lg font-medium text-text-primary break-all">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* API Key Card */}
        <div className="bg-card rounded-xl border border-border-light overflow-hidden">
          <div className="p-6 border-b border-border-light">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Key size={20} className="text-primary" />
              API Access
            </h2>
          </div>
          <div className="p-6">
            <p className="text-text-secondary mb-4">
              Your API key is used to authenticate requests to the CloudServe
              Functions CLI and API. Keep it secret!
            </p>
            <div className="bg-background border border-border-light rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <code className="font-mono text-primary text-sm break-all w-full sm:w-auto">
                {showKey
                  ? user?.apiKey || "No API Key generated"
                  : "•".repeat(32)}
              </code>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-card rounded-lg transition-colors"
                  title={showKey ? "Hide API Key" : "Show API Key"}
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-card rounded-lg transition-colors"
                  title="Copy API Key"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
                <button
                  className="p-2 text-text-secondary hover:text-primary hover:bg-card rounded-lg transition-colors"
                  title="Regenerate API Key"
                  onClick={handleRegenerateApiKey}
                  disabled={regenerating}
                >
                  <RefreshCw
                    size={20}
                    className={regenerating ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
