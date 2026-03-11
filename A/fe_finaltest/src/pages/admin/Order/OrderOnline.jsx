import React, { useState, useEffect } from "react";
import {
  AiOutlineEye,
  AiFillCaretUp,
  AiFillCaretDown,
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineReload,
} from "react-icons/ai";
import OrderService from "../../../services/OrderService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Các trạng thái đơn hàng
const orderStatusMap = {
  "-1": "Đã hủy",
  0: "Chờ xác nhận",
  1: "Chờ thanh toán",
  2: "Đã xác nhận",
  3: "Đang giao hàng",
  4: "Giao hàng thất bại",
  5: "Hoàn thành",
};

// Tạo lớp CSS cho từng trạng thái
const getStatusClass = (status) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  return status === -1
    ? `${baseClasses} bg-red-100 text-red-800`
    : status === 0
      ? `${baseClasses} bg-yellow-100 text-yellow-800`
      : status === 1
        ? `${baseClasses} bg-blue-100 text-blue-800`
        : status === 2
          ? `${baseClasses} bg-green-100 text-green-800`
          : status === 3
            ? `${baseClasses} bg-purple-100 text-purple-800`
            : status === 4
              ? `${baseClasses} bg-orange-100 text-orange-800`
              : `${baseClasses} bg-gray-100 text-gray-800`;
};

export default function OnlineOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, sortConfig, search]);

  useEffect(() => {
    filterOrders();
  }, [selectedStatus, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await OrderService.getOnlineOrders(
        search,
        currentPage - 1,
        pageSize,
        sortConfig.key,
        sortConfig.direction
      );
      setOrders(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setFilteredOrders(data?.content || []);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu đơn hàng Online");
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    if (selectedStatus !== null) {
      filtered = filtered.filter(
        (order) => order.statusOrder.toString() === selectedStatus
      );
    }
    setFilteredOrders(filtered);
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSelectedStatus(null);
    setSearch("");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="p-6 bg-blue-50/30 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Quản lý đơn hàng Online
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Trung tâm điều hành và theo dõi tình trạng đơn đặt hàng trực tuyến
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-3">
            <button
              onClick={fetchOrders}
              className="flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95"
            >
              <AiOutlineReload className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <AiOutlineSearch className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm mã đơn, tên khách hàng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border border-slate-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${showFilters
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <AiOutlineFilter className="mr-2 h-5 w-5" /> Bộ lọc trạng thái
              </button>

              {(selectedStatus !== null || search.trim() !== "") && (
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  Xóa hết
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-60 mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                Quy trình xử lý đơn hàng
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(orderStatusMap).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusFilter(key)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${selectedStatus === key
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
              </div>
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang truy xuất dữ liệu...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full text-slate-300 mb-4 inline-block">
                <AiOutlineSearch size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Không tìm thấy đơn hàng ONLINE</h3>
              <p className="text-slate-500 mt-2 max-w-sm px-4">Chúng tôi đã tìm khắp cơ sở dữ liệu nhưng không thấy kết quả khớp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                    <th className="px-6 py-4">
                      <button
                        onClick={() => handleSort("id")}
                        className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-blue-600 transition-colors"
                      >
                        STT {sortConfig.key === "id" && (sortConfig.direction === "asc" ? <AiFillCaretUp className="ml-1" /> : <AiFillCaretDown className="ml-1" />)}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4">
                      <button
                        onClick={() => handleSort("orderCode")}
                        className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-blue-600 transition-colors"
                      >
                        Mã đơn hàng {sortConfig.key === "orderCode" && (sortConfig.direction === "asc" ? <AiFillCaretUp className="ml-1" /> : <AiFillCaretDown className="ml-1" />)}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tổng hàng</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thực thu</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Voucher</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((item, index) => {
                    const isCanceled = item.statusOrder === -1;
                    return (
                      <tr
                        key={item.id}
                        className="group hover:bg-slate-50/80 transition-all duration-200"
                      >
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-400 whitespace-nowrap">
                          #{item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {item.orderCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-800">{item.customer?.fullname || "Ẩn danh"}</span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-400 opacity-60">
                            {formatCurrency(item.originalTotal)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg group-hover:bg-white transition-colors">
                            {formatCurrency(item.totalBill)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-xs font-bold text-slate-500 max-w-[120px] truncate" title={item.voucher?.voucherName}>
                              {item.voucher?.voucherName || "---"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-300 ${item.statusOrder === 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              item.statusOrder === -1 ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                item.statusOrder === 0 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  item.statusOrder === 3 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            {orderStatusMap[item.statusOrder.toString()] || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <button
                              className="flex items-center justify-center h-10 w-10 text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                              onClick={() => navigate(`/admin/order/online/${item.id}/details`)}
                              title="Chi tiết đơn hàng"
                            >
                              <AiOutlineEye size={22} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Card */}
        {filteredOrders.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
              {/* Bên trái: Hiển thị */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-sm font-bold text-slate-500">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl text-sm font-bold p-2 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              {/* Ở giữa: Thông tin trang */}
              <div className="flex justify-center flex-1">
                <span className="text-sm font-bold text-[#1E3A8A] bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                  Trang <span className="text-blue-700">{currentPage}</span> / {totalPages}
                </span>
              </div>

              {/* Bên phải: Nút điều hướng */}
              <div className="flex items-center justify-center md:justify-end gap-2 font-bold">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  title="Trang đầu"
                >
                  &laquo;
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  title="Trước"
                >
                  &lt;
                </button>

                <div className="hidden sm:flex items-center gap-1.5 mx-1">
                  {getPageNumbers().map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`h-10 min-w-[40px] px-2 rounded-xl text-sm transition-all duration-200 active:scale-95 ${currentPage === number
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                        : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
                        }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  title="Sau"
                >
                  &gt;
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  title="Trang cuối"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s ease-out 0.2s both; }
      `}</style>
    </div>
  );
}
