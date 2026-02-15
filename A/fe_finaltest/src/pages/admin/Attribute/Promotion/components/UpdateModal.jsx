import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import PromotionService from "../../../../../services/PromotionServices";

Modal.setAppElement("#root");

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const UpdateModal = ({
  isOpen,
  setUpdateModal,
  fetchPromotions,
  selectedPromotion,
}) => {
  const [promotion, setPromotion] = useState({
    promotionName: "",
    promotionPercent: "",
    description: "",
    startDate: "",
    endDate: "",
    status: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedPromotion) {
      setPromotion({
        promotionName: selectedPromotion.promotionName || "",
        promotionPercent: selectedPromotion.promotionPercent || "",
        description: selectedPromotion.description || "",
        startDate: selectedPromotion.startDate
          ? new Date(selectedPromotion.startDate).toISOString().slice(0, 16) // Định dạng yyyy-MM-ddThh:mm cho datetime-local
          : "",
        endDate: selectedPromotion.endDate
          ? new Date(selectedPromotion.endDate).toISOString().slice(0, 16)
          : "",
        status: selectedPromotion.status ?? true,
      });
      setErrors({});
    }
  }, [selectedPromotion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotion((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!promotion.promotionName.trim()) {
      newErrors.promotionName = "Tên khuyến mãi không được để trống!";
    } else if (promotion.promotionName.length > 255) {
      newErrors.promotionName = "Tên khuyến mãi không được vượt quá 255 ký tự!";
    }

    if (!promotion.promotionPercent) {
      newErrors.promotionPercent = "Phần trăm giảm giá không được để trống!";
    } else {
      const percent = Number(promotion.promotionPercent);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        newErrors.promotionPercent = "Phần trăm giảm giá phải từ 0 đến 100!";
      }
    }

    if (!promotion.description.trim()) {
      newErrors.description = "Mô tả không được để trống!";
    } else if (promotion.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự!";
    }

    if (!promotion.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống!";
    } else if (isNaN(new Date(promotion.startDate).getTime())) {
      newErrors.startDate = "Ngày và giờ bắt đầu không hợp lệ!";
    }

    if (!promotion.endDate) {
      newErrors.endDate = "Ngày kết thúc không được để trống!";
    } else if (isNaN(new Date(promotion.endDate).getTime())) {
      newErrors.endDate = "Ngày và giờ kết thúc không hợp lệ!";
    } else if (promotion.startDate) {
      const start = new Date(promotion.startDate);
      const end = new Date(promotion.endDate);
      if (end <= start) {
        newErrors.endDate = "Ngày và giờ kết thúc phải sau ngày bắt đầu!";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    try {
      const updatedPromotion = {
        promotionName: promotion.promotionName,
        promotionPercent: parseInt(promotion.promotionPercent),
        description: promotion.description,
        startDate: formatDateTime(new Date(promotion.startDate)),
        endDate: formatDateTime(new Date(promotion.endDate)),
        status: promotion.status,
      };

      await PromotionService.updatePromotion(
        selectedPromotion.id,
        updatedPromotion
      );
      toast.success("Cập nhật khuyến mãi thành công!");
      fetchPromotions();
      setUpdateModal(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật khuyến mãi:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi không xác định từ server!";
      toast.error(`Lỗi khi cập nhật khuyến mãi: ${errorMessage}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setUpdateModal(false)}
      contentLabel="Cập nhật khuyến mãi"
      className="bg-white p-8 rounded-2xl shadow-2xl max-w-xl mx-auto mt-10 outline-none transform transition-all overflow-y-auto max-h-[90vh]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center pt-10 z-50 backdrop-blur-sm"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A] uppercase tracking-wide">
          Cập Nhật Khuyến Mãi
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
              Tên Khuyến Mãi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="promotionName"
              value={promotion.promotionName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white ${errors.promotionName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="Nhập tên chương trình khuyến mãi"
            />
            {errors.promotionName && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.promotionName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                Giảm giá (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="promotionPercent"
                value={promotion.promotionPercent}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white ${errors.promotionPercent ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                  }`}
                min="0"
                max="100"
              />
              {errors.promotionPercent && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.promotionPercent}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={promotion.status}
                onChange={(e) =>
                  setPromotion((prev) => ({
                    ...prev,
                    status: e.target.value === "true",
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white"
              >
                <option value={true}>Kích hoạt</option>
                <option value={false}>Không kích hoạt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={promotion.description}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white resize-none ${errors.description ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              rows="3"
              placeholder="Mô tả chi tiết khuyến mãi..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                Ngày và giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={promotion.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white ${errors.startDate ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                  }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                Ngày và giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={promotion.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white ${errors.endDate ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                  }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setUpdateModal(false)}
              className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors duration-300 border border-transparent hover:border-gray-200"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-semibold hover:bg-[#163172] transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-95"
            >
              Cập Nhật
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateModal;
