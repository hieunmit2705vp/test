import React, { useState, useEffect } from "react";
import AuditLogService from "../../../services/AuditLogService";
import { FaHistory, FaSearch, FaSyncAlt, FaEye, FaTimes, FaExchangeAlt } from "react-icons/fa";
import { format } from "date-fns";
import _ from "lodash";

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        page: 0,
        size: 10,
        startDate: "",
        endDate: "",
        actor: "",
        action: "",
        entityName: "",
        search: "",
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page: filters.page,
                size: filters.size,
                search: filters.search || undefined,
                actor: filters.actor || undefined,
                action: filters.action || undefined,
                entityName: filters.entityName || undefined,
                startDate: filters.startDate ? `${filters.startDate}T00:00:00` : undefined,
                endDate: filters.endDate ? `${filters.endDate}T23:59:59` : undefined,
            };

            const response = await AuditLogService.getAllLogs(params);
            if (response.status === "success") {
                setLogs(response.data.content);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters.page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value, page: 0 }));
    };

    const handleSearch = () => {
        fetchLogs();
    };

    const handleReset = () => {
        setFilters({
            page: 0,
            size: 10,
            startDate: "",
            endDate: "",
            actor: "",
            action: "",
            entityName: "",
            search: "",
        });
    };

    const handleShowDetail = (log) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    const getActionColor = (action) => {
        switch (action) {
            case "CREATE": return "bg-green-100 text-green-700 border-green-200";
            case "UPDATE": return "bg-blue-100 text-blue-700 border-blue-200";
            case "DELETE": return "bg-red-100 text-red-700 border-red-200";
            case "PAYMENT": return "bg-purple-100 text-purple-700 border-purple-200";
            case "TOGGLE_STATUS": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const renderDiffJson = (jsonString, otherJsonString, type) => {
        if (!jsonString) return <span className="text-gray-400 italic">Không có dữ liệu</span>;

        try {
            const current = JSON.parse(jsonString);
            const other = otherJsonString ? JSON.parse(otherJsonString) : null;

            const renderValue = (val, otherVal, key, depth = 0) => {
                const isChanged = otherVal !== undefined && !_.isEqual(val, otherVal);

                if (typeof val !== 'object' || val === null) {
                    const bgColor = isChanged ? (type === 'old' ? 'bg-red-500/20 text-red-200 px-1 rounded' : 'bg-green-500/20 text-green-200 px-1 rounded') : '';
                    return <span className={bgColor}>{JSON.stringify(val)}</span>;
                }

                const keys = Object.keys(val);
                return (
                    <span>
                        {"{"}
                        <div className="ml-4">
                            {keys.map((k, index) => {
                                const v = val[k];
                                const oV = otherVal ? otherVal[k] : undefined;
                                const fieldChanged = oV !== undefined && !_.isEqual(v, oV);
                                const lineClass = fieldChanged ? (type === 'old' ? 'bg-red-900/20' : 'bg-green-900/20') : '';

                                return (
                                    <div key={k} className={`${lineClass} transition-colors duration-200`}>
                                        <span className="text-blue-400">"{k}"</span>: {renderValue(v, oV, k, depth + 1)}
                                        {index < keys.length - 1 ? "," : ""}
                                    </div>
                                );
                            })}
                        </div>
                        {"}"}
                    </span>
                );
            };

            return (
                <div className="relative group">
                    <pre className="text-[11px] font-mono bg-gray-900 text-blue-100 p-5 rounded-2xl overflow-auto max-h-[450px] leading-relaxed border border-gray-800 shadow-inner scrollbar-thin scrollbar-thumb-gray-700">
                        {renderValue(current, other)}
                    </pre>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-gray-400 px-2 py-1 rounded text-[10px] pointer-events-none uppercase tracking-widest font-bold">
                        JSON View
                    </div>
                </div>
            );
        } catch (e) {
            return <div className="p-4 bg-gray-100 rounded-xl text-gray-600 font-mono text-xs border border-gray-200">{jsonString}</div>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaHistory className="text-blue-600" />
                        Lịch sử hệ thống
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi mọi thay đổi dữ liệu của người dùng và hệ thống</p>
                </div>
            </div>

            {/* Global Search & Action Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <input
                        type="text"
                        name="search"
                        placeholder="Tìm kiếm nhanh mã ID, người dùng, đối tượng, ghi chú..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-gray-700"
                    />
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    {filters.search && (
                        <button 
                            onClick={() => setFilters(prev => ({ ...prev, search: "", page: 0 }))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={fetchLogs}
                        className="flex-1 md:flex-none px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                    >
                        <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Làm mới
                    </button>
                    <button
                        onClick={handleSearch}
                        className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                        <FaSearch /> Tìm ngay
                    </button>
                </div>
            </div>

            {/* Detailed Filters (Collapsible feeling) */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Người thực hiện</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="actor"
                                placeholder="Tên người dùng..."
                                value={filters.actor}
                                onChange={handleFilterChange}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Hành động</label>
                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">Tất cả hành động</option>
                            <option value="CREATE">CREATE (Tạo mới)</option>
                            <option value="UPDATE">UPDATE (Cập nhật)</option>
                            <option value="DELETE">DELETE (Xóa)</option>
                            <option value="PAYMENT">PAYMENT (Thanh toán)</option>
                            <option value="TOGGLE_STATUS">TOGGLE_STATUS (Trạng thái)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Đối tượng</label>
                        <input
                            type="text"
                            name="entityName"
                            placeholder="Ví dụ: Product, Brand..."
                            value={filters.entityName}
                            onChange={handleFilterChange}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:col-span-1">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Từ ngày</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Đến ngày</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-wider">
                                <th className="px-6 py-4 text-xs font-bold text-gray-600">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600">Thời gian</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600">Người thực hiện</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600">Đối tượng</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600">Hành động</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600">Ghi chú</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        Chưa có nhật ký nào trùng khớp.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-600 tabular-nums font-bold">
                                            #{log.id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 tabular-nums font-medium">
                                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                                    {log.actor?.charAt(0) || "S"}
                                                </div>
                                                <span className="font-semibold text-gray-800">{log.actor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-gray-500 border border-gray-200">
                                                {log.entityName} #{log.entityId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {log.notes}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleShowDetail(log)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Xem chi tiết thay đổi"
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 font-medium">
                        Trang <span className="text-gray-900 font-bold">{filters.page + 1}</span> của <span className="text-gray-900 font-bold">{totalPages || 1}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={filters.page === 0 || loading}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="px-4 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Trước
                        </button>
                        <button
                            disabled={filters.page >= totalPages - 1 || loading}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Chi tiết thay đổi dữ liệu</h3>
                                <p className="text-xs text-gray-500">Mã nhật ký: #{selectedLog.id} • Đối tượng: {selectedLog.entityName} (#{selectedLog.entityId})</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex w-10 h-10 rounded-full bg-white border border-gray-100 shadow-lg items-center justify-center text-gray-400">
                                    <FaExchangeAlt />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-black text-red-600 uppercase tracking-[0.2em]">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                        Dữ liệu cũ (Old State)
                                    </h4>
                                    {renderDiffJson(selectedLog.oldValue, selectedLog.newValue, 'old')}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-black text-green-600 uppercase tracking-[0.2em]">
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                        Dữ liệu mới (New State)
                                    </h4>
                                    {renderDiffJson(selectedLog.newValue, selectedLog.oldValue, 'new')}
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2 px-1">Ghi chú hệ thống</h5>
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                    {selectedLog.notes || "Không có ghi chú bổ sung cho thay đổi này."}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLog;
