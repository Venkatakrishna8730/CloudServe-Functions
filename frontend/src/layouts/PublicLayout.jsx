import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
