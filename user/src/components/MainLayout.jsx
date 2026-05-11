// // // src/MainLayout.jsx
// // import { useState } from "react";
// // import { Outlet } from "react-router-dom";
// // import NavbarNew from "./NavbarNew";
// // import MobileBottomNav from "./MobileBottomNav";

// // export default function MainLayout() {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [collapsed, setCollapsed] = useState(false);

// //   return (
// //     <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
// //       <NavbarNew
// //         sidebarOpen={sidebarOpen}
// //         setSidebarOpen={setSidebarOpen}
// //         collapsed={collapsed}
// //         onToggleCollapse={() => setCollapsed(!collapsed)}
// //       />

// //       <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
// //         <Outlet />
// //       </main>

// //       <MobileBottomNav setSidebarOpen={setSidebarOpen} />
// //     </div>
// //   );
// // }


// // src/MainLayout.jsx
// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import NavbarNew from "./NavbarNew";
// import MobileBottomNav from "./MobileBottomNav";

// export default function MainLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
//       <NavbarNew
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         collapsed={collapsed}
//         onToggleCollapse={() => setCollapsed(!collapsed)}
//       />

//       <main
//         className="flex-1 overflow-y-auto pt-16 lg:pt-0 lg:pb-0"
//         style={{
//           paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
//         }}
//       >
//         <Outlet />
//       </main>

//       <MobileBottomNav setSidebarOpen={setSidebarOpen} />
//     </div>
//   );
// }

// src/MainLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavbarNew from "./NavbarNew";
import MobileBottomNav from "./MobileBottomNav";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="flex w-full bg-slate-50 overflow-hidden relative"
      style={{ height: "100dvh" }}
    >
      <NavbarNew
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <main
        className="flex-1 overflow-y-auto lg:pt-0 lg:pb-0"
        style={{
          paddingTop: "var(--top-bar-height, 4rem)",
          paddingBottom: "calc(var(--bottom-nav-height, 4rem) + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Outlet />
      </main>

      <MobileBottomNav setSidebarOpen={setSidebarOpen} />
    </div>
  );
}