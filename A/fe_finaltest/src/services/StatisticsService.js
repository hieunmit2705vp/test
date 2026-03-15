import api from "../ultils/api"; // Import instance Axios đã cấu hình

const API_BASE_URL = "/api/statistics"; // Đường dẫn tương đối vì baseURL đã được cấu hình trong api.js

const StatisticsService = {
    // Thống kê gộp Doanh thu & Lợi nhuận
    getDailyStats: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/daily-stats`, {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy thống kê ngày:", error.response?.data || error.message);
            throw error;
        }
    },

    getWeeklyStats: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/weekly-stats`, {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy thống kê tuần:", error.response?.data || error.message);
            throw error;
        }
    },

    getMonthlyStats: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/monthly-stats`, {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy thống kê tháng:", error.response?.data || error.message);
            throw error;
        }
    },

    getYearlyStats: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/yearly-stats`, {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy thống kê năm:", error.response?.data || error.message);
            throw error;
        }
    },

    // Các phương thức cũ (Đã thay thế bằng Stats)
    getDailyRevenue: async () => [],
    getWeeklyRevenue: async () => [],
    getMonthlyRevenue: async () => [],
    getYearlyRevenue: async () => [],

    // Lấy doanh thu theo kênh (online vs tại quầy)
    getChannelRevenue: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/channel-revenue`, {
                params: { startDate, endDate }
            });
            console.log("✅ Doanh thu theo kênh:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy doanh thu theo kênh:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tỷ lệ đơn hàng theo trạng thái
    getOrderStatusDistribution: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/order-status-distribution`, {
                params: { startDate, endDate }
            });
            console.log("✅ Tỷ lệ đơn hàng theo trạng thái:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy tỷ lệ đơn hàng theo trạng thái:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tỷ lệ thanh toán theo phương thức
    getPaymentMethodDistribution: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/payment-method-distribution`, {
                params: { startDate, endDate }
            });
            console.log("✅ Tỷ lệ thanh toán theo phương thức:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy tỷ lệ thanh toán theo phương thức:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy top 5 khách hàng mua nhiều nhất
    getTop5Customers: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/top-5-customers`, {
                params: {
                    ...(startDate ? { startDate } : {}),
                    ...(endDate ? { endDate } : {}),
                }
            });
            console.log("✅ Top 5 khách hàng:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy top 5 khách hàng:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tỷ lệ sử dụng voucher
    getVoucherUsage: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/voucher-usage`);
            console.log("✅ Tỷ lệ sử dụng voucher:", response.data.data);
            return response.data.data; // Trả về dữ liệu tỷ lệ sử dụng voucher
        } catch (error) {
            console.error("❌ Lỗi khi lấy tỷ lệ sử dụng voucher:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy top 5 sản phẩm tồn kho nhiều nhất
    getTop5InventoryProducts: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/top-5-inventory-products`);
            console.log("✅ Top 5 sản phẩm tồn kho:", response.data.data);
            return response.data.data; // Trả về dữ liệu top 5 sản phẩm tồn kho
        } catch (error) {
            console.error("❌ Lỗi khi lấy top 5 sản phẩm tồn kho:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tỷ lệ giỏ hàng bị bỏ quên
    getCartAbandonmentRate: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/cart-abandonment-rate`);
            console.log("✅ Tỷ lệ giỏ hàng bị bỏ quên:", response.data.data);
            return response.data.data; // Trả về dữ liệu tỷ lệ giỏ hàng bị bỏ quên
        } catch (error) {
            console.error("❌ Lỗi khi lấy tỷ lệ giỏ hàng bị bỏ quên:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tổng doanh thu
    getTotalRevenue: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/total-revenue`);
            console.log("✅ Tổng doanh thu:", response.data.data);
            return response.data.data; // Trả về dữ liệu tổng doanh thu
        } catch (error) {
            console.error("❌ Lỗi khi lấy tổng doanh thu:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tổng số khách hàng
    getTotalCustomers: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/total-customers`);
            console.log("✅ Tổng số khách hàng:", response.data.data);
            return response.data.data; // Trả về dữ liệu tổng số khách hàng
        } catch (error) {
            console.error("❌ Lỗi khi lấy tổng số khách hàng:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tổng số hóa đơn
    getTotalInvoices: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/total-invoices`);
            console.log("✅ Tổng số hóa đơn:", response.data.data);
            return response.data.data; // Trả về dữ liệu tổng số hóa đơn
        } catch (error) {
            console.error("❌ Lỗi khi lấy tổng số hóa đơn:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tổng số quản trị viên
    getTotalAdmins: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/total-admins`);
            console.log("✅ Tổng số quản trị viên:", response.data.data);
            return response.data.data; // Trả về dữ liệu tổng số quản trị viên
        } catch (error) {
            console.error("❌ Lỗi khi lấy tổng số quản trị viên:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy tổng số nhân viên
    getTotalStaff: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/total-staff`);
            console.log("✅ Tổng số nhân viên:", response.data.data);
            return response.data.data; // Trả về dữ liệu tổng số nhân viên
        } catch (error) {
            console.error("❌ Lỗi khi lấy tổng số nhân viên:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy danh sách sản phẩm bán chạy nhất
    getTopSellingProducts: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/top-5-products`, {
                params: { startDate, endDate },
            });
            console.log("✅ Top sản phẩm bán chạy:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy top sản phẩm bán chạy:", error.response?.data || error.message);
            throw error;
        }
    },

    // Tổng lợi nhuận
    getTotalProfit: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/total-profit`);
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy tổng lợi nhuận:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy thống kê theo khoảng thời gian (Doanh thu, Lợi nhuận, Số đơn hàng)
    getPeriodStatistics: async (startDate, endDate) => {
        try {
            const response = await api.get(`${API_BASE_URL}/period-stats`, {
                params: { startDate, endDate },
            });
            console.log("✅ Thống kê theo khoảng thời gian:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy thống kê theo khoảng thời gian:", error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy lợi nhuận cũ (Đã thay thế bằng Stats)
    getDailyProfit: async () => [],
    getMonthlyProfit: async () => [],
    getWeeklyProfit: async () => [],
    getYearlyProfit: async () => [],
};

export default StatisticsService;