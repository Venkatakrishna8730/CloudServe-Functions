import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import store from "./store/store";
import { checkAuth } from "./store/slices/authSlice";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import FunctionsListPage from "./pages/FunctionsListPage";
import CreateFunctionPage from "./pages/CreateFunctionPage";
import FunctionDetailsPage from "./pages/FunctionDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import DocumentationPage from "./pages/DocumentationPage";

// Function Details Components
import FunctionOverview from "./components/function/FunctionOverview";
import FunctionEditor from "./components/function/FunctionEditor";
import FunctionLogs from "./components/function/FunctionLogs";
import FunctionSettings from "./components/function/FunctionSettings";

const AppContent = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/functions" element={<FunctionsListPage />} />
            <Route path="/functions/create" element={<CreateFunctionPage />} />

            {/* Function Details with Sub-routes */}
            <Route
              path="/functions/:functionId"
              element={<FunctionDetailsPage />}
            >
              <Route path="overview" element={<FunctionOverview />} />
              <Route path="editor" element={<FunctionEditor />} />
              <Route path="logs" element={<FunctionLogs />} />
              <Route path="settings" element={<FunctionSettings />} />
              <Route index element={<Navigate to="overview" replace />} />
            </Route>

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/docs" element={<DocumentationPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const ProtectedRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <GoogleOAuthProvider
      clientId={
        window.env?.VITE_GOOGLE_CLIENT_ID ||
        import.meta.env.VITE_GOOGLE_CLIENT_ID
      }
    >
      <Provider store={store}>
        <ThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;
