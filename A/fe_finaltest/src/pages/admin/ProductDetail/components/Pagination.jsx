import React from 'react';

const Pagination = ({ page, totalPages, setPage, pageSize, setPageSize }) => {
  return (
    <div className="flex justify-between items-center mt-6 bg-white rounded-xl shadow-lg px-6 py-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <label htmlFor="entries" className="text-sm font-medium text-gray-700">
          Hiển thị
        </label>
        <select
          id="entries"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span className="text-sm text-gray-700">sản phẩm</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          onClick={() => setPage(page > 0 ? page - 1 : 0)}
          disabled={page === 0}
        >
          ← Trước
        </button>

        <div className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg font-semibold text-sm">
          Trang {page + 1} / {totalPages || 1}
        </div>

        <button
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          onClick={() => setPage(page < totalPages - 1 ? page + 1 : totalPages - 1)}
          disabled={page >= totalPages - 1}
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
