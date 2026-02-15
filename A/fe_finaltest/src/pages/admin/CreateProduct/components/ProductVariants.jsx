import React, { useState, useEffect, useCallback } from "react";
import { FaTrash, FaFileImage } from "react-icons/fa";
import { AiFillWarning } from "react-icons/ai";
import { toast } from "react-toastify";
import ProductDetailService from "../../../../services/ProductDetailService";
import UploadFileService from "../../../../services/UploadFileService";
import { useNavigate } from "react-router-dom";

export default function ProductVariants({ generateData }) {
  const navigate = useNavigate();
  const [variantsList, setVariantsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0); // Track số lượng ảnh đang upload

  const handleOpenModal = (event) => {
    event.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirmSave = () => {
    handleSave();
    handleCloseModal();
  };

  const generateProductDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ProductDetailService.generateProductDetails(generateData);
      console.log("response", response);

      if (response) {
        const productDetails = response.map((item) => ({
          colorId: item.color,
          colorName: item.colorName,
          productName: item.productName,
          variants: item.productDetails.map((detail) => ({
            productId: detail.productId,
            size: detail.size,
            sizeName: detail.sizeName,
            color: detail.color,
            collar: detail.collar,
            sleeve: detail.sleeve,
            promotion: detail.promotion,
            importPrice: detail.importPrice,
            salePrice: detail.salePrice,
            quantity: detail.quantity,
            description: detail.description,
            photo: detail.photo,
            brandName: detail.brandName,
            collarName: detail.collarName,
            sleeveName: detail.sleeveName,
            promotionName: detail.promotionName,
          })),
        }));

        setVariantsList(productDetails);
      } else {
        setError("Không có dữ liệu chi tiết sản phẩm.");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tạo chi tiết sản phẩm.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [generateData]);

  useEffect(() => {
    if (generateData && Object.keys(generateData).length > 0) {
      generateProductDetails();
    }
  }, [generateData, generateProductDetails]);

  const handleInputChange = (colorIndex, variantIndex, field, value) => {
    const updatedVariantsList = [...variantsList];

    if (updatedVariantsList[colorIndex]?.variants) {
      updatedVariantsList[colorIndex].variants = updatedVariantsList[colorIndex].variants.map(
        (variant, index) => {
          if (index === variantIndex) {
            return { ...variant, [field]: value };
          }
          return variant;
        }
      );
      setVariantsList(updatedVariantsList);
    }
  };

  const handleRemoveVariant = (colorIndex, variantIndex) => {
    const updatedVariantsList = [...variantsList];
    updatedVariantsList[colorIndex].variants.splice(variantIndex, 1);
    setVariantsList(updatedVariantsList);
  };

  const isVariantsListValid = () => {
    if (!variantsList || variantsList.length === 0) return false;

    // Kiểm tra xem có ảnh nào đang upload không
    if (uploadingCount > 0) return false;

    return variantsList.every((variantData) =>
      variantData.variants.every(
        (variant) =>
          variant.quantity > 0 &&
          variant.salePrice > 0 &&
          variant.importPrice > 0 &&
          variant.productId &&
          variant.size &&
          variant.color &&
          variant.photo && // Phải có ảnh
          !variant.uploading // Không có variant nào đang upload
      )
    );
  };

  const handleImageUpload = async (colorIndex, variantIndex, file) => {
    if (!file) return;

    // Tăng số lượng đang upload
    setUploadingCount(prev => prev + 1);

    try {
      const fileURL = URL.createObjectURL(file);

      // Hiển thị preview và đánh dấu đang upload
      setVariantsList((prevList) => {
        const updated = [...prevList];
        updated[colorIndex].variants[variantIndex] = {
          ...updated[colorIndex].variants[variantIndex],
          previewImage: fileURL,
          uploading: true, // Đánh dấu đang upload
        };
        return updated;
      });

      // Upload ảnh lên server
      const uploadedImageUrl = await UploadFileService.uploadProductImage(file);

      // Lưu URL ảnh đã upload và bỏ đánh dấu uploading
      setVariantsList((prevList) => {
        const updated = [...prevList];
        updated[colorIndex].variants[variantIndex] = {
          ...updated[colorIndex].variants[variantIndex],
          photo: uploadedImageUrl,
          uploading: false,
        };
        return updated;
      });

      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");

      // Xóa uploading flag nếu lỗi
      setVariantsList((prevList) => {
        const updated = [...prevList];
        updated[colorIndex].variants[variantIndex] = {
          ...updated[colorIndex].variants[variantIndex],
          uploading: false,
        };
        return updated;
      });
    } finally {
      // Giảm số lượng đang upload
      setUploadingCount(prev => prev - 1);
    }
  };

  const handleSave = () => {
    const productDetailData = [];

    variantsList.forEach((variantData) => {
      variantData.variants.forEach((variant) => {
        // Mỗi variant là 1 request riêng
        const newVariant = {
          productId: variant.productId,
          sizeId: [variant.size],        // Array với 1 phần tử
          colorId: [variant.color],      // Array với 1 phần tử
          collarId: [variant.collar],    // Array với 1 phần tử
          sleeveId: [variant.sleeve],    // Array với 1 phần tử
          promotionId: variant.promotion,
          photo: variant.photo || null,  // Ảnh riêng cho variant này
          importPrice: variant.importPrice,
          salePrice: variant.salePrice,
          quantity: variant.quantity,
          description: variant.description || "Chưa có mô tả",
        };

        productDetailData.push(newVariant);
      });
    });

    ProductDetailService.createProductDetail(productDetailData)
      .then((response) => {
        console.log("Dữ liệu chi tiết sản phẩm đã được lưu", response);
        toast.success("Dữ liệu chi tiết sản phẩm đã được lưu thành công!");

        const productCode = response?.[0]?.product.productCode;
        if (productCode) {
          navigate(`/admin/product/${productCode}`);
        }
      })
      .catch((error) => {
        console.error("Có lỗi xảy ra khi lưu chi tiết sản phẩm", error);
        toast.error("Có lỗi xảy ra khi lưu chi tiết sản phẩm.");
      });
  };

  return (
    <div className="h-full rounded-xl flex flex-col">
      {error && <div className="text-red-500 mb-4 p-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-[#1E3A8A] rounded-full"></div>
        </div>
      ) : variantsList.length === 0 ? (
        <div className="h-full p-8 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 flex items-center justify-center bg-orange-50 rounded-full mb-4">
            <AiFillWarning className="text-5xl text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sản phẩm đã tồn tại
          </h3>
          <p className="text-gray-600 max-w-md">
            Vui lòng chọn thuộc tính khác hoặc kiểm tra lại sản phẩm.
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto p-6">
          <h2 className="text-lg font-bold text-[#1E3A8A] mb-4 pb-2 border-b border-gray-200">
            Chi tiết các biến thể sản phẩm
          </h2>

          {/* Main Table with All Variants */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm mb-6">
            <table className="min-w-full">
              <thead className="bg-[#1E3A8A] text-white">
                <tr>
                  {["STT", "SẢN PHẨM", "GIÁ NHẬP", "GIÁ BÁN", "SỐ LƯỢNG", "HÌNH ẢNH", "XÓA"].map((header) => (
                    <th key={header} className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {variantsList.flatMap((variantData, colorIdx) =>
                  variantData.variants.map((variant, variantIdx) => {
                    const globalIndex = variantsList
                      .slice(0, colorIdx)
                      .reduce((sum, vd) => sum + vd.variants.length, 0) + variantIdx;

                    return (
                      <tr key={`${variant.color}-${variant.size}-${colorIdx}-${variantIdx}`} className="border-b border-gray-200 hover:bg-indigo-50 transition-colors duration-200">
                        <td className="py-3 px-4 font-medium text-gray-800 text-sm whitespace-nowrap">{globalIndex + 1}</td>
                        <td className="py-3 px-4 text-gray-700 font-medium text-sm min-w-[280px]">
                          {`${variant.collarName} - ${variant.sleeveName} - ${variant.sizeName} - ${variantData.colorName}`}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={variant.importPrice}
                            onChange={(e) => handleInputChange(colorIdx, variantIdx, "importPrice", e.target.value)}
                            placeholder="Giá nhập"
                            className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 text-sm bg-gray-50 hover:bg-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={variant.salePrice}
                            onChange={(e) => handleInputChange(colorIdx, variantIdx, "salePrice", e.target.value)}
                            placeholder="Giá bán"
                            className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 text-sm bg-gray-50 hover:bg-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={variant.quantity}
                            onChange={(e) => handleInputChange(colorIdx, variantIdx, "quantity", e.target.value)}
                            placeholder="Số lượng"
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 text-sm bg-gray-50 hover:bg-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-16 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#1E3A8A] transition-colors duration-300 relative overflow-hidden">
                            <label className="cursor-pointer w-full h-full flex items-center justify-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(colorIdx, variantIdx, e.target.files[0])}
                                className="hidden"
                              />
                              {variant.previewImage || variant.photo ? (
                                <>
                                  <img
                                    src={variant.previewImage || variant.photo}
                                    alt="Ảnh sản phẩm"
                                    className="w-full h-full object-cover rounded"
                                  />
                                  {variant.uploading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <FaFileImage className="text-gray-400 text-xl mb-0.5" />
                                  <span className="text-[10px] text-gray-500">Chọn</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleRemoveVariant(colorIdx, variantIdx)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 flex items-center justify-center transition-all duration-200 shadow-sm border border-red-200 mx-auto"
                            title="Xóa"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isVariantsListValid() && (
        <div className="p-6 flex justify-end mt-auto border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleOpenModal}
            disabled={uploadingCount > 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-95 ${uploadingCount > 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-[#1E3A8A] text-white hover:bg-[#163172]'
              }`}
          >
            {uploadingCount > 0 ? `Đang tải ${uploadingCount} ảnh...` : 'Lưu chi tiết sản phẩm'}
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-2xl shadow-2xl w-[500px] max-w-lg text-center flex flex-col items-center">
            <div className="w-20 h-20 flex items-center justify-center bg-orange-50 rounded-full mb-4">
              <AiFillWarning className="text-5xl text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Xác nhận lưu</h3>
            <p className="text-gray-600 text-base mb-6">
              Vui lòng xác nhận trước khi lưu chi tiết sản phẩm?
            </p>
            <div className="flex justify-center gap-4 w-full">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors duration-300 border border-transparent hover:border-gray-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-semibold hover:bg-[#163172] transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-95"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}