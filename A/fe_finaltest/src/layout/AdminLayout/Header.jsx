import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaUserCircle, FaSignOutAlt, FaBell, FaSearch, FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../store/userSlice";
import LoginInfoService from "../../services/LoginInfoService";

function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  const { isLoggedIn } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await LoginInfoService.getCurrentUser();
        setUserInfo(user);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes("/admin/salePOS")) return { title: "Bán Hàng Tại Quầy", subtitle: "POS Terminal" };
    if (path.includes("/admin/dashboard")) return { title: "Tổng Quan", subtitle: "Dashboard Overview" };
    if (path.includes("/admin/product")) return { title: "Sản Phẩm", subtitle: "Product Management" };
    if (path.includes("/admin/order")) return { title: "Đơn Hàng", subtitle: "Order Processing" };
    if (path.includes("/admin/customer")) return { title: "Khách Hàng", subtitle: "Customer Relations" };
    if (path.includes("/admin/employee")) return { title: "Nhân Sự", subtitle: "HR Management" };
    if (path.includes("/admin/statistics")) return { title: "Báo Cáo", subtitle: "Analytics & Statistics" };
    if (path === "/admin") return { title: "Dashboard", subtitle: "Welcome back!" };
    return { title: "Admin Panel", subtitle: "Control Center" };
  };

  const { title, subtitle } = getPageContext();

  return (
    <header className="bg-white/80 backdrop-blur-md h-20 shadow-sm border-b border-gray-100 flex justify-between items-center px-8 z-30 sticky top-0 transition-all duration-300">

      {/* Page Title with Gradient Text */}
      <div className="flex flex-col animate-fade-in">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">{title}</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {subtitle}
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">

        {/* Search Bar - Enhanced */}
        <div className="hidden md:flex items-center bg-gray-50/50 hover:bg-white rounded-full px-5 py-2.5 border border-gray-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all w-72 shadow-inner">
          <FaSearch className="text-gray-400 mr-3 text-sm" />
          <input type="text" placeholder="Tìm kiếm nhanh (Ctrl+K)..." className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400 font-medium" />
        </div>

        {/* Notifications with Pulse */}
        <button className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all transform hover:scale-105">
          <FaBell className="text-xl" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* Profile Dropdown - Refined */}
        <div className="relative pl-6 border-l border-gray-200" ref={menuRef}>
          <button
            className="flex items-center gap-3 group"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">{userInfo?.fullname || "Admin"}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Administrator</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg group-hover:shadow-blue-200 transition-all">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {userInfo?.avatar ? (<img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />) : (
                  <span className="text-[#1E3A8A] font-black text-lg">{userInfo?.fullname ? userInfo.fullname.charAt(0).toUpperCase() : "A"}</span>
                )}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-64 bg-white text-gray-800 shadow-2xl rounded-2xl border border-gray-100 py-3 animate-slide-in-down origin-top-right ring-1 ring-black/5">
              <div className="px-5 py-3 border-b border-gray-50 mb-2 bg-gray-50/50">
                <p className="font-bold text-gray-800 text-base">{userInfo?.fullname}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{userInfo?.email}</p>
              </div>

              <button
                className="w-full text-left px-5 py-3 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all flex items-center gap-3 border-l-4 border-transparent hover:border-blue-500"
                onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}
              >
                <FaUserCircle className="text-lg opacity-70" /> Hồ sơ cá nhân
              </button>

              <div className="border-t border-gray-100 my-2 mx-5"></div>

              <button
                className="w-full text-left px-5 py-3 hover:bg-red-50 text-gray-600 hover:text-red-600 text-sm font-medium transition-all flex items-center gap-3 border-l-4 border-transparent hover:border-red-500"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="text-lg opacity-70" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Profile - Premium */}
      {/* Modal Profile */}
      {showProfileModal && userInfo && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-white/20">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-8 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-30 pattern-dots"></div>
              <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl transition-colors">&times;</button>

              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-white p-1 mx-auto shadow-xl mb-4">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-[#1E3A8A] text-4xl font-black">
                    {userInfo.fullname ? userInfo.fullname.charAt(0).toUpperCase() : "A"}
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{userInfo.fullname}</h2>
                <p className="text-blue-100 text-sm font-medium mt-1 bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">{userInfo.email}</p>
              </div>
            </div>

            <div className="p-8 space-y-5">
              <div className="flex justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <span className="text-gray-400 text-sm font-medium">Số điện thoại</span>
                <span className="font-bold text-gray-800">{userInfo.phone || "---"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <span className="text-gray-400 text-sm font-medium">Mã nhân viên</span>
                <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-sm">{userInfo.employeeCode || "---"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <span className="text-gray-400 text-sm font-medium">Quyền hạn</span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-sm">{userInfo.role?.name || "---"}</span>
              </div>
              <div className="py-2 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <span className="text-gray-400 text-sm block mb-1 font-medium">Địa chỉ</span>
                <span className="font-semibold text-gray-800">{userInfo.address || "---"}</span>
              </div>

              <button
                className="w-full mt-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                onClick={() => setShowProfileModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

export default Header;
