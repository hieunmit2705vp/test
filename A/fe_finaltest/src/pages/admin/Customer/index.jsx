import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AiOutlineEye, AiFillCaretUp, AiFillCaretDown, AiOutlineEdit } from "react-icons/ai";
import { TiLockOpen } from "react-icons/ti";
import Switch from "react-switch";
import CustomerService from "../../../services/CustomerService";
import { toast } from "react-toastify";
import UpdateModal from './components/UpdateModal';
import CreateModal from './components/CreateModal';
import UpdatePasswordModal from './components/UpdatePasswordModal';

export default function Customer() {
  const { role } = useSelector((state) => state.user);
  const isAdmin = role === "ADMIN";
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [updateModal, setUpdateModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await CustomerService.getAll(
        search,
        currentPage,
        pageSize,
        sortBy,
        sortDir
      );
      setCustomers(response.content || []);
      setTotalPages(response.page?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Không thể tải danh sách khách hàng. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, search, sortBy, sortDir]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortBy === key && sortDir === "asc") {
      direction = "desc";
    }
    setSortBy(key);
    setSortDir(direction);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleUpdateCustomer = (customer) => {
    setCurrentCustomer(customer);
    setUpdateModal(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await CustomerService.toggleStatus(id);
      const updatedItems = customers.map((item) =>
        item.id === id ? { ...item, status: !item.status } : item
      );
      setCustomers(updatedItems);
      toast.success("Thay đổi trạng thái khách hàng thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể thay đổi trạng thái. Vui lòng thử lại!");
    }
  };

  const renderRows = () => {
    const sortedItems = [...customers].sort((a, b) => {
      if (sortBy === null) return 0;

      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue < bValue) return sortDir === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sortedItems.map((item, index) => (
      <tr key={item.id} className="hover:bg-indigo-50 transition-colors duration-200">
        <td className="px-3 py-2 text-center font-medium text-gray-700">{index + 1}</td>
        <td className="px-3 py-2 text-center font-bold text-gray-700">#{item.id}</td>
        <td className="px-3 py-2 font-mono text-xs text-gray-600">{item.customerCode}</td>
        <td className="px-3 py-2 font-medium text-gray-800">{item.username}</td>
        <td className="px-3 py-2 font-medium text-gray-700">{item.fullname}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{item.email}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{item.phone}</td>
        <td className="px-3 py-2">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium flex items-center justify-center w-fit mx-auto ${item.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${item.status ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            {item.status ? "Kích hoạt" : "Ngừng hoạt động"}
          </span>
        </td>
        {isAdmin && (
          <td className="px-3 py-2">
            <div className="flex items-center justify-center space-x-2">
              <button
                className="p-2 text-[#1E3A8A] hover:bg-blue-100 rounded-lg transition-all duration-200"
                onClick={() => handleUpdateCustomer(item)}
                title="Chỉnh sửa"
              >
                <AiOutlineEdit size={18} />
              </button>
              <div className="inline-flex">
                <Switch
                  onChange={() => handleToggleStatus(item.id)}
                  checked={Boolean(item.status)}
                  offColor="#E5E7EB"
                  onColor="#1E3A8A"
                  offHandleColor="#9CA3AF"
                  onHandleColor="#FFFFFF"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={20}
                  width={40}
                />
              </div>
              <button
                title="Đổi mật khẩu"
                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                onClick={() => {
                  setCurrentCustomer(item);
                  setPasswordModal(true);
                }}
              >
                <TiLockOpen size={18} />
              </button>
            </div>
          </td>
        )}
      </tr>
    ));
  };

  const renderSortableHeader = (label, sortKey) => {
    const isSorted = sortBy === sortKey;
    const isAscending = isSorted && sortDir === "asc";

    return (
      <th
        className="px-3 py-2 cursor-pointer hover:bg-[#2563EB] transition-colors relative text-sm"
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center justify-center">
          {label}
          <div className="ml-2 flex flex-col">
            <AiFillCaretUp
              className={`text-xs ${isSorted && isAscending ? "text-white" : "text-blue-200"}`}
            />
            <AiFillCaretDown
              className={`text-xs ${isSorted && !isAscending ? "text-white" : "text-blue-200"}`}
            />
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Quản lý khách hàng</h1>
        <p className="text-gray-600">Quản lý thông tin và tài khoản khách hàng</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-80 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all pl-10"
            value={search}
            onChange={handleSearch}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {isAdmin && (
          <button
            className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
            onClick={() => setCreateModal(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm khách hàng
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white">
                <th className="px-3 py-2 text-center font-semibold text-sm">STT</th>
                <th className="px-3 py-2 text-center font-semibold text-sm">ID</th>
                {renderSortableHeader("Mã", "customerCode")}
                {renderSortableHeader("Tên đăng nhập", "username")}
                {renderSortableHeader("Tên", "fullname")}
                {renderSortableHeader("Email", "email")}
                {renderSortableHeader("Số điện thoại", "phone")}
                {renderSortableHeader("Trạng thái", "status")}
                {isAdmin && <th className="px-3 py-2 text-center font-semibold text-sm">Hành động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{renderRows()}</tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 font-medium mt-4">Không tìm thấy khách hàng nào</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg mt-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          {/* Bên trái: Hiển thị */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hiển thị</span>
            <select
              id="entries"
              className="bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all cursor-pointer shadow-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} khách hàng
                </option>
              ))}
            </select>
          </div>

          {/* Ở giữa: Thông tin trang */}
          <div className="flex justify-center">
            <span className="text-sm font-bold text-[#1E3A8A] bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
              Trang <span className="text-blue-700">{currentPage + 1}</span> / {totalPages || 1}
            </span>
          </div>

          {/* Bên phải: Nút điều hướng */}
          <div className="flex items-center justify-center md:justify-end gap-2 font-bold">
            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              title="Trang đầu"
            >
              &laquo;
            </button>
            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              title="Trước"
            >
              &lt;
            </button>

            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              title="Sau"
            >
              &gt;
            </button>
            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              title="Trang cuối"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>

      <UpdateModal
        isOpen={updateModal}
        setUpdateModal={setUpdateModal}
        customer={currentCustomer}
        fetchCustomers={fetchCustomers} />
      <CreateModal
        isOpen={createModal}
        onConfirm={() => setCreateModal(false)}
        onCancel={() => setCreateModal(false)}
        setCreateModal={setCreateModal}
        fetchCustomers={fetchCustomers} />

      <UpdatePasswordModal
        isOpen={passwordModal}
        setIsOpen={setPasswordModal}
        customer={currentCustomer}
      />
    </div>
  );
}