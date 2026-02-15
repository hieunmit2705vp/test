import api from "../ultils/api";
import store from "../store";
import { setUser } from "../store/userSlice";

const AuthService = {
  // ✅ Login - Chỉ dùng localStorage qua Redux
  async login(credentials) {
    try {
      const response = await api.post(`/auth/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, username, role, fullName, email } = response.data.data;

      // ✅ Dispatch vào Redux store → tự động lưu localStorage qua userSlice
      store.dispatch(setUser({
        name: fullName || username,
        email: email || "",
        role: role,
        token: token
      }));

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  // ✅ Logout - Chỉ xóa localStorage qua Redux
  logout() {
    // Redux action sẽ tự động xóa localStorage
    store.dispatch({ type: 'user/logout' });
  },

  // ✅ Get token từ Redux state (đã load từ localStorage)
  getToken() {
    const state = store.getState();
    return state.user?.token || null;
  },

  // ✅ Get role từ Redux state (đã load từ localStorage)
  getRole() {
    const state = store.getState();
    return state.user?.role || null;
  },

  // ✅ Restore session - Redux đã tự động load từ localStorage khi app khởi động
  restoreUserSession() {
    const state = store.getState();
    return state.user?.isLoggedIn || false;
  },

  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Không tìm thấy token, vui lòng đăng nhập lại.");
      }

      const response = await api.get("/auth/current-user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.data;
      store.dispatch(setUser(user));
      return user;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      throw (
        error.response?.data || {
          message: "Không thể lấy thông tin người dùng.",
        }
      );
    }
  },

  async getCurrentUserAddresses() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Không tìm thấy token, vui lòng đăng nhập lại.");
      }

      const response = await api.get("/auth/current-user/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ người dùng:", error);
      throw (
        error.response?.data || { message: "Không thể lấy địa chỉ người dùng." }
      );
    }
  },

  async register(registerData) {
    try {
      const response = await api.post("/auth/register", registerData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      throw error.response?.data || { message: "Không thể đăng ký." };
    }
  },

  async forgetPassword(usernameOrEmail) {
    try {
      const response = await api.post(
        "/auth/forget-password",
        { usernameOrEmail },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi yêu cầu quên mật khẩu:", error);
      throw (
        error.response?.data || { message: "Không thể yêu cầu quên mật khẩu." }
      );
    }
  },
};

export default AuthService;
