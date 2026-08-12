import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Home,
  Video,
  History,
  TrendingUp,
  Dumbbell,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">

        <div className="flex h-20 items-center justify-between">

          {/* ================= LOGO ================= */}
          <Link
            to={token ? "/dashboard" : "/"}
            className="group flex items-center gap-3"
          >

            <div className="relative">

              {/* Glow */}
              <div className="absolute inset-0 rounded-xl bg-cyan-400/40 blur-lg group-hover:bg-cyan-400/60" />

              {/* Icon */}
              <div className="relative rounded-xl border border-cyan-400/30 bg-white/10 p-2.5 backdrop-blur-xl">
                <Activity
                  size={24}
                  className="text-cyan-400"
                />
              </div>

            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Pose<span className="text-cyan-400">Care</span>
              </h1>

              <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500">
                <Sparkles size={10} />
                AI Movement
              </p>
            </div>

          </Link>


          {/* ================= NAVIGATION ================= */}

          {token ? (

            <div className="hidden items-center gap-1 md:flex">

              {/* Dashboard */}
              <NavItem
                to="/dashboard"
                icon={<Home size={17} />}
                text="Dashboard"
              />

              {/* Pose Analysis */}
              <NavItem
                to="/pose-analysis"
                icon={<Video size={17} />}
                text="Pose Analysis"
              />

              {/* Sessions */}
              <NavItem
                to="/sessions"
                icon={<History size={17} />}
                text="Sessions"
              />

              {/* Progress */}
              <NavItem
                to="/progress"
                icon={<TrendingUp size={17} />}
                text="Progress"
              />

              {/* Exercises */}
              <NavItem
                to="/exercises"
                icon={<Dumbbell size={17} />}
                text="Exercises"
              />

              {/* Profile */}
              <NavItem
                to="/profile"
                icon={<User size={17} />}
                text="Profile"
              />

            </div>

          ) : (

            /* ================= BEFORE LOGIN ================= */

            <Link
              to="/login"
              className="
                group relative
                flex items-center gap-2
                overflow-hidden
                rounded-xl
                bg-cyan-500
                px-6 py-2.5
                font-semibold
                text-slate-950
                shadow-lg shadow-cyan-500/20
                transition
                hover:scale-105
                hover:bg-cyan-400
              "
            >

              <span className="relative z-10">
                Login
              </span>

              <Activity
                size={18}
                className="relative z-10"
              />

            </Link>

          )}


          {/* ================= USER / LOGOUT ================= */}

          {token && (

            <button
              onClick={handleLogout}
              className="
                hidden
                items-center
                gap-2
                rounded-xl
                border border-red-400/20
                bg-red-400/5
                px-4 py-2
                text-sm
                font-medium
                text-red-400
                transition
                hover:border-red-400/40
                hover:bg-red-400/10
                md:flex
              "
            >

              <LogOut size={17} />

              Logout

            </button>

          )}

        </div>

      </div>
    </nav>
  );
};


/* ================= NAV ITEM ================= */

const NavItem = ({ to, icon, text }) => {

  return (
    <Link
      to={to}
      className="
        group
        relative
        flex
        items-center
        gap-2
        rounded-xl
        px-3
        py-2.5
        text-sm
        font-medium
        text-slate-400
        transition
        duration-300
        hover:bg-white/5
        hover:text-cyan-400
      "
    >

      {/* Hover Glow */}

      <div
        className="
          absolute
          inset-0
          -z-10
          rounded-xl
          bg-cyan-400/0
          blur-xl
          transition
          group-hover:bg-cyan-400/10
        "
      />

      {/* Icon */}

      <span className="transition duration-300 group-hover:scale-110">
        {icon}
      </span>

      {/* Text */}

      <span>
        {text}
      </span>

    </Link>
  );
};


export default Navbar;