
import React from "react";
import { Outlet } from "react-router-dom";

import UserNavbar from "./UserNavbar";
import Footer from "./Footer";

function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-workspace text-ink">

      {/* Navigation */}
      <UserNavbar />

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default UserLayout;
