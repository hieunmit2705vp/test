import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AiFillCaretUp, AiFillCaretDown, AiOutlineEdit } from "react-icons/ai";
import { TiLockOpen } from "react-icons/ti";
import Switch from "react-switch";
import EmployeeService from "../../../services/EmployeeService";
import { toast } from "react-toastify";
import UpdateModal from "./components/UpdateModal";
import CreateModal from "./components/CreateModal";
import UpdatePasswordModal from "./components/UpdatePasswordModal";

export default function Employee() {
  const { role } = useSelector((state) => state.user);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });
  const [updateModal, setUpdateModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);

  // Kiểm tra vai trò ngay khi component được render
  if (role !== "ADMIN") {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-l-4 border-red-500">
          <div className="flex items-center">
            <svg className="w-12 h-12 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h2 className="text-2xl font-bold text-red-600 mb-1">Truy cập bị từ chối</h2>
              <p className="text-gray-600">Vui lòng đăng nhập dưới quyền ADMIN để tiếp tục</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fetchEmployees = async () => {
    try {
      const { content, totalPages } = await EmployeeService.getAll(
        currentPage,
        pageSize,
        search,
        sortConfig.key,
        sortConfig.direction
      );
      setEmployees(content);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response?.status === 403) {
        toast.error("Vui lòng đăng nhập dưới quyền ADMIN");
      } else {
        toast.error("Không thể tải danh sách nhân viên. Vui lòng thử lại!");
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, pageSize, search, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
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

  const handleUpdateEmployee = (employee) => {
    setCurrentEmployee(employee);
    setUpdateModal(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await EmployeeService.toggleStatus(id);
      const updatedItems = employees.map((item) =>
        item.id === id ? { ...item, status: !item.status } : item
      );
      setEmployees(updatedItems);
      toast.success("Thay đổi trạng thái nhân viên thành công!");
    } catch (error) {
      console.error("Error toggling employee status:", error);
      toast.error("Không thể thay đổi trạng thái nhân viên. Vui lòng thử lại!");
    }
  };

  const renderRows = () => {
    const sortedItems = [...employees].sort((a, b) => {
      if (sortConfig.key === null) return 0;

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortedItems.map((item, index) => (
      <tr
        key={item.id}
        className="hover:bg-indigo-50 transition-colors duration-200"
      >
        <td className="px-3 py-2 text-center font-medium text-gray-700">{index + 1}</td>
        <td className="px-3 py-2 font-mono text-xs text-gray-600">{item.employeeCode}</td>
        <td className="px-3 py-2">
          <div className="flex items-center space-x-2">
            <img src={item.photo} className="w-8 h-8 rounded-full ring-2 ring-[#1E3A8A] ring-offset-1" alt="avatar" />
            <span className="font-medium text-gray-800">{item.username}</span>
          </div>
        </td>
        <td className="px-3 py-2 font-medium text-gray-700">{item.fullname}</td>
        <td className="px-3 py-2">
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
            {item.role.name}
          </span>
        </td>
        <td className="px-3 py-2 text-sm text-gray-600">{item.email}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{item.phone}</td>
        <td className="px-3 py-2">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${item.gender ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
            }`}>
            {item.gender ? "Nam" : "Nữ"}
          </span>
        </td>
        <td className="px-3 py-2">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium flex items-center justify-center w-fit mx-auto ${item.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${item.status ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            {item.status ? "Kích hoạt" : "Ngừng hoạt động"}
          </span>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-center space-x-2">
            <button
              className="p-2 text-[#1E3A8A] hover:bg-blue-100 rounded-lg transition-all duration-200"
              onClick={() => handleUpdateEmployee(item)}
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
                setCurrentEmployee(item);
                setPasswordModal(true);
              }}
            >
              <TiLockOpen size={18} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const renderSortableHeader = (label, sortKey) => {
    const isSorted = sortConfig.key === sortKey;
    const isAscending = isSorted && sortConfig.direction === "asc";

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
        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Quản lý nhân viên</h1>
        <p className="text-gray-600">Quản lý thông tin và quyền hạn của nhân viên</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-80 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all pl-10"
            value={search}
            onChange={handleSearch}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
          onClick={() => setCreateModal(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white">
                <th className="px-3 py-2 text-center font-semibold text-sm">STT</th>
                {renderSortableHeader("Mã", "employeeCode")}
                {renderSortableHeader("Tên đăng nhập", "username")}
                {renderSortableHeader("Tên", "tenNhanVien")}
                {renderSortableHeader("Vai trò", "role_name")}
                {renderSortableHeader("Email", "email")}
                {renderSortableHeader("Số điện thoại", "phone")}
                {renderSortableHeader("Giới tính", "gender")}
                {renderSortableHeader("Trạng thái", "status")}
                <th className="px-3 py-2 text-center font-semibold text-sm">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{renderRows()}</tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 font-medium mt-4">Không tìm thấy nhân viên nào</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6 bg-white rounded-xl shadow-lg px-6 py-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <label htmlFor="entries" className="text-sm font-medium text-gray-700">
            Hiển thị
          </label>
          <select
            id="entries"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-gray-700">nhân viên</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            ← Trước
          </button>

          <div className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg font-semibold text-sm">
            Trang {currentPage + 1} / {totalPages || 1}
          </div>

          <button
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            Sau →
          </button>
        </div>
      </div>

      <UpdateModal
        isOpen={updateModal}
        setUpdateModal={setUpdateModal}
        employee={currentEmployee}
        fetchEmployees={fetchEmployees}
      />
      <CreateModal
        isOpen={createModal}
        onConfirm={() => setCreateModal(false)}
        onCancel={() => setCreateModal(false)}
        fetchEmployees={fetchEmployees}
      />

      <UpdatePasswordModal
        isOpen={passwordModal}
        setIsOpen={setPasswordModal}
        employee={currentEmployee}
      />
    </div>
  );
}
