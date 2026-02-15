import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductService from "../../services/ProductService";
import { FaFire, FaStar, FaShoppingCart, FaArrowRight, FaCheckCircle, FaHeart } from "react-icons/fa";

// Import images
import bannerTop from "../../assets/Blue and White T-shirt Products Sale Instagram Post (1).png";
import bannerMan from "../../assets/banner-thoi-trang-nam-tinh.jpg";
import bannerStyle from "../../assets/dung-luong-banner-thoi-trang.jpg";
import bannerLookbook from "../../assets/p1.png";

const formatCurrency = (amount) => {
  return amount ? amount.toLocaleString("vi-VN") + "₫" : "Liên hệ";
};

const ProductsBanrd = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {
          page: 0,
          size: 30, // Get enough products for sections
          sort: "id,desc",
        };
        const response = await ProductService.getFilteredProducts(params);
        const productsArray = Array.isArray(response)
          ? response
          : response?.content && Array.isArray(response.content)
            ? response.content
            : [];
        setProducts(productsArray || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const handleViewProduct = async (productId) => {
    try {
      const productDetails = await ProductService.getProductById(productId);
      if (productDetails && productDetails.productCode) {
        navigate(`/view-product/${productDetails.productCode}`);
      }
    } catch (error) {
      console.error("Lỗi khi xem chi tiết sản phẩm:", error);
    }
  };

  const toggleSelectProduct = (product) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some((p) => p.id === product.id);
      return isSelected
        ? prevSelected.filter((p) => p.id !== product.id)
        : [...prevSelected, product];
    });
  };

  const topProducts = products.slice(0, 4);
  const firstRowProducts = products.slice(4, 9);
  const secondRowProducts = products.slice(9, 14);

  return (
    <main className="bg-gray-50 min-h-screen font-sans pb-20">

      {/* 1. Hero Section */}
      <section className="relative bg-[#1E3A8A] text-white py-20 mb-12 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400 text-blue-200 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm animate-fade-in-down">
            New Collection 2025
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight animate-fade-in-up">
            Bộ Sưu Tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Mới Nhất</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up animation-delay-300">
            Cập nhật những xu hướng thời trang nam đẳng cấp, lịch lãm và thời thượng nhất năm nay.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-white text-[#1E3A8A] px-10 py-3.5 rounded-full font-bold shadow-lg shadow-blue-900/40 hover:bg-blue-50 hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center mx-auto gap-2 group"
          >
            Khám Phá Ngay <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl">

        {/* Section 2: Hot Deals Layout */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-full text-red-500 animate-pulse">
                <FaFire className="text-2xl" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#1E3A8A] tracking-tight">
                DEAL NỔI BẬT
              </h2>
            </div>
            <button onClick={() => navigate("/products")} className="text-sm font-bold text-gray-500 hover:text-[#1E3A8A] flex items-center gap-1 transition-colors group">
              Xem tất cả <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Big Banner */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-full min-h-[500px] border border-gray-100">
                <img
                  src={bannerTop}
                  alt="Summer Collection"
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/90 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded w-fit mb-3">HOT SALE</span>
                  <h3 className="text-3xl font-black mb-2 leading-tight">XUÂN HÈ <br />2025</h3>
                  <p className="mb-6 text-gray-200 font-medium">Giảm giá lên đến <span className="text-yellow-400 font-bold text-lg">50%</span></p>
                  <button
                    onClick={() => navigate("/products")}
                    className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl hover:bg-white hover:text-[#1E3A8A] transition-all font-bold shadow-lg flex items-center justify-center gap-2 group/btn"
                  >
                    Mua Ngay <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Products Grid & Small Banners */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
              {/* 4 Top Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topProducts.length > 0 ? (
                  topProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={handleViewProduct}
                      onToggleSelect={toggleSelectProduct}
                      selectedProducts={selectedProducts}
                    />
                  ))
                ) : (
                  <SkeletonGrid count={4} />
                )}
              </div>

              {/* 2 Smaller Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="relative rounded-2xl overflow-hidden shadow-lg group h-64 md:h-auto cursor-pointer border border-gray-100">
                  <img src={bannerMan} alt="Fashion" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="border-2 border-white/80 p-1">
                      <span className="block bg-white/10 backdrop-blur-sm text-white font-bold text-2xl px-6 py-2 uppercase tracking-widest border border-white/20 hover:bg-white hover:text-[#1E3A8A] transition-all">
                        Nam Tính
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-lg group h-64 md:h-auto cursor-pointer border border-gray-100">
                  <img src={bannerStyle} alt="Style" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="border-2 border-white/80 p-1">
                      <span className="block bg-white/10 backdrop-blur-sm text-white font-bold text-2xl px-6 py-2 uppercase tracking-widest border border-white/20 hover:bg-white hover:text-[#1E3A8A] transition-all">
                        Phong Cách
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Suggested Products */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-50 rounded-full text-yellow-500">
                <FaStar className="text-2xl" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#1E3A8A] tracking-tight">
                SẢN PHẨM GỢI Ý
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Banner Lookbook Left */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full min-h-[600px] group border border-gray-100 sticky top-24">
                <img
                  src={bannerLookbook}
                  alt="Lookbook"
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A] via-transparent to-transparent opacity-90"></div>

                <div className="absolute bottom-0 left-0 w-full p-10 text-center text-white">
                  <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">Editor's Pick</p>
                  <h3 className="text-4xl font-black mb-4">LOOKBOOK 2025</h3>
                  <p className="mb-8 text-blue-100 opacity-90 leading-relaxed">
                    Khám phá phong cách mới cho chính bạn với những set đồ được phối sẵn.
                  </p>
                  <button
                    onClick={() => navigate("/products")}
                    className="bg-white text-[#1E3A8A] w-full py-4 rounded-xl font-bold shadow-xl hover:bg-gray-100 hover:-translate-y-1 transition-all"
                  >
                    MUA NGAY
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid Right */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...firstRowProducts, ...secondRowProducts].length > 0 ? (
                  [...firstRowProducts, ...secondRowProducts].map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={handleViewProduct}
                      onToggleSelect={toggleSelectProduct}
                      selectedProducts={selectedProducts}
                    />
                  ))
                ) : <SkeletonGrid count={8} />}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Call to Action */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#1E3A8A] text-center p-12 md:p-20 group">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>

          {/* Decorative Blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              Bạn vẫn chưa tìm thấy <br /> món đồ ưng ý?
            </h2>
            <p className="mb-10 text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-light">
              Khám phá kho tàng thời trang với hơn <span className="font-bold text-yellow-400">1000+</span> mẫu mã đa dạng tại The Boys Fashion.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-white text-[#1E3A8A] px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300"
            >
              Xem Toàn Bộ Sản Phẩm
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

// Reusable Premium Product Card (Consistent with Home.jsx)
const ProductCard = ({ product, onClick, onToggleSelect, selectedProducts }) => {
  const discount = product.importPrice > product.salePrice
    ? Math.round(((product.importPrice - product.salePrice) / product.importPrice) * 100)
    : 0;

  const isSelected = selectedProducts?.some((p) => p.id === product.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
        <img
          src={product.photo || "https://via.placeholder.com/300x400?text=No+Image"}
          alt={product.nameProduct}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
          <button
            onClick={() => onClick(product.id)}
            className="w-10 h-10 bg-white text-[#1E3A8A] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1E3A8A] hover:text-white transition-all transform hover:scale-110"
            title="Xem chi tiết"
          >
            <FaShoppingCart className="text-sm" />
          </button>
          <button
            onClick={() => onToggleSelect && onToggleSelect(product)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 ${isSelected ? "bg-green-500 text-white" : "bg-white text-gray-600 hover:text-green-600"}`}
            title="Yêu thích/So sánh"
          >
            {isSelected ? <FaCheckCircle className="text-sm" /> : <FaHeart className="text-sm" />}
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 truncate font-bold">{product.brand?.name || "The Boys"}</p>
          <h3
            className="text-gray-800 font-bold text-sm line-clamp-2 hover:text-[#1E3A8A] cursor-pointer transition-colors leading-snug min-h-[2.5rem]"
            onClick={() => onClick(product.id)}
          >
            {product.nameProduct}
          </h3>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[#1E3A8A] font-extrabold text-lg">
                {formatCurrency(product.salePrice)}
              </span>
              {discount > 0 && (
                <span className="text-gray-400 text-xs line-through font-medium">
                  {formatCurrency(product.importPrice)}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Đã bán</span>
              <span className="text-xs font-bold text-gray-700">{product.quantitySaled || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonGrid = ({ count }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 animate-pulse h-[350px]">
        <div className="w-full h-3/4 bg-gray-200 rounded-lg mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    ))}
  </>
);

export default ProductsBanrd;
