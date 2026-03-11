import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineLock } from "react-icons/ai";
import { Link } from "react-router-dom";
import AuthService from "../../services/AuthService";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await AuthService.register(formData);
      setMessage(response.message || "Đăng ký thành công.");
      // Reset form sau khi đăng ký thành công
      setFormData({ username: "", email: "", phone: "", password: "" });
      
      // Tự động chuyển hướng sang trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Không thể đăng ký.");
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
          <h1 className="text-5xl font-bold text-white mb-6">Tham gia ngay</h1>
          <p className="text-xl text-blue-100 text-center max-w-md">
            Tạo tài khoản để trải nghiệm mua sắm tuyệt vời tại THE BOYS
          </p>
          <div className="mt-12 flex items-center space-x-4">
            <div className="flex items-center text-blue-100">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Miễn phí đăng ký</span>
            </div>
            <div className="flex items-center text-blue-100">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Ưu đãi độc quyền</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-600 opacity-20"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-500 opacity-20"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Đăng ký tài khoản</h2>
            <p className="text-gray-600 mt-2">Điền thông tin để bắt đầu</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <AiOutlineUser className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="text"
                  name="username"
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <AiOutlineMail className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <AiOutlinePhone className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="text"
                  name="phone"
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <AiOutlineLock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="h-5 w-5" />
                    ) : (
                      <AiOutlineEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4 font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md transition-all duration-200 transform hover:scale-[1.02]"
              >
                Đăng ký
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
