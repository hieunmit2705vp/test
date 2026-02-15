import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderService from "../../services/OrderService";
import { AiOutlineEye, AiOutlineSearch, AiOutlineInbox } from "react-icons/ai";
import LoginInfoService from "../../services/LoginInfoService";

// Order status mapping
const orderStatusMap = {
  "-1": "Đã hủy",
  0: "Chờ xác nhận",
  1: "Chờ thanh toán",
  2: "Đã xác nhận",
  3: "Đang giao hàng",
  4: "Giao hàng thất bại",
  5: "Hoàn thành",
};

// Status CSS classes with modern styling
const getStatusClass = (status) => {
  const baseClasses =
    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border";
  switch (Number(status)) {
    case -1:
      return `${baseClasses} bg-red-50 text-red-700 border-red-200`;
    case 0:
      return `${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`;
    case 1:
      return `${baseClasses} bg-blue-50 text-[#1E3A8A] border-blue-200`;
    case 2:
      return `${baseClasses} bg-green-50 text-green-700 border-green-200`;
    case 3:
      return `${baseClasses} bg-indigo-50 text-indigo-700 border-indigo-200`;
    case 4:
      return `${baseClasses} bg-orange-50 text-orange-700 border-orange-200`;
    case 5:
      return `${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200`;
    default:
      return `${baseClasses} bg-gray-50 text-gray-700 border-gray-200`;
  }
};

