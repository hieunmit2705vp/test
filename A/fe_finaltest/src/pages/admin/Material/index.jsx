import React, { useState, useEffect, useCallback } from "react";
import { AiOutlineEdit, AiOutlinePlus, AiOutlineSearch } from "react-icons/ai";
import Switch from "react-switch";
import MaterialService from "../../../services/MaterialService";
import { toast } from "react-toastify";
import UpdateModal from "./components/UpdateModal";
import CreateModal from "./components/CreateModal";

export default function Material() {
    const [materials, setMaterials] = useState([]);
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
    const [currentMaterial, setCurrentMaterial] = useState(null);

    const fetchMaterials = useCallback(async () => {
        try {
            const { content, totalPages } = await MaterialService.getAllMaterials(
                search,
                currentPage,
                pageSize,
                sortConfig.key,
                sortConfig.direction
            );
            setMaterials(content);
            setTotalPages(totalPages);
        } catch (error) {
            console.error("Error fetching materials:", error);
            toast.error("Lỗi khi tải danh sách chất liệu");
        }
    }, [search, currentPage, pageSize, sortConfig]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setCurrentPage(0);
    };

    const handlePageChange = (direction) => {
        setCurrentPage((prev) =>
            Math.max(0, Math.min(prev + direction, totalPages - 1))
        );
    };

    const handleUpdateMaterial = (material) => {
        setCurrentMaterial(material);
        setUpdateModal(true);
    };

    const handleToggleStatus = async (id) => {
        try {
            await MaterialService.toggleStatusMaterial(id);
            setMaterials((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: !item.status } : item
                )
            );
            toast.success("Cập nhật trạng thái chất liệu thành công!");
        } catch (error) {
            console.error("Error toggling material status:", error);
            toast.error("Không thể cập nhật trạng thái chất liệu.");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-[#1E3A8A] mb-8 border-b-2 border-[#1E3A8A] pb-2 inline-block">
                    Quản Lý Chất Liệu
                </h1>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="relative w-full md:w-96 mb-4 md:mb-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <AiOutlineSearch className="text-gray-400 text-lg" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm chất liệu..."
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
                                    <th className="py-4 px-6 font-semibold tracking-wider w-20 text-center">
                                        STT
                                    </th>
                                    <th
                                        className="py-4 px-6 font-semibold tracking-wider cursor-pointer hover:bg-[#163172] transition-colors"
                                        onClick={() => handleSort("materialName")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Tên Chất Liệu
                                            {sortConfig.key === "materialName" && (
                                                <span>
                                                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="py-4 px-6 font-semibold tracking-wider text-center cursor-pointer hover:bg-[#163172] transition-colors"
                                        onClick={() => handleSort("status")}
                                    >
                                        Trạng Thái
                                    </th>
                                    <th className="py-4 px-6 font-semibold tracking-wider text-center">
                                        Hành Động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-base font-light">
                                {materials.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-gray-200 hover:bg-indigo-50 transition-colors duration-200"
                                    >
                                        <td className="py-4 px-6 text-center font-medium">
                                            {index + 1 + currentPage * pageSize}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-gray-800">
                                            {item.materialName}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span
                                                className={`py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide border ${item.status
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                                    }`}
                                            >
                                                {item.status ? "Kích hoạt" : "Ngưng hoạt động"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center justify-center transition-all duration-200 shadow-sm border border-blue-200"
                                                    onClick={() => handleUpdateMaterial(item)}
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
                                {materials.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500 italic">
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
                            {[5, 10, 20, 50].map((size) => (
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
                            onClick={() => handlePageChange(-1)}
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
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === totalPages - 1 || totalPages === 0}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            <UpdateModal
                isOpen={updateModal}
                setUpdateModal={setUpdateModal}
                material={currentMaterial}
                fetchMaterials={fetchMaterials}
            />
            <CreateModal
                isOpen={createModal}
                onConfirm={() => setCreateModal(false)}
                onCancel={() => setCreateModal(false)}
                fetchMaterials={fetchMaterials}
            />
        </div>
    );
}
