import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { FaFilter, FaRedo, FaShoppingCart, FaExchangeAlt, FaEye, FaChevronDown, FaCheck, FaSearch } from "react-icons/fa";
import BrandService from "../../services/BrandService";
import CategoryService from "../../services/CategoryService";
import CollarService from "../../services/CollarService";
import ColorService from "../../services/ColorService";
import SizeService from "../../services/SizeService";
import SleeveService from "../../services/SleeveService";
import ProductService from "../../services/ProductService";

const formatCurrency = (amount) => {
  return amount ? amount.toLocaleString("vi-VN") + "₫" : "Liên hệ";
};

const ProductList = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    category: "",
    brand: "",
    collar: "",
    color: "",
    size: "",
    sleeve: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [collars, setCollars] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sleeves, setSleeves] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorFilters, setErrorFilters] = useState(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      setLoadingFilters(true);
      setErrorFilters(null);
      try {
        const [
          categoryData,
          brandData,
          collarData,
          colorData,
          sizeData,
          sleeveData,
        ] = await Promise.all([
          CategoryService.getAll(0, 100).catch(() => ({ content: [] })),
          BrandService.getAllBrands("", 0, 100).catch(() => []),
          CollarService.getAllCollars("", 0, 100).catch(() => ({ content: [] })),
          ColorService.getAllColors("", 0, 100).catch(() => ({ content: [] })),
          SizeService.getAllSizes("", 0, 100).catch(() => ({ content: [] })),
          SleeveService.getAllSleeves("", 0, 100).catch(() => ({ content: [] })),
        ]);

        const mapData = (data, nameKey) => {
          if (Array.isArray(data?.content)) return data.content.map(item => ({ id: item.id, name: item[nameKey] || item.name }));
          if (Array.isArray(data?.data)) return data.data.map(item => ({ id: item.id, name: item[nameKey] || item.name }));
          return [];
        };

        setCategories(mapData(categoryData, "categoryName"));
        setBrands(mapData(brandData, "brandName"));
        setCollars(mapData(collarData, "collarName"));
        setColors(mapData(colorData, "colorName"));
        setSizes(mapData(sizeData, "sizeName"));
        setSleeves(mapData(sleeveData, "sleeveName"));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bộ lọc:", error);
        setErrorFilters("Không thể tải dữ liệu bộ lọc.");
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilterData();
  }, []);

  const fetchProducts = useCallback(
    debounce(async (page, filterState) => {
      setLoadingProducts(true);
      try {
        const response = await ProductService.getFilteredProducts({
          page,
          size: pageSize,
          minPrice: filterState.minPrice,
          maxPrice: filterState.maxPrice,
          categoryIds: filterState.category ? [filterState.category] : [],
          brandIds: filterState.brand ? [filterState.brand] : [],
          collarIds: filterState.collar ? [filterState.collar] : [],
          colorIds: filterState.color ? [filterState.color] : [],
          sizeIds: filterState.size ? [filterState.size] : [],
          sleeveIds: filterState.sleeve ? [filterState.sleeve] : [],
        });
        setProducts(response?.content || response?.data || []);
        setTotalPages(response?.totalPages || 1);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      } finally {
        setLoadingProducts(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchProducts(currentPage, filters);
  }, [currentPage, filters, fetchProducts]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      category: "",
      brand: "",
      collar: "",
      color: "",
      size: "",
      sleeve: "",
    });
    setCurrentPage(0);
  };

  const toggleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      const newSelected = isSelected
        ? prev.filter((p) => p.id !== product.id)
        : prev.length < 3
          ? [...prev, product]
          : prev;
      if (!isSelected && newSelected.length <= 3) {
        setShowCompareModal(true);
      }
      return newSelected;
    });
  };

  const handleViewProduct = async (productId) => {
    try {
      const productDetails = await ProductService.getProductById(productId);
      if (productDetails && productDetails.productCode) {
        navigate(`/view-product/${productDetails.productCode}`);
      } else {
        alert("Không tìm thấy mã sản phẩm cho ID: " + productId);
      }
    } catch (error) {
      console.error("Lỗi khi xem chi tiết sản phẩm:", error);
    }
  };

  const removeSelectedProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProducts.length <= 1) {
      setShowCompareModal(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-200 pb-6">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Thời trang nam</p>
            <h1 className="text-4xl font-extrabold text-[#1E3A8A]">
              Bộ Sưu Tập Sản Phẩm
            </h1>
          </div>
          <div className="text-gray-500 text-sm mt-4 md:mt-0">
            Hiển thị <b>{products.length}</b> kết quả
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                  <FaFilter className="text-sm" /> Bộ Lọc Tìm Kiếm
                </h2>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors bg-gray-100 px-3 py-1.5 rounded-full hover:bg-red-50"
                >
                  <FaRedo size={10} /> Đặt lại
                </button>
              </div>

              {loadingFilters ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Category Filter */}
                  <FilterGroup label="Danh mục sản phẩm">
                    <div className="relative">
                      <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="form-select w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#1E3A8A] transition-all cursor-pointer font-medium"
                      >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <FaChevronDown size={12} />
                      </div>
                    </div>
                  </FilterGroup>

                  {/* Price Range Filter */}
                  <FilterGroup label="Khoảng giá (VNĐ)">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          name="minPrice"
                          placeholder="Từ"
                          value={filters.minPrice || ""}
                          onChange={handleFilterChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-all text-sm font-medium"
                        />
                      </div>
                      <span className="text-gray-400 font-bold">-</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          name="maxPrice"
                          placeholder="Đến"
                          value={filters.maxPrice || ""}
                          onChange={handleFilterChange}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                  </FilterGroup>

                  {/* Brand Filter */}
                  <FilterGroup label="Thương hiệu">
                    <div className="relative">
                      <select name="brand" value={filters.brand} onChange={handleFilterChange} className="form-select w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#1E3A8A] transition-all cursor-pointer font-medium">
                        <option value="">Tất cả thương hiệu</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <FaChevronDown size={12} />
                      </div>
                    </div>
                  </FilterGroup>


                  <div className="grid grid-cols-2 gap-4">
                    {/* Color Filter */}
                    <FilterGroup label="Màu sắc">
                      <div className="relative">
                        <select name="color" value={filters.color} onChange={handleFilterChange} className="form-select w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#1E3A8A] transition-all cursor-pointer text-sm font-medium">
                          <option value="">Tất cả</option>
                          {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <FaChevronDown size={10} />
                        </div>
                      </div>
                    </FilterGroup>

                    {/* Size Filter */}
                    <FilterGroup label="Kích thước">
                      <div className="relative">
                        <select name="size" value={filters.size} onChange={handleFilterChange} className="form-select w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#1E3A8A] transition-all cursor-pointer text-sm font-medium">
                          <option value="">Tất cả</option>
                          {sizes.map((s) => <option key={s.id} value={s.id}>{s.name || "FREESIZE"}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <FaChevronDown size={10} />
                        </div>
                      </div>
                    </FilterGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Collar Filter */}
                    <FilterGroup label="Kiểu cổ áo">
                      <div className="relative">
                        <select name="collar" value={filters.collar} onChange={handleFilterChange} className="form-select w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#1E3A8A] transition-all cursor-pointer text-sm font-medium">
                          <option value="">Tất cả</option>
                          {collars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <FaChevronDown size={10} />
                        </div>
                      </div>
                    </FilterGroup>
                    {/* Sleeve Filter */}
                    <FilterGroup label="Kiểu tay áo">
                      <div className="relative">
                        <select name="sleeve" value={filters.sleeve} onChange={handleFilterChange} className="form-select w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#1E3A8A] transition-all cursor-pointer text-sm font-medium">
                          <option value="">Tất cả</option>
                          {sleeves.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <FaChevronDown size={10} />
                        </div>
                      </div>
                    </FilterGroup>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <main className="w-full lg:w-3/4">
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-[400px] animate-pulse">
                    <div className="bg-gray-100 h-3/4 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                      <img
                        src={product.photo || "https://via.placeholder.com/300x400?text=No+Image"}
                        alt={product.nameProduct}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        {product.importPrice > product.salePrice && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            -{Math.round(((product.importPrice - product.salePrice) / product.importPrice) * 100)}%
                          </span>
                        )}
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">NEW</span>
                      </div>

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="w-10 h-10 bg-white text-[#1E3A8A] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1E3A8A] hover:text-white transition-all transform hover:scale-110 tooltip"
                          title="Xem chi tiết"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => toggleSelectProduct(product)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 tooltip ${selectedProducts.some(p => p.id === product.id)
                            ? "bg-green-500 text-white"
                            : "bg-white text-gray-600 hover:text-green-600"
                            }`}
                          title="So sánh"
                        >
                          {selectedProducts.some(p => p.id === product.id) ? <FaCheck size={14} /> : <FaExchangeAlt size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="mb-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 truncate font-bold">{product.brand?.name || "The Boys"}</p>
                        <h3 className="text-gray-800 font-bold text-sm line-clamp-2 hover:text-[#1E3A8A] transition-colors cursor-pointer min-h-[2.5rem] leading-snug" onClick={() => handleViewProduct(product.id)}>
                          {product.nameProduct}
                        </h3>
                      </div>

                      <div className="mt-auto pt-3 border-t border-gray-50">
                        <div className="flex items-end justify-between">
                          <div className="flex flex-col">
                            <span className="text-[#1E3A8A] font-extrabold text-lg">
                              {formatCurrency(product.salePrice)}
                            </span>
                            {product.importPrice > product.salePrice && (
                              <span className="text-xs text-gray-400 line-through font-medium">
                                {formatCurrency(product.importPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleViewProduct(product.productCode)}
                            className="w-8 h-8 rounded-full bg-gray-100 text-[#1E3A8A] flex items-center justify-center hover:bg-[#1E3A8A] hover:text-white transition-all shadow-sm"
                          >
                            <FaShoppingCart size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <FaSearch size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại của bạn.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-8 py-3 bg-[#1E3A8A] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all transform hover:-translate-y-1"
                >
                  Xóa bộ lọc & Tìm lại
                </button>
              </div>
            )}

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0 || loadingProducts}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-600 shadow-sm"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-9 h-9 rounded-md font-bold text-sm transition-all ${currentPage === i
                        ? "bg-[#1E3A8A] text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1 || loadingProducts}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-600 shadow-sm"
                >
                  Sau
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-[#1E3A8A]">So Sánh Sản Phẩm</h2>
                <p className="text-sm text-gray-500">So sánh chi tiết các thông số kỹ thuật</p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-all font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="overflow-auto p-8 bg-white">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">Chưa có sản phẩm nào được chọn.</p>
                </div>
              ) : (
                <table className="w-full min-w-[700px] border-separate border-spacing-0 rounded-2xl border border-gray-200 overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-5 text-left w-[200px] font-bold text-gray-700 uppercase text-xs tracking-wider border-b border-gray-200 border-r">Tiêu chí</th>
                      {selectedProducts.map(p => (
                        <th key={p.id} className="p-5 w-[300px] relative border-b border-gray-200 border-r last:border-r-0 align-top">
                          <button
                            onClick={() => removeSelectedProduct(p.id)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all"
                            title="Xóa"
                          >
                            ✕
                          </button>
                          <div className="aspect-[3/4] w-24 mx-auto mb-3 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                            <img src={p.photo || "https://via.placeholder.com/200"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 px-4">{p.nameProduct}</h3>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-semibold text-gray-600 border-r border-gray-100">Giá bán</td>
                      {selectedProducts.map(p => (
                        <td key={p.id} className="p-5 text-center font-extrabold text-[#1E3A8A] text-lg border-r border-gray-100 last:border-r-0">
                          {formatCurrency(p.salePrice)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-semibold text-gray-600 border-r border-gray-100">Thương hiệu</td>
                      {selectedProducts.map(p => (
                        <td key={p.id} className="p-5 text-center text-gray-700 font-medium border-r border-gray-100 last:border-r-0">{p.brand || "—"}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-semibold text-gray-600 border-r border-gray-100">Chất liệu</td>
                      {selectedProducts.map(p => (
                        <td key={p.id} className="p-5 text-center text-gray-700 font-medium border-r border-gray-100 last:border-r-0">{p.material || "—"}</td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50/30">
                      <td className="p-5 font-semibold text-gray-600 border-r border-gray-100"></td>
                      {selectedProducts.map(p => (
                        <td key={p.id} className="p-5 text-center border-r border-gray-100 last:border-r-0">
                          <button
                            onClick={() => handleViewProduct(p.id)}
                            className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#163172] transition w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                          >
                            Xem Chi Tiết
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest"><FaExchangeAlt className="inline mr-1" /> Chọn tối đa 3 sản phẩm để so sánh</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Helper for Filter Groups
const FilterGroup = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
    {children}
  </div>
);

export default ProductList;