// OrderTimeline Component
const OrderTimeline = ({ currentStatus, onCancelOrder }) => {
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const statusIcons = {
    "-1": (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    0: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    2: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    3: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    5: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const current = parseInt(currentStatus, 10);

  const getNodeClasses = (statusStep) => {
    const step = parseInt(statusStep, 10);
    if (current === -1 && step === -1)
      return "bg-red-500 text-white shadow-lg shadow-red-200 scale-110";
    if (step === current)
      return "bg-[#1E3A8A] text-white shadow-lg shadow-blue-200 scale-110 ring-4 ring-blue-50";
    if (step < current || (current === 5 && step !== -1))
      return "bg-green-500 text-white shadow-md shadow-green-100";
    return "bg-gray-100 text-gray-400 border border-gray-200";
  };

  const getConnectorClasses = (nextStatusStep) => {
    const nextStep = parseInt(nextStatusStep, 10);
    if (current === -1) return "bg-gray-200";
    if (current >= nextStep || current === 5) return "bg-green-500";
    return "bg-gray-200";
  };

  const handleCancelClick = () => {
    setShowNoteInput(true);
    setNote("");
  };

  const handleSubmitCancel = async () => {
    if (!note.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }
    try {
      await onCancelOrder(note);
      setShowNoteInput(false);
      setNote("");
    } catch (error) {
      console.error(error);
    }
  };

  const mainFlow = ["0", "2", "3", "5"];

  return (
    <div className="py-6">
      {parseInt(currentStatus) === -1 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-100 mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 animate-pulse">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-700">Đơn hàng đã hủy</h3>
          <p className="text-red-500 mt-1">Đơn hàng này đã bị hủy bỏ.</p>
        </div>
      ) : (
        <div className="relative px-4">
          <div className="flex items-center justify-between mb-12">
            {mainFlow.map((status, index) => (
              <div
                key={status}
                className="flex-1 flex flex-col items-center relative z-10 group"
              >
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-500 ease-out ${getNodeClasses(
                    status
                  )}`}
                >
                  {statusIcons[status]}
                </div>
                <div
                  className={`mt-4 text-sm font-bold uppercase tracking-wide transition-colors duration-300 ${parseInt(status) === current
                      ? "text-[#1E3A8A] transform scale-105"
                      : parseInt(status) < current || current === 5
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                >
                  {orderStatusMap[status]}
                </div>
                {index < mainFlow.length - 1 && (
                  <div className="absolute top-7 left-1/2 w-full h-1 -z-10">
                    <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ease-in-out ${getConnectorClasses(
                          mainFlow[index + 1]
                        )}`}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {parseInt(currentStatus) === 0 && (
            <div className="mt-8 flex justify-center">
              <button
                className="group px-6 py-3 rounded-full border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-200"
                onClick={handleCancelClick}
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Hủy đơn hàng
              </button>
            </div>
          )}

          {showNoteInput && (
            <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Lý do hủy đơn hàng
              </h4>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-all duration-200"
                placeholder="Nhập lý do hủy chi tiết..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowNoteInput(false);
                    setNote("");
                  }}
                >
                  Đóng
                </button>
                <button
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                  onClick={handleSubmitCancel}
                >
                  Xác nhận Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UserOrder = () => {
  const { isLoggedIn, role } = useSelector((state) => state.user);
  const [allOrders, setAllOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  const tabs = [
    { key: "all", label: "Tất cả", status: null },
    { key: "awaiting_delivery", label: "Chờ giao hàng", status: 2 },
    { key: "transporting", label: "Vận chuyển", status: 3 },
    { key: "completed", label: "Hoàn thành", status: 5 },
    { key: "canceled", label: "Đã hủy", status: -1 },
  ];

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!isLoggedIn || role !== "CUSTOMER") return;
      try {
        const customerData = await LoginInfoService.getCurrentUser();
        setCustomer(customerData);
      } catch (error) {
        toast.error("Không thể tải thông tin khách hàng!");
      }
    };
    fetchCustomerData();
  }, [isLoggedIn, role]);

  const fetchOrders = async () => {
    if (!customer?.phone) return;
    try {
      setIsLoading(true);
      const response = await OrderService.getOnlineOrders(
        search,
        0,
        1000,
        "id",
        "desc"
      );
      const filteredOrders = (response.content || []).filter(
        (order) => order.customer?.phone === customer.phone
      );
      setAllOrders(filteredOrders);
    } catch (error) {
      toast.error(`Không thể tải danh sách đơn hàng: ${error.message}`);
      setAllOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customer?.phone && isLoggedIn && role === "CUSTOMER") {
      fetchOrders();
    }
  }, [customer, isLoggedIn, role, search]);

  useEffect(() => {
    if (!customer?.phone || !isLoggedIn || role !== "CUSTOMER") return;
    const intervalId = setInterval(async () => {
      try {
        const response = await OrderService.getOnlineOrders(
          search,
          0,
          1000,
          "id",
          "desc"
        );
        const filteredOrders = (response.content || []).filter(
          (order) => order.customer?.phone === customer.phone
        );
        const updatedOrders = filteredOrders.filter((newOrder) =>
          allOrders.some(
            (oldOrder) =>
              oldOrder.id === newOrder.id &&
              oldOrder.statusOrder !== newOrder.statusOrder
          )
        );
        if (updatedOrders.length > 0) {
          updatedOrders.forEach((order) => {
            toast.info(
              `Đơn hàng #${order.orderCode} đã cập nhật trạng thái: ${orderStatusMap[order.statusOrder]
              }`
            );
          });
          setAllOrders(filteredOrders);
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 5000); // Polling every 5s is usually enough
    return () => clearInterval(intervalId);
  }, [allOrders, customer, isLoggedIn, role, search]);

  useEffect(() => {
    const status = tabs.find((tab) => tab.key === activeTab)?.status;
    let filteredOrders = allOrders;
    if (status !== null) {
      filteredOrders = allOrders.filter(
        (order) => Number(order.statusOrder) === status
      );
    }
    const totalFiltered = filteredOrders.length;
    const newTotalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    setTotalPages(newTotalPages);
    if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(1);
    const startIndex = (currentPage - 1) * pageSize;
    setDisplayedOrders(
      filteredOrders.slice(startIndex, startIndex + pageSize)
    );
  }, [allOrders, activeTab, currentPage, pageSize]);

  const handleViewOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const orderDetails = await OrderService.getOnlineOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCancelOrder = async (note) => {
    try {
      setIsLoading(true);
      await OrderService.updateOrderStatus(selectedOrder.id, -1, note);
      const updatedOrder = await OrderService.getOnlineOrderDetails(
        selectedOrder.id
      );
      setSelectedOrder(updatedOrder);
      fetchOrders();
      toast.success("Đơn hàng đã hủy thành công!");
    } catch (error) {
      toast.error("Không thể hủy đơn hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    amount || amount === 0
      ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
      : "0 ₫";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination logic
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers.length > 0 ? pageNumbers : [1];
  };

  if (!isLoggedIn || role !== "CUSTOMER") {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#1E3A8A] mb-3 tracking-tight">
            Lịch sử đơn hàng
          </h1>
          <p className="text-gray-500 text-lg">
            Quản lý và theo dõi quá trình vận chuyển đơn hàng của bạn
          </p>
        </div>

        {/* Tabs & Search Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 md:p-8 space-y-8">

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-100/50 rounded-xl overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`relative px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 transform ${activeTab === tab.key
                      ? "bg-[#1E3A8A] text-white shadow-lg scale-105"
                      : "text-gray-600 hover:bg-gray-200 hover:text-[#1E3A8A]"
                    }`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 text-gray-800 rounded-full focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all duration-300 shadow-inner"
              />
              <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-hover:text-[#1E3A8A] transition-colors" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#1E3A8A] text-white p-2.5 rounded-full shadow-md hover:bg-blue-800 transition-all hover:scale-110 active:scale-95"
              >
                <AiOutlineSearch className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1E3A8A] border-t-transparent"></div>
              <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <AiOutlineInbox className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Bạn chưa có đơn hàng nào trong mục này. Hãy tiếp tục mua sắm nhé!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1E3A8A] text-white text-left text-xs uppercase tracking-wider font-bold">
                    <th className="px-8 py-5 rounded-tl-lg">#</th>
                    <th className="px-8 py-5">Mã đơn hàng</th>
                    <th className="px-8 py-5">Ngày đặt</th>
                    <th className="px-8 py-5 text-right">Tổng tiền</th>
                    <th className="px-8 py-5 text-center">Trạng thái</th>
                    <th className="px-8 py-5 text-center rounded-tr-lg">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/30 transition-colors duration-200 group"
                    >
                      <td className="px-8 py-6 text-gray-500 font-medium">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-[#1E3A8A] group-hover:underline cursor-pointer" onClick={() => handleViewOrderDetails(order.id)}>
                          {order.orderCode}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-gray-600">
                        {formatDate(order.createDate)}
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-rose-600">
                        {formatCurrency(order.totalBill)}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={getStatusClass(order.statusOrder)}>
                          {orderStatusMap[order.statusOrder] || "Không xác định"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => handleViewOrderDetails(order.id)}
                          className="p-2.5 rounded-full text-gray-400 hover:bg-[#1E3A8A] hover:text-white transition-all transform hover:scale-110 active:scale-95"
                          title="Xem chi tiết"
                        >
                          <AiOutlineEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && displayedOrders.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 font-medium">
                Hiển thị trang <span className="text-gray-900 font-bold">{currentPage}</span> trên <span className="text-gray-900 font-bold">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >«</button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >‹</button>

                {getPageNumbers().map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === num
                        ? "bg-[#1E3A8A] text-white shadow-lg scale-105"
                        : "bg-white border text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >›</button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >»</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden transform transition-all">

              {/* Modal Header */}
              <div className="bg-[#1E3A8A] px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    Chi tiết đơn hàng
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono text-white/90">
                      #{selectedOrder.orderCode}
                    </span>
                  </h2>
                  <p className="text-blue-200 text-sm mt-1">
                    Ngày đặt: {formatDate(selectedOrder.createDate)}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 max-h-[80vh] overflow-y-auto">

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#1E3A8A] border-b border-blue-100 pb-2 mb-4">
                        Thông tin khách hàng
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Họ tên:</span>
                          <span className="font-medium text-gray-900">{selectedOrder.customer?.fullname || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Số điện thoại:</span>
                          <span className="font-medium text-gray-900">{selectedOrder.phone || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Địa chỉ giao hàng:</span>
                          <span className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {selectedOrder.address || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#1E3A8A] border-b border-blue-100 pb-2 mb-4">
                        Thông tin thanh toán
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Phương thức:</span>
                          <span className="font-bold text-[#1E3A8A] bg-blue-50 px-3 py-1 rounded-full text-sm">
                            {selectedOrder.paymentMethod === 1 ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán Online"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ghi chú:</span>
                          <span className="font-medium text-gray-900">{selectedOrder.note || "Không có"}</span>
                        </div>
                        {selectedOrder.voucher && (
                          <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-bold text-green-800">Voucher: {selectedOrder.voucher.voucherName}</div>
                              <div className="text-sm text-green-600">{selectedOrder.voucher.description}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-center text-lg font-bold text-[#1E3A8A] mb-8">Tiến độ đơn hàng</h3>
                  <OrderTimeline currentStatus={selectedOrder.statusOrder} onCancelOrder={handleCancelOrder} />
                </div>

                {/* Product List */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#1E3A8A] border-b border-blue-100 pb-2 mb-4">
                    Sản phẩm ({selectedOrder.orderDetails?.length || 0})
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#1E3A8A] text-white">
                        <tr>
                          <th className="py-3 px-4 text-left">Sản phẩm</th>
                          <th className="py-3 px-4 text-center">Phân loại</th>
                          <th className="py-3 px-4 text-center">Đơn giá</th>
                          <th className="py-3 px-4 text-center">SL</th>
                          <th className="py-3 px-4 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedOrder.orderDetails?.map((detail, idx) => {
                          const product = detail.productDetail?.product || {};
                          const productDetail = detail.productDetail || {};
                          const photo = productDetail.photo || product.photo || "https://via.placeholder.com/60";
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-4">
                                  <img src={photo} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                  <div>
                                    <p className="font-bold text-gray-800 line-clamp-1">{product.productName}</p>
                                    <p className="text-xs text-gray-500 mt-1">Mã: {productDetail.productDetailCode}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="flex flex-col gap-1 text-xs text-gray-600">
                                  <span className="bg-gray-100 px-2 py-1 rounded">Màu: {productDetail.color?.name}</span>
                                  <span className="bg-gray-100 px-2 py-1 rounded">Size: {productDetail.size?.name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center font-medium text-gray-700">
                                {formatCurrency(detail.price)}
                              </td>
                              <td className="py-4 px-4 text-center font-bold text-[#1E3A8A]">
                                x{detail.quantity}
                              </td>
                              <td className="py-4 px-4 text-right font-bold text-gray-900">
                                {formatCurrency(detail.price * detail.quantity)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Footer */}
                <div className="flex flex-col items-end gap-3 border-t border-gray-100 pt-6">
                  <div className="flex justify-between w-full max-w-xs text-gray-600">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.shipfee)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">-{formatCurrency((selectedOrder.totalAmount + selectedOrder.shipfee) - selectedOrder.totalBill)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-xl font-bold text-[#1E3A8A] border-t border-gray-200 pt-3 mt-1">
                    <span>Tổng thanh toán:</span>
                    <span>{formatCurrency(selectedOrder.totalBill)}</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all"
                >
                  Đóng cửa sổ
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrder;
