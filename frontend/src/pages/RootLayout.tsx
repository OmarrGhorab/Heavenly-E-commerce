import { Outlet } from "react-router-dom";
import { Footer, Navbar } from "../components/LazyComponents";

const RootLayout = () => {

  return (
    <>
      <Navbar /> 
      <div className="w-full flex flex-col min-h-screen pt-20">
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RootLayout;