import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductService from "../../services/ProductService";
import BrandService from "../../services/BrandService";
import { FaFire, FaStar, FaTrophy, FaArrowRight, FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import heroBannerAsset from "../../assets/Black and White Vintage Illustration Men's Fashion Banner.png";
import tt1 from "../../assets/tt1.jpg";
import tt2 from "../../assets/tt2.webp";
import tt3 from "../../assets/tt3jpg.jpg";
import tt5 from "../../assets/tt5.jpg";

const formatCurrency = (amount) => {
  return amount != null ? amount.toLocaleString("vi-VN") + "₫" : "Liên hệ";
};

const formatPriceRange = (minPrice, maxPrice) => {
  if (minPrice === maxPrice) return formatCurrency(minPrice);
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
};

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, productsRes, bestSellingRes] = await Promise.all([
          BrandService.getAllBrands(),
          ProductService.getFilteredProducts({ page: 0, size: 10, sort: "createdDate,desc" }),
          ProductService.getFilteredProducts({ page: 0, size: 5, sort: "quantitySaled,desc" })
        ]);

        setBrands(brandsRes?.content || []);
        setProducts(productsRes?.content || productsRes?.data || []);
        setBestSellingProducts(bestSellingRes?.content || bestSellingRes?.data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      }
    };
    fetchData();
  }, []);

  const toggleSelectProduct = (product) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some((p) => p.id === product.id);
      return isSelected
        ? prevSelected.filter((p) => p.id !== product.id)
        : prevSelected.length < 3
          ? [...prevSelected, product]
          : prevSelected;
    });
  };

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

  const removeSelectedProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Improved Image Paths & Content
  const heroBanner = heroBannerAsset;
  const newsItems = [
    {
      img: tt1,
      title: "7 Kiểu Áo Sơ Mi Nam Không Bao Giờ Lỗi Thời",
      desc: "Những món đồ kinh điển như sơ mi cài nút, polo, và flannel không bao giờ lỗi mốt...",
      date: "21/02/2024"
    },
    {
      img: tt2,
      title: "Phong Cách 'The Boy' Trong Phim Thời Trang",
      desc: "Áo đặc trưng của chúng tôi gây chú ý trong một bộ phim gần đây...",
      date: "20/02/2024"
    },
    {
      img: tt3,
      title: "Phong Cách Anh Quốc Thanh Lịch",
      desc: "Sự tinh tế nhẹ nhàng với áo may đo của chúng tôi, lấy cảm hứng từ phong cách Anh Quốc...",
      date: "19/02/2024"
    },
    {
      img: tt5,
      title: "Tủ Đồ Tối Giản: Chìa Khóa Chọn Áo Thông Minh",
      desc: "Xây dựng bộ sưu tập áo đa năng với The Boy—phong cách, tiết kiệm...",
      date: "18/02/2024"
    },
  ];

  return (
    <main className="bg-gray-50 min-h-screen font-sans">

      {/* 1. Hero Banner with Modern Overlay */}
      <section className="relative w-full h-[600px] lg:h-[700px] overflow-hidden group">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src={heroBanner}
          alt="The Boys Fashion Banner"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2000ms]"
        />
        <div className="absolute inset-0 z-20 flex items-center bg-gradient-to-r from-black/80 via-transparent to-transparent">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-2xl animate-fade-in-up">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 text-sm font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
                Bộ Sưu Tập Mới 2024
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                Nâng Tầm <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Phong Cách
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 font-light max-w-lg leading-relaxed">
                Khám phá những thiết kế độc bản, chất liệu cao cấp và sự tinh tế trong từng đường kim mũi chỉ tại The Boys.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/products")}
                  className="px-8 py-4 bg-[#1E3A8A] text-white font-bold rounded-full shadow-lg shadow-blue-900/30 hover:bg-blue-700 hover:shadow-blue-700/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  Mua Sắm Ngay <FaArrowRight />
                </button>
                <button
                  onClick={() => navigate("/productsBanrd")}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-full border border-white/30 hover:bg-white hover:text-[#1E3A8A] hover:-translate-y-1 transition-all duration-300"
                >
                  Xem Bộ Sưu Tập
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hot Products Slider with Snap Scroll */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-red-500 font-bold uppercase tracking-widest text-sm mb-2 block animate-pulse">Running Fast!</span>
              <h2 className="text-4xl font-extrabold text-[#1E3A8A] flex items-center gap-3">
                Sản Phẩm Hot <FaFire className="text-orange-500" />
              </h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="group flex items-center gap-2 text-[#1E3A8A] font-bold hover:text-blue-700 transition-colors"
            >
              Xem Tất Cả <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="relative -mx-6 px-6 overflow-hidden">
            {/* Gradient overlay for scroll hint */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10 md:hidden"></div>

            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide py-4 px-2">
              {products.slice(0, 10).map((product) => (
                <div key={product.id} className="snap-center">
                  <ProductCard
                    product={product}
                    onView={handleViewProduct}
                    onToggleSelect={toggleSelectProduct}
                    selectedProducts={selectedProducts}
                    isHot={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Best Selling Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 gap-12">
            {/* Best Sellers (Full Width) */}
            <div className="lg:col-span-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                  <FaTrophy className="text-2xl" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#1E3A8A]">Bán Chạy Nhất</h2>
              </div>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bestSellingProducts.map((product, index) => (
                    <ProductListItem key={product.id} product={product} rank={index + 1} onView={handleViewProduct} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Brands Marquee */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">
            Đối Tác Thương Hiệu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-80 hover:opacity-100 transition-opacity">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="w-full flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110 cursor-pointer"
                title={brand.brandName}
              >
                {brand.brandPhoto ? (
                  <img
                    src={brand.brandPhoto}
                    alt={brand.brandName}
                    className="max-h-12 max-w-[120px] object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-400 hover:text-[#1E3A8A]">{brand.brandName}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Blog/News Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-[#1E3A8A] mb-2">The Boys Blog</h2>
              <p className="text-gray-500">Cập nhật xu hướng thời trang mới nhất</p>
            </div>
            <a href="#" className="hidden md:block text-[#1E3A8A] font-bold hover:underline">Xem tất cả bài viết</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newsItems.map((news, index) => (
              <article
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={news.img}
                    alt={news.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-[#1E3A8A] shadow-sm">
                    {news.date}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                    {news.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">{news.desc}</p>
                  <span className="text-[#1E3A8A] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Đọc thêm <FaArrowRight className="text-xs" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Floating Button */}
      {selectedProducts.length > 0 && (
        <>
          <button
            onClick={() => setShowCompareModal(true)}
            className="fixed bottom-8 right-8 bg-[#1E3A8A] text-white pl-4 pr-6 py-3 rounded-full shadow-2xl hover:bg-blue-800 hover:scale-105 transition-all font-bold flex items-center gap-3 z-40 animate-bounce-in ring-4 ring-white/50"
          >
            <span className="bg-yellow-400 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold">
              {selectedProducts.length}
            </span>
            So Sánh Sản Phẩm
          </button>
          {/* Modal Logic Reuse */}
          {showCompareModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1E3A8A]">So Sánh Sản Phẩm</h2>
                    <p className="text-sm text-gray-500">So sánh giá và tính năng để chọn lựa tốt nhất</p>
                  </div>
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all font-bold text-xl shadow-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-8 overflow-y-auto bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 relative group hover:border-[#1E3A8A] transition-all">
                        <button
                          onClick={() => removeSelectedProduct(product.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all z-10"
                          title="Xóa khỏi so sánh"
                        >
                          ✕
                        </button>
                        <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gray-100">
                          <img
                            src={product.photo || "https://via.placeholder.com/300"}
                            alt={product.nameProduct}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">{product.nameProduct}</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                          <p className="text-2xl font-extrabold text-[#1E3A8A]">
                            {formatCurrency(product.salePrice)}
                          </p>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                            <span className="text-gray-500">Thương hiệu</span>
                            <span className="font-semibold text-gray-900">{product.brand?.name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                            <span className="text-gray-500">Chất liệu</span>
                            <span className="font-semibold text-gray-900">{product.material?.name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                            <span className="text-gray-500">Đã bán</span>
                            <span className="font-semibold text-green-600">{product.quantitySaled || 0}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-blue-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                          Xem Chi Tiết
                        </button>
                      </div>
                    ))}
                    {selectedProducts.length < 3 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-gray-400 min-h-[400px]">
                        <FaShoppingCart className="text-4xl mb-4 opacity-30" />
                        <p>Thêm sản phẩm khác để so sánh</p>
                        <button onClick={() => setShowCompareModal(false)} className="mt-4 text-[#1E3A8A] font-bold hover:underline">
                          Tiếp tục mua sắm
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Outlet />
    </main>
  );
};

// Reusable Premium Product Card
const ProductCard = ({ product, onView, onToggleSelect, selectedProducts, isHot = false }) => {
  const discount = product.importPrice > product.minPrice
    ? Math.round(((product.importPrice - product.minPrice) / product.importPrice) * 100)
    : 0;

  const isSelected = selectedProducts.some((p) => p.id === product.id);

  return (
    <div className={`flex-shrink-0 w-[260px] bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-2xl hover:border-blue-100 transition-all duration-300 relative ${isHot ? 'ring-2 ring-transparent' : ''}`}>

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.photo || "https://via.placeholder.com/300x400"}
          alt={product.nameProduct}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isSale && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm animate-pulse flex items-center gap-1 uppercase tracking-wider">
              SALE
            </span>
          )}
          {isHot && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 uppercase tracking-wider">
              <FaFire /> Hot
            </span>
          )}
          {discount > 0 && (
            <span className="bg-yellow-400 text-blue-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[1px]">
          <button
            onClick={() => onView(product.id)}
            className="w-10 h-10 bg-white text-[#1E3A8A] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1E3A8A] hover:text-white transition-all transform hover:scale-110"
            title="Xem chi tiết"
          >
            <FaArrowRight />
          </button>
          <button
            onClick={() => onToggleSelect(product)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 ${isSelected ? "bg-green-500 text-white" : "bg-white text-gray-600 hover:text-green-600"}`}
            title="So sánh"
          >
            {isSelected ? <FaCheckCircle /> : <FaShoppingCart />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 h-10">
          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-[#1E3A8A] transition-colors leading-snug cursor-pointer" onClick={() => onView(product.id)}>
            {product.nameProduct}
          </h3>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#1E3A8A] font-extrabold text-sm md:text-base">
              {formatCurrency(product.minPrice)}
            </span>
            {product.minPrice !== product.maxPrice && (
              <span className="text-[#1E3A8A] font-extrabold text-sm md:text-base">
                {formatCurrency(product.maxPrice)}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.importPrice)}
              </span>
            )}
            <span className="text-xs text-gray-500 ml-auto leading-none pt-1">
              Đã bán: {product.quantitySaled}
            </span>
          </div>
        </div>
        {/* Sold Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1E3A8A] to-blue-400 h-full rounded-full"
              style={{ width: `${Math.min(((product.quantitySaled || 0) / (product.quantity || 100)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium List Item
const ProductListItem = ({ product, rank, onView }) => {
  return (
    <div
      onClick={() => onView(product.id)}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:bg-blue-50/10 transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Rank Badge */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md z-10 ${rank === 1 ? 'bg-yellow-400 text-white ring-4 ring-yellow-100' :
          rank === 2 ? 'bg-gray-300 text-white ring-4 ring-gray-100' :
            rank === 3 ? 'bg-orange-400 text-white ring-4 ring-orange-100' :
              'bg-gray-100 text-gray-500'
        }`}>
        {rank}
      </div>

      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 relative">
        <img
          src={product.photo || "https://via.placeholder.com/150"}
          alt={product.nameProduct}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.isSale && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm z-10">
            SALE
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 z-10">
        <h3 className="font-bold text-gray-800 group-hover:text-[#1E3A8A] transition-colors line-clamp-2 text-sm mb-2 h-10">
          {product.nameProduct}
        </h3>
        <div className="flex justify-between items-center text-[#1E3A8A] font-extrabold text-sm mb-2">
          <span>{formatCurrency(product.minPrice)}</span>
          {product.minPrice !== product.maxPrice && (
            <span>{formatCurrency(product.maxPrice)}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
            Đã bán: {product.quantitySaled}
          </span>
          {rank <= 3 && (
            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
              <FaFire /> TRENDING
            </span>
          )}
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 text-[#1E3A8A]">
        <FaArrowRight />
      </div>
    </div>
  );
};

export default Home;
