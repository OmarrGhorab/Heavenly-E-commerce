import { Outlet, Navigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const AuthLayout: React.FC = () => {
  const { user } = useUserStore();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen flex-grow overflow-hidden">
      {/* Left side with actual <img> instead of background-image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="/img-form.webp"
          alt="Auth Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right side with the form */}
      <section
        className="flex flex-1 items-center justify-center flex-col py-20 bg-gradient-to-br from-gray-700 to-gray-900"
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
