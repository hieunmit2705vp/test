import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineLock, AiOutlineHome, AiOutlineArrowLeft } from 'react-icons/ai';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-red-500">
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-4 rounded-full animate-bounce-slow">
            <AiOutlineLock className="text-red-500 text-6xl" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h1>
        <p className="text-gray-600 mb-8">
          Xin lỗi, bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn tin rằng đây là một lỗi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <AiOutlineHome className="text-xl" />
            <span>Trang chủ</span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-6 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <AiOutlineArrowLeft className="text-xl" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Nếu bạn cần hỗ trợ, vui lòng liên hệ bộ phận CSKH.
      </p>
    </div>
  );
};

export default Unauthorized;