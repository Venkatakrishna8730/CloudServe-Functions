import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signup,
  verifyEmail,
  googleLogin,
  clearError,
} from "../store/slices/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import { AlertCircle, Mail } from "lucide-react";
import { motion } from "framer-motion";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState("signup"); 

  const dispatch = useDispatch();
  const { error, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }

    
    if (location.state?.verify && location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
      setStep("verify");
    }

    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, dispatch, location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(signup(formData));
    if (!result.error) {
      setStep("verify");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    await dispatch(
      verifyEmail({ email: formData.email, code: verificationCode })
    );
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      dispatch(googleLogin(tokenResponse.access_token));
    },
    onError: () => {
      console.error("Google Signup Failed");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -90, 0],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 60, 0],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-primary rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card p-8 rounded-2xl border border-border-light shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2"
          >
            <img
              src="/icon.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            CloudServe Functions
          </Link>
          <h2 className="text-xl text-text-primary font-semibold">
            {step === "signup" ? "Create your account" : "Verify your email"}
          </h2>
          {step === "verify" && (
            <p className="text-text-secondary text-sm mt-2">
              We sent a code to {formData.email}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {step === "signup" ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-background border border-border-light rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="userName"
                  required
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full bg-background border border-border-light rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-background border border-border-light rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-background border border-border-light rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-2"
              >
                Create Account
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-border-light flex-1" />
              <span className="text-text-muted text-sm">OR</span>
              <div className="h-px bg-border-light flex-1" />
            </div>

            <button
              onClick={handleGoogleSignup}
              className="w-full bg-background border border-border-light text-text-primary font-medium py-3 rounded-lg hover:bg-card hover:border-text-secondary transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <p className="mt-6 text-center text-text-secondary text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Verification Code
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  size={20}
                />
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-background border border-border-light rounded-lg pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-center text-lg tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-2"
            >
              Verify Email
            </button>

            <button
              type="button"
              onClick={() => setStep("signup")}
              className="w-full text-text-secondary text-sm hover:text-primary transition-colors"
            >
              Back to Signup
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SignupPage;
