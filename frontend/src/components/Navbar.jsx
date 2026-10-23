import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  Home,
  Video,
  History,
  TrendingUp,
  Dumbbell,
  User,
  LogOut,
  Smile,
  Sparkles,
  Trophy,
  Menu,
  X,
} from "lucide-react";

/* ================================================================
   NAV ITEM
================================================================ */

const NavItem = ({ to, icon, text, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 rounded-xl px-3 py-2.5
        text-sm font-medium transition duration-200
        ${
          isActive
            ? "bg-cyan-400/10 text-cyan-400"
            : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
        }
      `}
    >
      {/* active underline bar */}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-cyan-400 opacity-60" />
      )}
      <span className={`transition duration-200 ${isActive ? "" : "group-hover:scale-110 group-hover:rotate-3"}`}>
        {icon}
      </span>
      <span>{text}</span>
    </Link>
  );
};


/* ================================================================
   NAVBAR
================================================================ */

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinks = token
    ? [
        { to: "/dashboard",        icon: <Home size={17} />,       text: "Dashboard"      },
        { to: "/pose-analysis",    icon: <Video size={17} />,      text: "Pose Analysis"  },
        { to: "/sessions",         icon: <History size={17} />,    text: "Sessions"       },
        { to: "/progress",         icon: <TrendingUp size={17} />, text: "Progress"       },
        { to: "/exercises",        icon: <Dumbbell size={17} />,   text: "Exercises"      },
        { to: "/leaderboard",      icon: <Trophy size={17} />,     text: "Leaderboard"    },
        { to: "/emotion-detection",icon: <Smile size={17} />,      text: "Emotion"        },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">

      <div className="mx-auto max-w-7xl px-6">

        <div className="flex h-16 items-center justify-between gap-4">

          {/* ============= LOGO ============= */}
          <Link
            to={token ? "/dashboard" : "/"}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="relative">
              {/* animated glow ring */}
              <div className="absolute inset-0 rounded-xl bg-cyan-400/40 blur-lg transition duration-500 group-hover:bg-cyan-400/70 anim-glow" />
              <div className="relative rounded-xl border border-cyan-400/30 bg-white/10 p-2 backdrop-blur-xl transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Activity size={20} className="text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white transition duration-200 group-hover:text-cyan-50">
                Pose<span className="text-cyan-400">Care</span>
              </h1>
              <p className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-slate-500">
                <Sparkles size={8} />
                AI Movement
              </p>
            </div>
          </Link>


          {/* ============= DESKTOP NAV ============= */}
          {token && (
            <div className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
              {navLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </div>
          )}


          {/* ============= RIGHT SIDE ============= */}
          <div className="flex shrink-0 items-center gap-2">

            {token ? (
              <>
                {/* Profile — desktop only */}
                <div className="hidden md:block">
                  <NavItem to="/profile" icon={<User size={17} />} text="Profile" />
                </div>

                {/* Logout — desktop only */}
                <button
                  onClick={handleLogout}
                  className="
                    hidden md:flex items-center gap-2 rounded-xl border border-red-400/20
                    bg-red-400/5 px-4 py-2 text-sm font-medium text-red-400
                    transition duration-200 hover:border-red-400/40 hover:bg-red-400/10 hover:scale-105 active:scale-95
                  "
                >
                  <LogOut size={16} className="transition duration-200 group-hover:-translate-x-0.5" />
                  Logout
                </button>

                {/* Hamburger — mobile only */}
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition duration-200 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-90 md:hidden"
                  aria-label="Toggle menu"
                >
                  <span className={`transition-all duration-300 ${mobileOpen ? "rotate-90 opacity-100" : "rotate-0 opacity-100"}`}>
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                  </span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-200 hover:scale-105 hover:bg-cyan-400 active:scale-95"
              >
                Login
                <Activity size={16} />
              </Link>
            )}

          </div>

        </div>

      </div>


      {/* ============= MOBILE DROPDOWN ============= */}
      {token && mobileOpen && (
        <div className="anim-slide-down border-t border-white/[0.06] bg-slate-950/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <div key={link.to} className="anim-fade-left" style={{ animationDelay: `${i * 0.04}s` }}>
                <NavItem {...link} onClick={closeMobile} />
              </div>
            ))}
            <div className="anim-fade-left" style={{ animationDelay: "0.32s" }}>
              <NavItem to="/profile" icon={<User size={17} />} text="Profile" onClick={closeMobile} />
            </div>
            <div className="mt-1 border-t border-white/[0.06] pt-2 anim-fade-left" style={{ animationDelay: "0.36s" }}>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-400/10 active:scale-95"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};


export default Navbar;
