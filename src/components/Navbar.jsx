import { useState, useEffect, useRef } from "react";
import logo from "../assets/images/logo.png";
import { NavLink } from "react-router-dom";
import { FaUserCog } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? "bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
      : "text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2";

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const { logout, isAuthenticated, user } = useAuth();

  const htmlTooltip = `
    <div class="p-2">
      <div class="font-bold text-blue-600">User Info</div>
      <div class="text-sm text-gray-600">${user?.username}</div>
      <div class="mt-1 text-xs text-white">${user?.email}</div>
    </div>
  `;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    // Use capture phase to ensure we catch the event
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleUserIconClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    window.location.href = "/login";
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    console.log("Settings clicked");
  };

  return (
    <div>
      <nav className="bg-indigo-700 border-b border-indigo-500">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
              <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
                <img className="h-10 w-auto" src={logo} alt="React Jobs" />
                <span className="hidden md:block text-white text-2xl font-bold ml-2">
                  React Jobs
                </span>
              </NavLink>
              <div className="md:ml-auto">
                <div className="flex space-x-2">
                  <NavLink to="/" className={linkClass}>
                    Home
                  </NavLink>
                  <NavLink to="/jobs" className={linkClass}>
                    Jobs
                  </NavLink>
                  <NavLink to="/add-job" className={linkClass}>
                    Add Job
                  </NavLink>
                </div>
              </div>
              {isAuthenticated ? (
                <div className="user-menu-container relative" ref={userMenuRef}>
                  <FaUserCog
                    className="inline text-lg mt-2 ml-2 mr-1 text-white w-6 h-6 cursor-pointer hover:text-gray-300 transition-colors"
                    data-tooltip-id="user-tooltip"
                    data-tooltip-html={htmlTooltip}
                    onClick={handleUserIconClick}
                  />
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <button
                        onClick={handleSettings}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Settings
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
              )}
              <Tooltip id="user-tooltip" place="bottom"  />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
