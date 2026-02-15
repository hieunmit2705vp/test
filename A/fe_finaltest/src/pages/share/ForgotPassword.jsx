import React, { useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { Link } from "react-router-dom";
import AuthService from "../../services/AuthService";

const ForgotPasswordForm = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await AuthService.forgetPassword(usernameOrEmail);
      setMessage(response.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.");
    } catch (err) {
      setError(err.message || "Không tìm thấy tài khoản với thông tin này.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-800 opacity-20"></div>
        <div className="z-10 flex flex-col items-center">
          <div className="w-32 h-32 mb-8 rounded-full bg-white p-2 shadow-lg">
            <img
              src="./logo.jpg"
              alt="THE BOYS Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">Quên mật khẩu?</h1>
          <p className="text-xl text-blue-100 text-center max-w-md">
            Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập tài khoản dễ dàng.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-600 opacity-20"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-500 opacity-20"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Khôi phục mật khẩu</h2>
            <p className="text-gray-600 mt-2">Nhập email hoặc tên đăng nhập của bạn</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AiOutlineMail className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4 font-medium text-white shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-blue-800"
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Gửi yêu cầu"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <Link
              to="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
