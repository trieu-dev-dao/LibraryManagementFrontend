
import React from "react";

const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <footer className="border-t border-line bg-white px-4 py-5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">

        <p className="text-sm text-slate-500">
          © {currentYear} Thư viện.
        </p>

        <p className="text-xs text-slate-400">
          Quản lý và khám phá sách
        </p>

      </div>
    </footer>
  );
}

export default Footer;
