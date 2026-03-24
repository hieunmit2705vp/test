import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/userSlice";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaHeart,
  FaClipboardCheck,
  FaStar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import ProductService from "../../services/ProductService";
import logo from "../../assets/logo.jpg";

const Header = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const { isLoggedIn, name } = useSelector((state) => state.user);

  const normalizeVietnameseText = (value = "") => {
    return value
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .trim();
  };

  // Search logic
  const fetchSuggestions = useCallback(async () => {
    if (!search.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    try {
      const normalizedKeyword = normalizeVietnameseText(search);
      const response = await ProductService.getFilteredProducts({
        search: "",
        size: 300,
      });
      const products = response.content || [];
      const matchedSuggestions = products
        .filter((product) => {
          const productName = normalizeVietnameseText(product.nameProduct || "");
          const productCode = normalizeVietnameseText(product.productCode || "");
          return (
            productName.includes(normalizedKeyword) ||
            productCode.includes(normalizedKeyword)
          );
        })
        .slice(0, 5);

      setSuggestions(matchedSuggestions);
      setIsDropdownOpen(matchedSuggestions.length > 0);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchSuggestions]);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    navigate("/login");
  };

  const handleViewProduct = async (product) => {
    try {
      if (product?.productCode) {
        navigate(`/view-product/${product.productCode}`);
        setIsDropdownOpen(false);
        setSearch("");
        return;
      }

      const productDetails = await ProductService.getProductById(product?.id);
      if (productDetails && productDetails.productCode) {
        navigate(`/view-product/${productDetails.productCode}`);
        setIsDropdownOpen(false);
        setSearch("");
        return;
      }

      alert("Không thể tìm thấy mã sản phẩm.");
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      alert("Không thể xem chi tiết sản phẩm. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value.trim()) {
      setIsDropdownOpen(false);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300 font-sans">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">

          {/* Left: Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0 z-20">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#1E3A8A] shadow-sm group-hover:shadow-md transition-all">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <p className="text-xs text-gray-500 mb-0.5 font-medium">Chào mừng đến với</p>
              <p className="text-sm font-extrabold text-[#1E3A8A] tracking-tight">The Boys Fashion</p>
            </div>
          </Link>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 justify-center max-w-xl mx-4 relative group" ref={searchRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-[#1E3A8A] bg-gray-50 focus:bg-white shadow-inner focus:shadow-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors" />
            </div>

            {/* Search Suggestions Dropdown */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-xl mt-3 overflow-hidden z-50 border border-gray-100 animate-fade-in-up">
                <div className="p-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sản phẩm gợi ý top 5
                </div>
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleViewProduct(product);
                    }}
                    className="flex items-center p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 group/item"
                  >
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 group-hover/item:border-[#1E3A8A] transition-colors">
                      <img
                        src={product.photo}
                        alt={product.nameProduct}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover/item:text-[#1E3A8A] transition-colors">
                        {product.nameProduct}
                      </p>
                      <p className="text-xs text-red-600 font-bold mt-0.5">
                        {product.salePrice?.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Navigation & User Actions */}
          <div className="flex items-center justify-end gap-5 flex-shrink-0">

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6">
              <Link to="/products" className="flex items-center gap-1.5 text-gray-600 hover:text-[#1E3A8A] font-bold text-sm uppercase tracking-wide transition-colors group">
                <FaStar className="text-lg mb-0.5 group-hover:scale-110 transition-transform" />
                <span>Sản phẩm</span>
              </Link>
              <Link to="/productsBanrd" className="flex items-center gap-1.5 text-gray-600 hover:text-[#1E3A8A] font-bold text-sm uppercase tracking-wide transition-colors group">
                <FaHeart className="text-lg mb-0.5 group-hover:scale-110 transition-transform" />
                <span>Bộ sưu tập</span>
              </Link>
              <Link to="/order" className="flex items-center gap-1.5 text-gray-600 hover:text-[#1E3A8A] font-bold text-sm uppercase tracking-wide transition-colors group">
                <FaClipboardCheck className="text-lg mb-0.5 group-hover:scale-110 transition-transform" />
                <span>Đơn hàng</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-1.5 text-gray-600 hover:text-[#1E3A8A] font-bold text-sm uppercase tracking-wide transition-colors group relative">
                <div className="relative">
                  <FaShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
                  {/* Optional Badge */}
                  {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">3</span> */}
                </div>
                <span>Giỏ hàng</span>
              </Link>
            </nav>

            {/* Vertical Divider */}
            <div className="hidden xl:block w-px h-8 bg-gray-200"></div>

            {/* User Profile / Login */}
            <div className="hidden lg:flex items-center gap-4">
              {isLoggedIn ? (
                <div className="relative group/user cursor-pointer">
                  <div className="flex items-center gap-3 py-1 px-2 rounded-full hover:bg-gray-50 transition-colors">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tài khoản</p>
                      <p className="text-sm font-bold text-[#1E3A8A] max-w-[100px] truncate">{name}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shadow-md ring-2 ring-transparent group-hover/user:ring-blue-100 transition-all">
                      <FaUser className="text-sm" />
                    </div>
                    <FaChevronDown className="text-gray-400 text-xs group-hover/user:text-[#1E3A8A] transition-colors" />
                  </div>

                  {/* Desktop User Dropdown */}
                  <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 transform translate-y-2 group-hover/user:translate-y-0 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1.5">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-500">Thành viên thân thiết</p>
                      </div>
                      <Link to="/personal" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1E3A8A] transition-colors">
                        <FaUser className="text-gray-400 group-hover:text-[#1E3A8A]" /> Thông tin cá nhân
                      </Link>
                      <Link to="/order" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1E3A8A] transition-colors lg:hidden">
                        <FaClipboardCheck className="text-gray-400 group-hover:text-[#1E3A8A]" /> Đơn mua
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors border-t border-gray-50 mt-1">
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-gray-600 hover:text-[#1E3A8A] font-bold text-sm transition-colors">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-blue-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu & Search Interface */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[80vh] opacity-100 mt-4" : "max-h-0 opacity-0"}`}>

          {/* Mobile Search */}
          <div className="relative mb-6" ref={searchRef}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
            <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />

            {/* Mobile Search Suggestions */}
            {/* (Reusing same suggestion logic but styling for mobile if needed) */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-xl mt-2 overflow-hidden z-50 border border-gray-100">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleViewProduct(product);
                    }}
                    className="flex items-center p-3 border-b border-gray-100 last:border-b-0 active:bg-gray-100"
                  >
                    <img src={product.photo} className="w-10 h-10 object-cover rounded" />
                    <div className="ml-3 truncate">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.nameProduct}</p>
                      <p className="text-xs text-red-600 font-bold">{product.salePrice?.toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Navigation Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link to="/products" onClick={closeMenu} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <FaStar className="text-2xl text-gray-400 group-hover:text-[#1E3A8A] mb-2" />
              <span className="text-sm font-bold text-gray-700 group-hover:text-[#1E3A8A]">Sản phẩm</span>
            </Link>
            <Link to="/productsBanrd" onClick={closeMenu} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <FaHeart className="text-2xl text-gray-400 group-hover:text-[#1E3A8A] mb-2" />
              <span className="text-sm font-bold text-gray-700 group-hover:text-[#1E3A8A]">Bộ sưu tập</span>
            </Link>
            <Link to="/order" onClick={closeMenu} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <FaClipboardCheck className="text-2xl text-gray-400 group-hover:text-[#1E3A8A] mb-2" />
              <span className="text-sm font-bold text-gray-700 group-hover:text-[#1E3A8A]">Đơn hàng</span>
            </Link>
            <Link to="/cart" onClick={closeMenu} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <FaShoppingCart className="text-2xl text-gray-400 group-hover:text-[#1E3A8A] mb-2" />
              <span className="text-sm font-bold text-gray-700 group-hover:text-[#1E3A8A]">Giỏ hàng</span>
            </Link>
          </div>

          {/* Mobile User Section */}
          {isLoggedIn ? (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-blue-100">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-lg">
                  <FaUser />
                </div>
                <div>
                  <p className="font-bold text-[#1E3A8A]">{name}</p>
                  <p className="text-xs text-gray-500">Thành viên thân thiết</p>
                </div>
              </div>
              <Link to="/personal" onClick={closeMenu} className="flex items-center gap-3 py-3 px-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-white rounded-lg transition-colors font-medium">
                <FaUser className="text-lg" /> Thông tin cá nhân
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 py-3 px-2 text-red-600 hover:bg-red-50 rounded-lg w-full text-left font-medium mt-2">
                <FaSignOutAlt className="text-lg" /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={closeMenu} className="flex-1 py-3 bg-white border border-[#1E3A8A] text-[#1E3A8A] rounded-xl font-bold text-center hover:bg-blue-50 transition-colors">
                Đăng nhập
              </Link>
              <Link to="/register" onClick={closeMenu} className="flex-1 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold text-center hover:bg-blue-800 transition-colors shadow-md">
                Đăng ký
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;