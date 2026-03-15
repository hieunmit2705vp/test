import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ProductUpdateModal from "./components/ProductUpdateModal";
import ProductTable from './components/ProductTable';
import Pagination from './components/Pagination';
import ProductFilters from './components/ProductFilters';
import ProductDetailService from "../../../services/ProductDetailService";
import CollarService from "../../../services/CollarService";
import SleeveService from "../../../services/SleeveService";
import ColorService from "../../../services/ColorService";
import SizeService from "../../../services/SizeService";
import PromotionService from "../../../services/PromotionServices";

export default function ProductDetail() {
  const { role } = useSelector((state) => state.user);
  const isAdmin = role === "ADMIN";
  const { productCode } = useParams();

  const [products, setProducts] = useState([]);
  const [collars, setCollars] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sleeves, setSleeves] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [filters, setFilters] = useState({
    colorIds: [],
    collarIds: [],
    sizeIds: [],
    sleeveIds: [],
    minPrice: 0,
    maxPrice: 10000000,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSelectOptions();
  }, []);

  useEffect(() => {
    if (productCode) {
      setSearch(productCode);
      setPage(0);
    }
  }, [productCode]);

  useEffect(() => {
    if (search) {
      fetchProductDetails();
    }
  }, [search, page, pageSize, sortConfig, filters]);

  const fetchSelectOptions = async () => {
    try {
      const collarData = await CollarService.getAllCollars();
      setCollars(collarData.content);

      const sizeData = await SizeService.getAllSizes();
      setSizes(sizeData.content);

      const colorData = await ColorService.getAllColors();
      setColors(colorData.content);

      const sleeveData = await SleeveService.getAllSleeves();
      setSleeves(sleeveData.content);

      const promotionData = await PromotionService.getAllPromotions();
      setPromotions(promotionData.content);

    } catch (error) {
      setError("Error fetching select options");
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const result = await ProductDetailService.getAllProductDetails({
        page,
        size: pageSize,
        search,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction,
        ...filters
      });
      setProducts(result.content);
      setTotalPages(result.page?.totalPages || 0);
      setLoading(false);
    } catch (error) {
      setError("Error fetching product details");
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handlePriceChange = (field, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: value ? parseFloat(value) : ""
    }));
    setPage(0);
  };

  const handleFilterChange = (field, selectedOptions) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: selectedOptions ? selectedOptions.map(option => option.value) : [],
    }));
    setPage(0);
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedProduct = await ProductDetailService.toggleProductDetailStatus(id);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, status: updatedProduct.status } : product
        )
      );
      toast.success("Thay đổi trạng thái thành công!");
    } catch (error) {
      console.error("Error toggling product detail status:", error);
      toast.error("Không thể thay đổi trạng thái. Vui lòng thử lại!");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleUpdateProduct = (product) => {
    console.log("Updating product:", product);
    setCurrentProduct(product);
    setModalVisible(true);
  };

  const handleProductUpdate = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = async () => {
    try {
      if (productToDelete) {
        await ProductDetailService.deleteProductDetail(productToDelete.id);
        setProducts((prev) =>
          prev.filter((p) => p.id !== productToDelete.id)
        );
        toast.success("Xóa sản phẩm thành công!");
      }
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Xóa sản phẩm thất bại. Vui lòng thử lại!");
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">
          Chi tiết sản phẩm {products.length > 0 ? products[0].product.productName : ""}
        </h1>
        <p className="text-gray-600">Quản lý và chỉnh sửa thông tin chi tiết sản phẩm</p>
      </div>

      <ProductFilters
        filters={filters}
        search={search}
        handleFilterChange={handleFilterChange}
        handleSearchChange={handleSearchChange}
        handlePriceChange={handlePriceChange}
        collars={collars}
        sleeves={sleeves}
        colors={colors}
        sizes={sizes}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ProductTable
            products={products}
            handleToggleStatus={handleToggleStatus}
            handleUpdateProduct={handleUpdateProduct}
            openDeleteModal={openDeleteModal}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      <ProductUpdateModal
        modalVisible={modalVisible}
        currentProduct={currentProduct}
        onClose={handleModalClose}
        onUpdate={handleProductUpdate}
        collars={collars}
        sleeves={sleeves}
        colors={colors}
        sizes={sizes}
        promotions={promotions}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Xác nhận xóa</h2>
            <p className="text-center text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                onClick={closeDeleteModal}
              >
                Hủy
              </button>
              <button
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={confirmDeleteProduct}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}