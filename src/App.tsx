import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Calibration from "@/pages/Calibration";
import { Monitor, Settings } from "lucide-react";

function NavSidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <Monitor size={18} />, label: '监控台' },
    { path: '/calibration', icon: <Settings size={18} />, label: '校准台' },
  ];

  return (
    <div className="fixed left-0 top-14 bottom-0 w-14 border-r border-cyber-line/70 flex flex-col items-center py-4 gap-2 bg-cyber-panel/40 z-20">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all
            ${location.pathname === item.path
              ? 'bg-cyber-cyan/20 text-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              : 'text-slate-500 hover:text-cyber-cyan hover:bg-cyber-cyan/10'
            }`}
          title={item.label}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <NavSidebar />
      <div className="pl-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}
