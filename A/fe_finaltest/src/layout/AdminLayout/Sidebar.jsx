import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChartPie,
  FaUserTie,
  FaUsers,
  FaBoxOpen,
  FaCubes,
  FaTags,
  FaThLarge,
  FaTshirt,
  FaPalette,
  FaRulerCombined,
  FaCloudSun,
  FaTrademark,
  FaClipboardList,
  FaMoneyBillWave,
  FaChevronRight,
  FaChartBar,
  FaCashRegister,
  FaRegPlusSquare
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    product: true,
    account: false,
    order: false
  });

  const toggleMenu = (menu) => {
    // If collapsed, expand the sidebar first for better UX
    if (collapsed) {
      setCollapsed(false);
      // Ensure menu opens
      setOpenMenus(prev => ({ ...prev, [menu]: true }));
      return;
    }
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path) => location.pathname === path;

  // Modernized Menu Item
  const MenuItem = ({ to, icon, label, depth = 0 }) => {
    const active = isActive(to);

    // Calculate padding based on depth ONLY if NOT collapsed
    const paddingLeft = !collapsed && depth === 1 ? '2.5rem' : '0.75rem';

    return (
      <li>
        <Link
          to={to}
          title={collapsed ? label : ""} // Native tooltip when collapsed
          className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-xl transition-all duration-300 group relative overflow-hidden backdrop-blur-sm
                    ${active
              ? "bg-white/10 text-white shadow-lg border-r-4 border-blue-400 translate-x-1"
              : "text-blue-100 hover:bg-white/5 hover:text-white hover:translate-x-1"
            }
                    ${collapsed ? "justify-center px-0" : ""}
                `}
          style={{ paddingLeft: collapsed ? 0 : paddingLeft }}
        >
          {/* Active Glove Effect */}
          {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent pointer-events-none" />
          )}

          <span className={`text-lg transition-transform duration-300 z-10 
                    ${active ? "text-blue-300 scale-110" : "group-hover:text-blue-300 group-hover:scale-110"}
                    ${collapsed ? "text-2xl" : ""}
                `}>
            {icon}
          </span>

          {!collapsed && (
            <span className={`z-10 font-medium truncate ${active ? "font-bold tracking-wide" : ""}`}>
              {label}
            </span>
          )}
        </Link>
      </li>
    );
  };

  const SubHeader = ({ label, isOpen, onClick, icon }) => (
    <li className="px-2 mt-3 mb-1">
      <div
        onClick={onClick}
        title={collapsed ? label : ""}
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 group
                 ${isOpen ? "bg-white/5 text-white" : "text-blue-200 hover:bg-white/5 hover:text-white"}
                 ${collapsed ? "justify-center" : ""}
             `}
      >
        <div className={`flex items-center gap-3 z-10 transition-transform group-hover:translate-x-1 ${collapsed ? "justify-center w-full" : ""}`}>
          <span className={`text-lg transition-colors duration-300 ${isOpen ? "text-blue-400" : "group-hover:text-blue-400"} ${collapsed ? "text-2xl" : ""}`}>{icon}</span>
          {!collapsed && <span className="font-semibold tracking-wide truncate">{label}</span>}
        </div>
        {!collapsed && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-white/10 rotate-90" : "bg-transparent"}`}>
            <FaChevronRight className="text-xs" />
          </div>
        )}
      </div>
    </li>
  );

  return (
    <div
      className={`bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#172554] min-h-screen transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-72"} flex flex-col shadow-2xl relative z-20 border-r border-blue-900/50 shrink-0`}
    >
      {/* Brand Logo */}
      <div className="h-24 flex items-center justify-center bg-black/10 backdrop-blur-md sticky top-0 z-20 border-b border-white/5 shrink-0">
        {!collapsed ? (
          <div className="flex flex-col items-center animate-fade-in-down overflow-hidden">
            <div className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter truncate px-2">
              <FaTshirt className="text-blue-400 text-3xl drop-shadow-lg shrink-0" />
              <span>THE<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">BOYS</span></span>
            </div>
            <span className="text-[10px] text-blue-300 font-bold tracking-[0.2em] uppercase mt-1 truncate">Admin Dashboard</span>
          </div>
        ) : (
          <FaTshirt className="text-3xl text-blue-400 drop-shadow-md animate-pulse-slow" />
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-28 w-7 h-7 bg-white text-[#1E3A8A] rounded-full shadow-lg flex items-center justify-center text-xs hover:bg-blue-50 hover:scale-110 transition-all z-30 border-2 border-blue-900 ring-2 ring-white/20"
      >
        <FaChevronRight className={`transition-transform duration-300 ${!collapsed ? "rotate-180" : ""}`} />
      </button>


      {/* Menu List */}
      <ul className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-dark py-6 space-y-1 pb-20">

        <MenuItem to="/admin" icon={<FaChartPie />} label="Dashboard" />

        {/* Section Divider */}
        {!collapsed ? (
          <div className="px-5 py-2 mt-4 mb-1 text-[10px] font-black text-blue-400/80 uppercase tracking-widest border-t border-white/5 pt-4 truncate">
            Bán Hàng
          </div>
        ) : (
          <div className="h-px bg-white/10 my-4 mx-4"></div>
        )}

        <MenuItem to="/admin/salePOS" icon={<FaCashRegister />} label="Bán hàng POS" />

        {/* Quản lý hóa đơn GROUOP */}
        <SubHeader
          label="Quản lý hóa đơn"
          icon={<FaClipboardList />}
          isOpen={!collapsed && openMenus.order}
          onClick={() => toggleMenu("order")}
        />
        {/* Only show submenu if NOT collapsed AND open */}
        {!collapsed && (
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.order ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
            <MenuItem to="/admin/order/pos" icon={<FaCashRegister />} label="Hóa đơn POS" depth={1} />
            <MenuItem to="/admin/order/online" icon={<FaClipboardList />} label="Đơn Online" depth={1} />
          </div>
        )}


        {!collapsed ? (
          <div className="px-5 py-2 mt-6 mb-1 text-[10px] font-black text-blue-400/80 uppercase tracking-widest border-t border-white/5 pt-4 truncate">
            Quản Lý
          </div>
        ) : (
          <div className="h-px bg-white/10 my-4 mx-4"></div>
        )}


        {/* Quản lý sản phẩm GROUP */}
        <SubHeader
          label="Sản phẩm"
          icon={<FaBoxOpen />}
          isOpen={!collapsed && openMenus.product}
          onClick={() => toggleMenu("product")}
        />
        {!collapsed && (
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.product ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
            <MenuItem to="/admin/product" icon={<FaTshirt />} label="Danh sách SP" depth={1} />
            <MenuItem to="/admin/product/create" icon={<FaRegPlusSquare />} label="Thêm mới" depth={1} />
            <MenuItem to="/admin/brand" icon={<FaTrademark />} label="Thương hiệu" depth={1} />
            <MenuItem to="/admin/material" icon={<FaCubes />} label="Chất liệu" depth={1} />
            <MenuItem to="/admin/attribute/collar" icon={<FaThLarge />} label="Cổ áo" depth={1} />
            <MenuItem to="/admin/attribute/color" icon={<FaPalette />} label="Màu sắc" depth={1} />
            <MenuItem to="/admin/attribute/size" icon={<FaRulerCombined />} label="Kích thước" depth={1} />
            <MenuItem to="/admin/attribute/sleeve" icon={<FaCloudSun />} label="Tay áo" depth={1} />
            <MenuItem to="/admin/attribute/promotion" icon={<FaTags />} label="Khuyến mãi" depth={1} />
          </div>
        )}

        {/* Quản lý tài khoản GROUP */}
        <SubHeader
          label="Tài khoản"
          icon={<FaUsers />}
          isOpen={!collapsed && openMenus.account}
          onClick={() => toggleMenu("account")}
        />
        {!collapsed && (
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.account ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
            <MenuItem to="/admin/employee" icon={<FaUserTie />} label="Nhân viên" depth={1} />
            <MenuItem to="/admin/customer" icon={<FaUsers />} label="Khách hàng" depth={1} />
          </div>
        )}

        {!collapsed ? (
          <div className="px-5 py-2 mt-6 mb-1 text-[10px] font-black text-blue-400/80 uppercase tracking-widest border-t border-white/5 pt-4 truncate">
            Thống Kê
          </div>
        ) : (
          <div className="h-px bg-white/10 my-4 mx-4"></div>
        )}

        <MenuItem to="/admin/voucher" icon={<FaMoneyBillWave />} label="Quản lý Voucher" />
        <MenuItem to="/admin/statistics" icon={<FaChartBar />} label="Báo Cáo Thống Kê" />

      </ul>

      {/* User Info Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm shrink-0">
        <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20">
              A
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-blue-300 truncate font-medium uppercase tracking-wider">Super Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
