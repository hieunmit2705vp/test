import React from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import Switch from "react-switch";

const ProductTable = ({
  products,
  handleToggleStatus,
  handleUpdateProduct,
  openDeleteModal,
  isAdmin,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white">
              <th className="px-3 py-2 text-center font-semibold text-sm">STT</th>
              <th className="px-3 py-2 text-left font-semibold text-sm">Mã sản phẩm</th>
              <th className="px-3 py-2 text-left font-semibold text-sm">Tên sản phẩm</th>
              <th className="px-3 py-2 text-center font-semibold text-sm">Cổ áo</th>
              <th className="px-3 py-2 text-center font-semibold text-sm">Màu sắc</th>
              <th className="px-3 py-2 text-center font-semibold text-sm">Kích thước</th>
              <th className="px-3 py-2 text-center font-semibold text-sm">Tay áo</th>
              <th className="px-3 py-2 text-center font-semibold text-sm">Số lượng</th>
              <th className="px-3 py-2 text-right font-semibold text-sm">Giá nhập</th>
              <th className="px-3 py-2 text-right font-semibold text-sm">Đơn giá</th>
              {isAdmin && <th className="px-3 py-2 text-center font-semibold text-sm">Trạng thái</th>}
              {isAdmin && <th className="px-3 py-2 text-center font-semibold text-sm">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr
                key={product.id}
                className="hover:bg-indigo-50 transition-colors duration-200"
              >
                <td className="px-3 py-2 text-center font-medium text-gray-700">
                  {index + 1}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-gray-600">
                  {product.productDetailCode}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    {product.photo && (
                      <img
                        src={product.photo}
                        alt={product.product.productName}
                        className="w-10 h-10 object-cover rounded-lg shadow-sm"
                      />
                    )}
                    <span className="font-medium text-gray-800">
                      {product.product.productName}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                    {product.collar?.name || "N/A"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                    {product.color?.name || "N/A"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                    {product.size?.name || "N/A"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                    {product.sleeve?.sleeveName || "N/A"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`font-semibold ${product.quantity < 10 ? 'text-red-600' : 'text-gray-700'
                    }`}>
                    {product.quantity}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-700 text-sm">
                  {product.importPrice?.toLocaleString()} đ
                </td>
                <td className="px-3 py-2 text-right font-semibold text-[#1E3A8A] text-sm">
                  {product.salePrice?.toLocaleString()} đ
                </td>
                {isAdmin && (
                  <td className="px-3 py-2 text-center">
                    <div
                      className="inline-flex"
                      title={product.status ? "Click để tắt" : "Click để kích hoạt"}
                    >
                      <Switch
                        onChange={() => handleToggleStatus(product.id)}
                        checked={product.status}
                        offColor="#E5E7EB"
                        onColor="#1E3A8A"
                        offHandleColor="#9CA3AF"
                        onHandleColor="#FFFFFF"
                        checkedIcon={false}
                        uncheckedIcon={false}
                        height={24}
                        width={48}
                      />
                    </div>
                  </td>
                )}
                {isAdmin && (
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-2 text-[#1E3A8A] hover:bg-blue-100 rounded-lg transition-all duration-200"
                        onClick={() => handleUpdateProduct(product)}
                        title="Chỉnh sửa sản phẩm"
                      >
                        <AiOutlineEdit className="text-lg" />
                      </button>
                      <button
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                        onClick={() => openDeleteModal(product)}
                        title="Xóa sản phẩm"
                      >
                        <AiOutlineDelete className="text-lg" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 font-medium mt-4">Không tìm thấy sản phẩm nào</p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
