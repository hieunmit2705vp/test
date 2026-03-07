import React, { useState, useEffect, useCallback } from "react";
import PromotionService from "../../../../services/PromotionServices";
import { toast } from "react-toastify";
import { AiOutlineEdit, AiOutlinePlus, AiOutlineSearch, AiOutlineFilter, AiOutlineCalendar } from "react-icons/ai";
import CreatePromotionModal from "./components/CreateModal";
import UpdateModal from "./components/UpdateModal";

// Hàm định dạng thời gian sang yyyy-MM-dd HH:mm:ss
const formatDateTime = (date) => {
  if (isNaN(date.getTime())) return null; // Kiểm tra nếu date không hợp lệ
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function Promotion() {
  const [promotions, setPromotions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [percentRange, setPercentRange] = useState({ min: "", max: "" });
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const fetchPromotions = useCallback(async () => {
    try {
      const startDateFormatted = dateRange.start
        ? formatDateTime(new Date(dateRange.start))
        : null;
      const endDateFormatted = dateRange.end
        ? formatDateTime(new Date(dateRange.end))
        : null;

      const { content, totalPages } = await PromotionService.getAllPromotions(
        search || "",
        currentPage,
        pageSize,
        sortConfig.key,
        sortConfig.direction,
        startDateFormatted,
        endDateFormatted,
        percentRange.min ? Number(percentRange.min) : null,
        percentRange.max ? Number(percentRange.max) : null,
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : null
      );

      setPromotions(content || []);
      setTotalPages(totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khuyến mãi", error);
      toast.error("Lỗi khi tải dữ liệu khuyến mãi");
      setPromotions([]);
      setTotalPages(1);
    }
  }, [
    search,
    currentPage,
    pageSize,
    sortConfig,
    dateRange,
    percentRange,
    statusFilter,
  ]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(0);
  };

  const handleDateFilter = (field) => (event) => {
    const value = event.target.value;
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(0);
  };

  const handlePercentFilter = (field) => (event) => {
    const value = event.target.value;
    setPercentRange((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(0);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDateRange({ start: "", end: "" });
    setPercentRange({ min: "", max: "" });
    setStatusFilter("");
    setCurrentPage(0);
  };

  const handleUpdatePromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setUpdateModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1E3A8A] mb-8 border-b-2 border-[#1E3A8A] pb-2 inline-block">
          Quản Lý Khuyến Mãi
        </h1>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-[#1E3A8A] font-semibold text-lg border-b border-gray-100 pb-2">
            <AiOutlineFilter className="text-xl" />
            Bộ Lọc Tìm Kiếm
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tên khuyến mãi..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-shadow bg-gray-50"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Percent Range */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Phần trăm giảm (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-gray-50 text-center"
                  value={percentRange.min}
                  onChange={handlePercentFilter("min")}
                  min="0"
                  max="100"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-gray-50 text-center"
                  value={percentRange.max}
                  onChange={handlePercentFilter("max")}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Date Range (Hidden in comment in original but functional in code? Uncommented for better UI if needed, but keeping commented logic if backend supports it. Original code had it commented out in UI but logic present. I'll enable it properly if logic exists.) 
              Original file had commented out UI for date. I will leave it out to avoid confusion if it's not ready, 
              OR I can add it if I'm confident. The logic `handleDateFilter` exists. 
              Reviewing: "Original code had it commented out". I will respect that and keep it available but maybe not prominently displayed if broken? 
              Actually, I'll follow the exact visible elements from original but heavily styled.
              Wait, the original file has logical code for date but the JSX is commented out. 
              I'll keep it commented out or omitted to match original UI behavior. 
           */}

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-gray-50"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>

            {/* Filter Actions */}
            <div className="flex items-end gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                onClick={handleResetFilters}
              >
                Đặt lại
              </button>
              <button
                className="flex-1 bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg hover:bg-[#163172] transition-all duration-300 font-medium shadow-md flex items-center justify-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <AiOutlinePlus /> Thêm Mới
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700">
              <thead className="bg-[#1E3A8A] text-white uppercase text-sm leading-normal">
                <tr>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center w-16">STT</th>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center w-20">ID</th>
                  <th className="py-4 px-6 font-semibold tracking-wider">Tên KM</th>
                  <th className="py-4 px-6 font-semibold tracking-wider w-1/4">Mô tả</th>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center">Giảm giá</th>
                  <th className="py-4 px-6 font-semibold tracking-wider">Thời gian</th>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-base font-light">
                {promotions.map((item, index) => {
                  const startDate = new Date(item.startDate);
                  const endDate = new Date(item.endDate);
                  return (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-indigo-50 transition-colors duration-200">
                      <td className="py-4 px-6 text-center font-medium">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-gray-700">
                        #{item.id}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {item.promotionName}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 italic max-w-xs truncate" title={item.description}>
                        {item.description}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-orange-100 text-orange-700 py-1 px-3 rounded-full font-bold text-xs border border-orange-200">
                          {item.promotionPercent}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-green-700 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100 inline-block w-fit">
                            Bắt đầu: {startDate.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-red-700 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100 inline-block w-fit">
                            Kết thúc: {endDate.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide border ${item.status
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                        >
                          {item.status ? "Kích hoạt" : "Vô hiệu"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center justify-center transition-all duration-200 shadow-sm border border-blue-200 mx-auto"
                          onClick={() => handleUpdatePromotion(item)}
                          title="Chỉnh sửa"
                        >
                          <AiOutlineEdit size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {promotions.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500 italic">
                      Không tìm thấy chương trình khuyến mãi nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm text-gray-700">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <span className="text-sm font-medium text-gray-600">Hiển thị</span>
            <select
              id="entries"
              className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-white shadow-sm text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              {[5, 10, 20].map((size) => (
                <option key={size} value={size}>
                  {size} hàng
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${currentPage === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:text-[#1E3A8A] hover:border-[#1E3A8A] shadow-sm transform active:scale-95"
                }`}
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Trước
            </button>
            <span className="text-sm font-semibold px-4 text-[#1E3A8A]">
              Trang {currentPage + 1} / {totalPages || 1}
            </span>
            <button
              className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${currentPage >= totalPages - 1 || totalPages === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:text-[#1E3A8A] hover:border-[#1E3A8A] shadow-sm transform active:scale-95"
                }`}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1 || totalPages === 0}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <CreatePromotionModal
        isOpen={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        fetchPromotions={fetchPromotions}
      />
      <UpdateModal
        isOpen={updateModal}
        setUpdateModal={setUpdateModal}
        fetchPromotions={fetchPromotions}
        selectedPromotion={selectedPromotion}
      />
    </div>
  );
}
