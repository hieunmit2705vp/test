import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProductService from "../../services/ProductService";
import CartService from "../../services/CartService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHeart, FaStar, FaShippingFast, FaShieldAlt, FaUndo, FaHeadset, FaCheckCircle, FaChevronRight, FaShoppingCart, FaBolt } from "react-icons/fa";

const ViewProductDetail = () => {
  const { productCode } = useParams();
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableCollars, setAvailableCollars] = useState([]);
  const [availableSleeves, setAvailableSleeves] = useState([]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await ProductService.getProductDetailsByProductCode(productCode);
        if (details && details.length > 0) {
          const updatedDetails = details.map((detail) => ({
            ...detail,
            isFavorite: false,
          }));
          setProductDetails(updatedDetails);

          // Default select the first one or try to find a default if needed
          setSelectedDetail(updatedDetails[0]);
          setSelectedImage(updatedDetails[0].photo || "");

          // Extract variants
          const uniqueValues = (key, subKey = null) => [
            ...new Set(updatedDetails.map(d => subKey ? d[key]?.[subKey] : d[key]).filter(Boolean))
          ];

          setAvailableColors(uniqueValues("color", "name"));
          setAvailableSizes(uniqueValues("size", "name"));
          setAvailableCollars(uniqueValues("collar", "name"));
          setAvailableSleeves(uniqueValues("sleeve", "sleeveName"));

        } else {
          setError("Không tìm thấy sản phẩm hoặc biến thể nào với mã: " + productCode);
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        setError("Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    if (productCode) fetchProductDetails();
    else {
      setError("Mã sản phẩm không hợp lệ!");
      setLoading(false);
    }
  }, [productCode]);

  // Variant Change Handlers
  const handleVariantChange = (type, value) => {
    // Find the best matching variant based on current selection + new change
    // Priority: Color > Size > Collar > Sleeve (or whatever makes sense)
    // Simple logic: Try to find exact match with other current attributes, fallback to first one with new attribute

    let match = productDetails.find(d => {
      const isColorMatch = type === 'color' ? d.color?.name === value : d.color?.name === selectedDetail.color?.name;
      const isSizeMatch = type === 'size' ? d.size?.name === value : d.size?.name === selectedDetail.size?.name;
      const isCollarMatch = type === 'collar' ? d.collar?.name === value : d.collar?.name === selectedDetail.collar?.name;
      const isSleeveMatch = type === 'sleeve' ? d.sleeve?.sleeveName === value : d.sleeve?.sleeveName === selectedDetail.sleeve?.sleeveName;

      // This is strict matching. If strict fails, we might want loose matching.
      return isColorMatch && isSizeMatch && isCollarMatch && isSleeveMatch;
    });

    if (!match) {
      // Fallback: Just find the first one that has this new attribute value
      match = productDetails.find(d => {
        if (type === 'color') return d.color?.name === value;
        if (type === 'size') return d.size?.name === value;
        if (type === 'collar') return d.collar?.name === value;
        if (type === 'sleeve') return d.sleeve?.sleeveName === value;
        return false;
      });
    }

    if (match) {
      setSelectedDetail(match);
      if (match.photo) setSelectedImage(match.photo);
    }
  };

  const validateQuantity = (value) => {
    if (!value || value <= 0) {
      toast.warning("Số lượng phải ít nhất là 1");
      return 1;
    }
    if (value > selectedDetail.quantity) {
      toast.warning(`Chỉ còn ${selectedDetail.quantity} sản phẩm trong kho`);
      return selectedDetail.quantity;
    }
    return value;
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(validateQuantity(isNaN(value) ? 1 : value));
  };

  const handleAddToCart = async () => {
    if (!selectedDetail) return;

    // Validate quantity but proceed with the validated value
    const validatedQuantity = validateQuantity(quantity);
    if (validatedQuantity !== quantity) {
      setQuantity(validatedQuantity);
      // Don't return here, proceed with validatedQuantity
    }

    const toastId = toast.loading("Đang thêm vào giỏ hàng...", { autoClose: false });

    try {
      setIsLoadingCart(true);
      await CartService.addProductToCart({
        productDetailId: selectedDetail.id,
        quantity: validatedQuantity, // Use the validated value directly
      });
      toast.update(toastId, { render: "Đã thêm vào giỏ hàng thành công!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.update(toastId, { render: "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsLoadingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedDetail) return;
    const validatedQuantity = validateQuantity(quantity);
    // ... logic setup for payment ...
    // Simplify for now as per existing logic, verify if needed
    const salePrice = selectedDetail.salePrice || 0;
    const promotionPercent = selectedDetail.promotion?.promotionPercent || 0;
    const discountPrice = promotionPercent ? salePrice * (1 - promotionPercent / 100) : salePrice;

    navigate("/pay", {
      state: {
        items: [{
          id: selectedDetail.id,
          productDetailId: selectedDetail.id,
          productName: selectedDetail.product?.productName,
          /* ... map other fields ... */
          price: salePrice,
          discountPrice: discountPrice,
          quantity: validatedQuantity,
          photo: selectedDetail.photo,
          /* ... */
        }],
        totalAmount: discountPrice * validatedQuantity,
        totalItems: validatedQuantity,
      },
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!selectedDetail) return <div className="min-h-screen flex items-center justify-center">Sản phẩm không tồn tại</div>;

  const salePrice = selectedDetail.salePrice || 0;
  const promotionPercent = selectedDetail.promotion?.promotionPercent || 0;
  const discountPrice = promotionPercent ? salePrice * (1 - promotionPercent / 100) : salePrice;

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 font-medium">
          <Link to="/" className="hover:text-[#1E3A8A]">Trang chủ</Link>
          <FaChevronRight className="mx-2 text-xs" />
          <Link to="/products" className="hover:text-[#1E3A8A]">Sản phẩm</Link>
          <FaChevronRight className="mx-2 text-xs" />
          <span className="text-gray-800 truncate max-w-[200px]">{selectedDetail.product?.productName}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* 1. Image Section */}
            <div className="p-8 bg-gray-50/50 flex flex-col justify-center items-center relative group">
              <div className="relative w-full aspect-[4/5] max-w-[500px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <img
                  src={selectedImage || "https://via.placeholder.com/500"}
                  alt={selectedDetail.product?.productName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {promotionPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded shadow-md z-10">
                    -{promotionPercent}%
                  </span>
                )}
                <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors z-10">
                  <FaHeart />
                </button>
              </div>
            </div>

            {/* 2. Product Info Section */}
            <div className="p-8 lg:p-12 flex flex-col h-full">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-[#1E3A8A] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{selectedDetail.product?.brand?.brandName || "Brand"}</span>
                  {selectedDetail.quantitySaled > 50 && (
                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <FaStar className="text-[10px]" /> Best Seller
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
                  {selectedDetail.product?.productName}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                  </span>
                  <span>({selectedDetail.quantitySaled || 0} đánh giá)</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>Mã: <span className="font-mono text-gray-700">{selectedDetail.productDetailCode}</span></span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-4xl font-black text-[#1E3A8A] tracking-tight">
                    {discountPrice.toLocaleString("vi-VN")}₫
                  </span>
                  {promotionPercent > 0 && (
                    <>
                      <span className="text-xl text-gray-400 line-through font-medium mb-1">
                        {salePrice.toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-sm font-bold text-red-500 bg-red-100 px-2 py-1 rounded-md mb-2">
                        Tiết kiệm {Math.round(promotionPercent)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-6 flex-1">
                {/* Color */}
                <div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide block mb-3">Màu sắc</span>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => {
                      // Check availability
                      const isAvailable = productDetails.some(d => d.color?.name === color); // Simplified availability check
                      const isSelected = selectedDetail.color?.name === color;

                      return (
                        <button
                          key={color}
                          onClick={() => handleVariantChange('color', color)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 
                                                ${isSelected
                              ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 text-[#1E3A8A]'
                              : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                            `}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Kích thước</span>
                    <button onClick={() => setIsSizeChartOpen(true)} className="text-xs font-bold text-[#1E3A8A] hover:underline">Hướng dẫn chọn size</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => {
                      const isSelected = selectedDetail.size?.name === size;
                      return (
                        <button
                          key={size}
                          onClick={() => handleVariantChange('size', size)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2
                                                ${isSelected
                              ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-md transform scale-105'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}
                                            `}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Other Variants (Collar/Sleeve) - Simplified view */}
                <div className="grid grid-cols-2 gap-4">
                  {availableCollars.length > 0 && (
                    <div>
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wide block mb-2">Cổ áo</span>
                      <select
                        value={selectedDetail.collar?.name || ""}
                        onChange={(e) => handleVariantChange('collar', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A8A] outline-none font-medium"
                      >
                        {availableCollars.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  {availableSleeves.length > 0 && (
                    <div>
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wide block mb-2">Tay áo</span>
                      <select
                        value={selectedDetail.sleeve?.sleeveName || ""}
                        onChange={(e) => handleVariantChange('sleeve', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A8A] outline-none font-medium"
                      >
                        {availableSleeves.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Số lượng</span>
                  <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                    <button
                      onClick={() => setQuantity(validateQuantity(quantity - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                    >-</button>
                    <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(validateQuantity(quantity + 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                    >+</button>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Còn {selectedDetail.quantity} sản phẩm</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isLoadingCart || selectedDetail.quantity === 0}
                  className="py-4 rounded-xl border-2 border-[#1E3A8A] text-[#1E3A8A] font-bold text-lg hover:bg-[#1E3A8A] hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaShoppingCart className="group-hover:translate-x-1 transition-transform" />
                  {isLoadingCart ? "Đang xử lý..." : "Thêm vào giỏ"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={selectedDetail.quantity === 0}
                  className="py-4 rounded-xl bg-[#1E3A8A] text-white font-bold text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-800 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaBolt /> Mua Ngay
                </button>
              </div>

              {/* Commitments */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-8 pt-8 border-t border-gray-100">
                {[
                  { icon: FaCheckCircle, text: "Chính hãng 100%" },
                  { icon: FaShippingFast, text: "Giao hàng toàn quốc" },
                  { icon: FaUndo, text: "Đổi trả miễn phí" },
                  { icon: FaHeadset, text: "Hỗ trợ 24/7" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <item.icon className="text-[#1E3A8A]" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Size Chart Modal */}
        {isSizeChartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsSizeChartOpen(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsSizeChartOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold hover:bg-gray-200">✕</button>
              <h3 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">Bảng Kích Thước</h3>
              {/* Simplified Image or Table for Size Chart - Using existing table structure */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Chiều cao</th>
                      <th className="px-6 py-3">Cân nặng</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b"><td className="px-6 py-4 font-medium">S</td><td className="px-6 py-4">160-166cm</td><td className="px-6 py-4">56-62kg</td></tr>
                    <tr className="bg-white border-b"><td className="px-6 py-4 font-medium">M</td><td className="px-6 py-4">167-172cm</td><td className="px-6 py-4">63-68kg</td></tr>
                    <tr className="bg-white border-b"><td className="px-6 py-4 font-medium">L</td><td className="px-6 py-4">173-178cm</td><td className="px-6 py-4">69-74kg</td></tr>
                    <tr className="bg-white border-b"><td className="px-6 py-4 font-medium">XL</td><td className="px-6 py-4">179-184cm</td><td className="px-6 py-4">75-80kg</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProductDetail;
