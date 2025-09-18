//import { useThemeStore } from "@/stores/themeStore";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  // const { theme, toggleTheme, applyTheme } = useThemeStore();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // useEffect(() => {
  //   applyTheme();
  // }, [applyTheme]);

  return (
    <div className="min-h-screen">
      <Header sidebarExpanded={sidebarExpanded} />
      <div className="flex">
        <div
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <Sidebar />
        </div>
        <main
          className={`flex-1 pt-16 p-4 rounded-lg bg-blue-50 transition-all duration-300 ease-in-out ${
            sidebarExpanded ? "ml-64" : "ml-16"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
