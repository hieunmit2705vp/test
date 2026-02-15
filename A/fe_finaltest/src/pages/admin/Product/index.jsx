import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEdit, AiOutlinePlus, AiOutlineSearch } from "react-icons/ai";
import Switch from "react-switch";
import ProductService from "../../../services/ProductService";
import { toast } from "react-toastify";
import UpdateModal from './components/UpdateModal';
import CreateModal from './components/CreateModal';

export default function Product() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [status, setStatus] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    brandId: '',
    categoryId: '',
    materialId: '',
    productName: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { content, totalPages } = await ProductService.getAllProducts(
          currentPage,
          pageSize,
          search,
          status,
          sortBy,
          sortDirection
        );
        setItems(content);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [currentPage, pageSize, search, status, sortBy, sortDirection]);


  const handleSort = (key) => {
    let direction = "asc";
    if (sortBy === key && sortDirection === "asc") {
      direction = "desc";
    }
    setSortBy(key);
    setSortDirection(direction);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetail = (code) => {
    navigate(`/admin/product/${code}`);
  };

  const handleUpdateProduct = (product) => {
    setUpdatedProduct({
      brandId: product.brand.id,
      categoryId: product.category.id,
      materialId: product.material.id,
      productName: product.productName,
    });
    setProductToUpdate(product.id);
    setUpdateModal(true);
  };

  const confirmUpdate = async (updatedProduct) => {
    try {
      if (productToUpdate) {
        await ProductService.updateProduct(productToUpdate, updatedProduct);
        const updatedItems = items.map((item) =>
          item.id === productToUpdate ? { ...item, ...updatedProduct } : item
        );
        // Tạm thời reload lại bằng fetchProducts để lấy dữ liệu mới nhất nếu cần,
        // hoặc cập nhật state như ở trên.
        // Để đảm bảo data đồng bộ (ví dụ tên brand, category), ta nên fetch lại hoặc update kỹ hơn.
        // Ở đây fetch lại cho chắc ăn hoặc giữ nguyên logic cũ.
        // Logic cũ chỉ merge updatedProduct vào item, nhưng updatedProduct chỉ có IDs.
        // Nên fetch lại là tốt nhất để lấy tên Brand/Category mới.
        const { content } = await ProductService.getAllProducts(
          currentPage,
          pageSize,
          search,
          status,
          sortBy,
          sortDirection
        );
        setItems(content);

        toast.success("Cập nhật sản phẩm thành công!");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Cập nhật sản phẩm thất bại. Vui lòng thử lại!");
    } finally {
      setUpdateModal(false);
      setProductToUpdate(null);
    }
  };

  const cancelUpdate = () => {
    setUpdateModal(false);
    setProductToUpdate(null);
  };

  const confirmCreate = async (newProduct) => {
    try {
      await ProductService.createProduct(newProduct);
      // Fetch lại data
      const { content, totalPages: newTotalPages } = await ProductService.getAllProducts(
        0, // Về trang đầu
        pageSize,
        search,
        status,
        sortBy,
        sortDirection
      );
      setItems(content);
      setTotalPages(newTotalPages);
      setCurrentPage(0);

      toast.success("Thêm sản phẩm mới thành công!");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Thêm sản phẩm mới thất bại. Vui lòng thử lại!");
    } finally {
      setCreateModal(false);
    }
  };

  const cancelCreate = () => {
    setCreateModal(false);
  };

  const handleToggleStatus = async (id) => {
    try {
      await ProductService.toggleProductStatus(id);
      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, status: !item.status } : item
      );
      setItems(updatedItems);
      toast.success("Thay đổi trạng thái sản phẩm thành công!");
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Không thể thay đổi trạng thái sản phẩm. Vui lòng thử lại!");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1E3A8A] mb-8 border-b-2 border-[#1E3A8A] pb-2 inline-block">
          Quản Lý Sản Phẩm
        </h1>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AiOutlineSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo mã, tên sản phẩm..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-shadow shadow-sm text-gray-700"
              value={search}
              onChange={handleSearch}
            />
          </div>

          <button
            className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-[#163172] transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
            onClick={() => setCreateModal(true)}
          >
            <AiOutlinePlus className="text-xl" />
            Thêm Mới
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700">
              <thead className="bg-[#1E3A8A] text-white uppercase text-sm leading-normal">
                <tr>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center">STT</th>
                  <th className="py-4 px-6 font-semibold tracking-wider cursor-pointer hover:bg-[#163172]" onClick={() => handleSort("productCode")}>
                    Mã
                    {sortBy === "productCode" && (sortDirection === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th className="py-4 px-6 font-semibold tracking-wider cursor-pointer hover:bg-[#163172]" onClick={() => handleSort("productName")}>
                    Tên Sản Phẩm
                    {sortBy === "productName" && (sortDirection === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th className="py-4 px-6 font-semibold tracking-wider">Thương Hiệu</th>
                  <th className="py-4 px-6 font-semibold tracking-wider">Danh Mục</th>
                  <th className="py-4 px-6 font-semibold tracking-wider">Chất Liệu</th>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center">Trạng Thái</th>
                  <th className="py-4 px-6 font-semibold tracking-wider text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-base font-light">
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-indigo-50 transition-colors duration-200">
                    <td className="py-4 px-6 text-center font-medium">{index + 1 + currentPage * pageSize}</td>
                    <td className="py-4 px-6 font-semibold text-gray-800">{item.productCode}</td>
                    <td className="py-4 px-6 font-semibold text-[#1E3A8A]">{item.productName}</td>
                    <td className="py-4 px-6">{item.brand.brandName}</td>
                    <td className="py-4 px-6">{item.category.name}</td>
                    <td className="py-4 px-6">{item.material.materialName}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide border ${item.status
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                          }`}
                      >
                        {item.status ? "Kích hoạt" : "Ngưng bán"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center justify-center transition-all duration-200 shadow-sm border border-blue-200"
                          onClick={() => handleViewDetail(item.productCode)}
                          title="Xem chi tiết"
                        >
                          <AiOutlineEye size={18} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800 flex items-center justify-center transition-all duration-200 shadow-sm border border-yellow-200"
                          onClick={() => handleUpdateProduct(item)}
                          title="Chỉnh sửa"
                        >
                          <AiOutlineEdit size={18} />
                        </button>

                        <Switch
                          onChange={() => handleToggleStatus(item.id)}
                          checked={item.status}
                          height={20}
                          width={44}
                          offColor="#E5E7EB"
                          onColor="#10B981"
                          offHandleColor="#9CA3AF"
                          onHandleColor="#FFFFFF"
                          boxShadow="0px 1px 3px rgba(0, 0, 0, 0.3)"
                          activeBoxShadow="0px 0px 1px 2px rgba(0, 0, 0, 0.2)"
                          uncheckedIcon={false}
                          checkedIcon={false}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500 italic">
                      Không tìm thấy dữ liệu
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
              onChange={(e) => setPageSize(Number(e.target.value))}
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Trước
            </button>
            <span className="text-sm font-semibold px-4 text-[#1E3A8A]">
              Trang {currentPage + 1} / {totalPages || 1}
            </span>
            <button
              className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${currentPage === totalPages - 1 || totalPages === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:text-[#1E3A8A] hover:border-[#1E3A8A] shadow-sm transform active:scale-95"
                }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <UpdateModal
        isVisible={updateModal}
        onConfirm={confirmUpdate}
        onCancel={cancelUpdate}
        updatedProduct={updatedProduct}
        setUpdatedProduct={setUpdatedProduct}
      />
      <CreateModal
        isVisible={createModal}
        onConfirm={confirmCreate}
        onCancel={cancelCreate}
      />
    </div>
  );
}