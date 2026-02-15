import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import ProductDetailService from "../../../../services/ProductDetailService";
import UploadFileService from "../../../../services/UploadFileService";
import PromotionService from "../../../../services/PromotionServices";
import Barcode from "react-barcode";
export default function ProductUpdateModal({
  modalVisible,
  currentProduct,
  onClose,
  onUpdate,
  collars,
  sleeves,
  colors,
  sizes,
  promotions,
}) {
  const [quantity, setQuantity] = useState("");
  const [importPrice, setImportPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [collar, setCollar] = useState(null);
  const [sleeve, setSleeve] = useState(null);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (currentProduct) {
      setQuantity(currentProduct.quantity || "");
      setImportPrice(currentProduct.importPrice || "");
      setSalePrice(currentProduct.salePrice || "");
      setDescription(currentProduct.description || "");
      setPhoto(currentProduct.photo || "");
      setCollar(
        currentProduct.collar
          ? {
            value: currentProduct.collar.id,
            label: currentProduct.collar.name,
          }
          : null
      );
      setSleeve(
        currentProduct.sleeve
          ? {
            value: currentProduct.sleeve.id,
            label: currentProduct.sleeve.sleeveName,
          }
          : null
      );
      setColor(
        currentProduct.color
          ? { value: currentProduct.color.id, label: currentProduct.color.name }
          : null
      );
      setSize(
        currentProduct.size
          ? { value: currentProduct.size.id, label: currentProduct.size.name }
          : null
      );
      setPromotion(
        currentProduct.promotion
          ? {
            value: currentProduct.promotion.id,
            label: currentProduct.promotion.promotionName,
          }
          : null
      );
    }
  }, [currentProduct]);
  const handleUpdateSubmit = async () => {
    const productData = {
      productId: currentProduct.product.id,
      collarId: collar?.value,
      sleeveId: sleeve?.value,
      colorId: color?.value,
      sizeId: size?.value,
      promotionId: promotion?.value,
      quantity: Number(quantity),
      importPrice: Number(importPrice),
      salePrice: Number(salePrice),
      description: description,
      photo: selectedImage || photo,
    };
    try {
      const result = await ProductDetailService.updateProductDetail(
        currentProduct.id,
        productData
      );
      onUpdate(result);
      toast.success("Cập nhật sản phẩm thành công!");
      setPreviewImage("");
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      const errorMessage = error.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại!";
      toast.error(errorMessage);
    }
  };
  if (!modalVisible) return null;

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#1E3A8A' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #1E3A8A' : 'none',
      '&:hover': {
        borderColor: '#1E3A8A',
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#1E3A8A' : state.isFocused ? '#DBEAFE' : 'white',
      color: state.isSelected ? 'white' : '#1F2937',
    }),
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/png"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Chỉ hỗ trợ định dạng JPEG, PNG!");
      return;
    }

    setIsUploading(true);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    fileReader.readAsDataURL(file);

    try {
      const uploadedImageUrl = await UploadFileService.uploadProductImage(file);

      setPreviewImage(uploadedImageUrl);
      setSelectedImage(uploadedImageUrl);
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Lỗi tải ảnh lên Firebase:", error);
      toast.error("Tải ảnh thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setQuantity("");
    setImportPrice("");
    setSalePrice("");
    setDescription("");
    setPhoto("");
    setCollar(null);
    setSleeve(null);
    setColor(null);
    setSize(null);
    setPromotion(null);
    setSelectedImage(null);
    setPreviewImage("");

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1E3A8A] px-8 py-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-5"></div>
          <h2 className="text-3xl font-bold text-white text-center relative z-10">
            Cập nhật chi tiết sản phẩm
          </h2>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Thông tin sản phẩm */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-l-4 border-[#1E3A8A]">
                <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Thông tin chi tiết
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cổ áo
                  </label>
                  <Select
                    value={collar}
                    onChange={(option) => setCollar(option)}
                    options={collars.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    styles={customSelectStyles}
                    placeholder="Chọn cổ áo"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tay áo
                  </label>
                  <Select
                    value={sleeve}
                    onChange={(option) => setSleeve(option)}
                    options={sleeves.map((item) => ({
                      value: item.id,
                      label: item.sleeveName,
                    }))}
                    styles={customSelectStyles}
                    placeholder="Chọn tay áo"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Màu sắc
                  </label>
                  <Select
                    value={color}
                    onChange={(option) => setColor(option)}
                    options={colors.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    styles={customSelectStyles}
                    placeholder="Chọn màu sắc"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kích thước
                  </label>
                  <Select
                    value={size}
                    onChange={(option) => setSize(option)}
                    options={sizes.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    styles={customSelectStyles}
                    placeholder="Chọn kích thước"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Khuyến mãi
                  </label>
                  <Select
                    value={promotion}
                    onChange={(option) => setPromotion(option)}
                    options={promotions
                      .filter((item) => item.status === true)
                      .map((item) => ({
                        value: item.id,
                        label: item.promotionName,
                      }))}
                    styles={customSelectStyles}
                    placeholder="Chọn khuyến mãi"
                    isClearable
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                    placeholder="Nhập số lượng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá nhập
                  </label>
                  <input
                    type="number"
                    value={importPrice}
                    onChange={(e) => setImportPrice(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                    placeholder="Nhập giá nhập"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đơn giá
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                    placeholder="Nhập giá bán"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm resize-none"
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>
              </div>
            </div>

            {/* Hình ảnh sản phẩm */}
            <div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-l-4 border-[#1E3A8A]">
                <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Hình ảnh
                </h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-dashed border-[#1E3A8A] relative group hover:border-[#2563EB] transition-all duration-300 shadow-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {previewImage || photo ? (
                  <div className="relative">
                    <img
                      src={previewImage || photo}
                      className="w-full h-52 object-contain rounded-lg shadow-md"
                      onError={() =>
                        previewImage ? setPreviewImage(null) : setPhoto(null)
                      }
                      alt="Product Image"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
                          <p className="text-white mt-2 font-semibold">Đang tải ảnh...</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg flex items-end justify-center pb-4">
                      <div className="text-white text-sm font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Nhấn để thay đổi ảnh
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-52">
                    <div className="bg-[#1E3A8A] bg-opacity-10 rounded-full p-4 mb-3">
                      <svg className="w-10 h-10 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-semibold mb-1">
                      Kéo thả ảnh vào đây
                    </p>
                    <p className="text-[#1E3A8A] text-sm font-medium cursor-pointer hover:underline">
                      hoặc nhấn để chọn ảnh
                    </p>
                    <p className="text-gray-400 text-xs mt-2">Hỗ trợ: JPEG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* Mã vạch sản phẩm */}
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-3 text-center flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Mã vạch sản phẩm
                </h3>
                <div className="flex justify-center bg-white rounded-lg p-3">
                  {currentProduct?.productDetailCode && (
                    <Barcode
                      value={currentProduct.productDetailCode}
                      height={60}
                      width={1.8}
                      fontSize={13}
                      background="#ffffff"
                      lineColor="#000000"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdateSubmit}
              disabled={isUploading}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${isUploading
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white hover:from-[#163172] hover:to-[#1E3A8A]"
                }`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Đang tải ảnh...
                </span>
              ) : (
                "Cập nhật sản phẩm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
