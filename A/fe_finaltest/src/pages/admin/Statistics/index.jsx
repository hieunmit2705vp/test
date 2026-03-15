import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import StatisticsService from "../../../services/StatisticsService";
import { Card, CardContent } from "./components/card";
import DailyRevenueChart from "./components/DailyRevenueChart";
import WeeklyRevenueChart from "./components/WeeklyRevenueChart";
import MonthlyRevenueChart from "./components/MonthlyRevenueChart";
import YearlyRevenueChart from "./components/YearlyRevenueChart";
import ChannelRevenueChart from "./components/ChannelRevenueChart";
import OrderStatusDistributionChart from "./components/OrderStatusDistributionChart";
import TopCustomersChart from "./components/TopCustomersChart";
import TopInventoryProductsChart from "./components/TopInventoryProductsChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import vi from 'date-fns/locale/vi';

registerLocale('vi', vi);
setDefaultLocale('vi');

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-black text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

const StatisticsPage = () => {
  const { role } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [topError, setTopError] = useState(null);
  const [appliedStart, setAppliedStart] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [appliedEnd, setAppliedEnd] = useState(new Date());

  // Thống kê theo khoảng thời gian
  const [periodStats, setPeriodStats] = useState({
    revenue: 0,
    profit: 0,
    orderCount: 0,
    inStoreOrderCount: 0,
    onlineOrderCount: 0
  });

  if (role !== "ADMIN") {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-red-600 text-xl font-bold">Vui lòng đăng nhập dưới quyền ADMIN</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          totalRevenueRes,
          totalProfitRes,
          totalCustomersRes,
          totalInvoicesRes,
          totalAdminsRes,
          totalStaffRes,
        ] = await Promise.all([
          StatisticsService.getTotalRevenue(),
          StatisticsService.getTotalProfit(),
          StatisticsService.getTotalCustomers(),
          StatisticsService.getTotalInvoices(),
          StatisticsService.getTotalAdmins(),
          StatisticsService.getTotalStaff(),
        ]);
        setTotalRevenue(totalRevenueRes || 0);
        setTotalProfit(totalProfitRes || 0);
        setTotalCustomers(totalCustomersRes || 0);
        setTotalInvoices(totalInvoicesRes || 0);
        setTotalAdmins(totalAdminsRes || 0);
        setTotalStaff(totalStaffRes || 0);
      } catch (err) {
        console.error("Lỗi tải thống kê tổng quan:", err);
      }
    };
    fetchData();
  }, []);

  const [startDateTime, setStartDateTime] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [endDateTime, setEndDateTime] = useState(new Date());

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  const formatForBackend = (date) => {
    if (!date) return null;
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const setPreset = (preset) => {
    const now = new Date();

    if (preset === "today") {
      setStartDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
      setEndDateTime(now);
    } else if (preset === "7days") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      setStartDateTime(start);
      setEndDateTime(now);
    } else if (preset === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      setStartDateTime(start);
      setEndDateTime(now);
    } else if (preset === "3months") {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
      setStartDateTime(start);
      setEndDateTime(now);
    } else if (preset === "year") {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      setStartDateTime(start);
      setEndDateTime(now);
    }
  };

  const fetchTopSellingProducts = async () => {
    if (!startDateTime || !endDateTime) {
      setTopError("Vui lòng chọn khoảng thời gian.");
      return;
    }
    setLoadingTop(true);
    setTopError(null);
    try {
      const sDate = formatForBackend(startDateTime);
      const eDate = formatForBackend(endDateTime);

      const [topProducts, topCusts, pStats] = await Promise.all([
        StatisticsService.getTopSellingProducts(sDate, eDate),
        StatisticsService.getTop5Customers(sDate, eDate),
        StatisticsService.getPeriodStatistics(sDate, eDate)
      ]);

      setTopSellingProducts(topProducts || []);
      setTopCustomers(topCusts || []);
      setPeriodStats(pStats || { revenue: 0, profit: 0, orderCount: 0, inStoreOrderCount: 0, onlineOrderCount: 0 });

      // Cập nhật ngày đã áp dụng cho toàn bộ báo cáo
      setAppliedStart(startDateTime);
      setAppliedEnd(endDateTime);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu thống kê:", err);
      setTopError("Không thể tải danh sách sản phẩm bán chạy.");
    } finally {
      setLoadingTop(false);
    }
  };

  const CustomTimeInput = ({ date, onTimeChange }) => {
    // Đảm bảo date luôn tồn tại để tránh lỗi .getHours()
    const safeDate = date instanceof Date ? date : new Date();
    const hours = safeDate.getHours();
    const minutes = safeDate.getMinutes();
    const seconds = safeDate.getSeconds();

    const handleChange = (type, value) => {
      const newDate = new Date(safeDate);
      if (type === 'h') newDate.setHours(parseInt(value));
      if (type === 'm') newDate.setMinutes(parseInt(value));
      if (type === 's') newDate.setSeconds(parseInt(value));

      onTimeChange(newDate); // Cập nhật trực tiếp lên state cha
    };

    return (
      <div
        className="flex items-center justify-center gap-1 p-2 bg-gray-50 border-t border-gray-100 rounded-b-xl"
        onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng popup khi nhấn vào vùng đệm
      >
        <select
          value={hours}
          onChange={(e) => {
            e.stopPropagation();
            handleChange('h', e.target.value);
          }}
          className="bg-white border border-gray-200 rounded-lg p-1 text-sm font-bold focus:outline-none"
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}h</option>
          ))}
        </select>
        <span className="text-gray-400 font-bold">:</span>
        <select
          value={minutes}
          onChange={(e) => {
            e.stopPropagation();
            handleChange('m', e.target.value);
          }}
          className="bg-white border border-gray-200 rounded-lg p-1 text-sm font-bold focus:outline-none"
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}p</option>
          ))}
        </select>
        <span className="text-gray-400 font-bold">:</span>
        <select
          value={seconds}
          onChange={(e) => {
            e.stopPropagation();
            handleChange('s', e.target.value);
          }}
          className="bg-white border border-gray-200 rounded-lg p-1 text-sm font-bold focus:outline-none"
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}s</option>
          ))}
        </select>
      </div>
    );
  };

  const tabs = [
    { key: "daily", label: "Theo Ngày" },
    { key: "weekly", label: "Theo Tuần" },
    { key: "monthly", label: "Theo Tháng" },
    { key: "yearly", label: "Theo Năm" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-800">📊 Thống kê & Báo cáo</h1>
          <p className="text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>

        {/* Summary Cards - Moved to very top */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Tổng doanh thu" value={`${Number(totalRevenue).toLocaleString("vi-VN")}₫`} icon="💰" color="bg-blue-50 text-blue-600" />
          <StatCard title="Tổng lợi nhuận" value={`${Number(totalProfit).toLocaleString("vi-VN")}₫`} icon="📈" color="bg-emerald-50 text-emerald-600" />
          <StatCard title="Khách hàng" value={totalCustomers} icon="👥" color="bg-green-50 text-green-600" />
          <StatCard title="Hóa đơn" value={totalInvoices} icon="🧾" color="bg-purple-50 text-purple-600" />
          <StatCard title="Admin" value={totalAdmins} icon="🛡️" color="bg-red-50 text-red-600" />
          <StatCard title="Nhân viên" value={totalStaff} icon="👔" color="bg-yellow-50 text-yellow-600" />
        </div>

        {/* Global Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl font-bold text-gray-800">Bộ lọc thời gian báo cáo</h2>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { label: "Hôm nay", key: "today" },
              { label: "7 ngày qua", key: "7days" },
              { label: "Tháng này", key: "month" },
              { label: "3 tháng qua", key: "3months" },
              { label: "Năm nay", key: "year" },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className="px-4 py-2 text-xs font-bold bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            {/* Start Date Time */}
            <div className="flex flex-col gap-4">
              <label className="text-sm text-gray-700 font-bold flex items-center gap-2">
                <span className="text-blue-600 font-black">📅</span> Từ ngày giờ
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <DatePicker
                    selected={startDateTime}
                    onChange={(date) => setStartDateTime(date)}
                    showTimeInput
                    customTimeInput={<CustomTimeInput onTimeChange={setStartDateTime} />}
                    dateFormat="dd/MM/yyyy HH:mm:ss"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                    placeholderText="Chọn thời điểm bắt đầu"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            </div>

            {/* End Date Time */}
            <div className="flex flex-col gap-4">
              <label className="text-sm text-gray-700 font-bold flex items-center gap-2">
                <span className="text-red-500 font-black">📅</span> Đến ngày giờ
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <DatePicker
                    selected={endDateTime}
                    onChange={(date) => setEndDateTime(date)}
                    showTimeInput
                    customTimeInput={<CustomTimeInput onTimeChange={setEndDateTime} />}
                    dateFormat="dd/MM/yyyy HH:mm:ss"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                    placeholderText="Chọn thời điểm kết thúc"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center mt-2">
              <button
                onClick={fetchTopSellingProducts}
                disabled={loadingTop}
                className="bg-blue-600 text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loadingTop ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang tính toán...
                  </>
                ) : (
                  <>🔍 Áp dụng bộ lọc cho toàn bộ báo cáo</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Period Summary Cards */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold opacity-90">Thống kê theo khoảng lọc</h3>
              <p className="text-sm opacity-75 mt-1 border-l-2 border-white/30 pl-3 italic">
                {appliedStart?.toLocaleString('vi-VN')} - {appliedEnd?.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-[3] w-full">
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Doanh thu kỳ</p>
                <p className="text-xl font-black">{periodStats.revenue?.toLocaleString("vi-VN")}₫</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Lợi nhuận kỳ</p>
                <p className="text-xl font-black text-emerald-300">{periodStats.profit?.toLocaleString("vi-VN")}₫</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Tổng đơn</p>
                <p className="text-xl font-black text-yellow-300">{periodStats.orderCount?.toLocaleString("vi-VN")}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Đơn tại quầy</p>
                <p className="text-xl font-black text-orange-300">{periodStats.inStoreOrderCount?.toLocaleString("vi-VN")}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Đơn Online</p>
                <p className="text-xl font-black text-cyan-300">{periodStats.onlineOrderCount?.toLocaleString("vi-VN")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart with Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Biểu đồ doanh thu</h2>
          <div className="flex gap-2 border-b border-gray-100 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-all ${activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "daily" && <DailyRevenueChart startDate={formatForBackend(appliedStart)} endDate={formatForBackend(appliedEnd)} />}
          {activeTab === "weekly" && <WeeklyRevenueChart startDate={formatForBackend(appliedStart)} endDate={formatForBackend(appliedEnd)} />}
          {activeTab === "monthly" && <MonthlyRevenueChart startDate={formatForBackend(appliedStart)} endDate={formatForBackend(appliedEnd)} />}
          {activeTab === "yearly" && <YearlyRevenueChart startDate={formatForBackend(appliedStart)} endDate={formatForBackend(appliedEnd)} />}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChannelRevenueChart startDate={formatForBackend(appliedStart)} endDate={formatForBackend(appliedEnd)} />
          <OrderStatusDistributionChart startDate={formatForBackend(appliedStart)} endDate={formatForBackend(appliedEnd)} />
        </div>


        {/* Top Customers + Top Selling Products side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top 5 khách hàng */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👑</span>
              <h2 className="text-xl font-bold text-gray-800">Top 5 khách hàng chi tiêu nhiều nhất</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-3 text-left font-bold text-gray-600 w-12">Hạng</th>
                    <th className="py-3 px-3 text-left font-bold text-gray-600">Khách hàng</th>
                    <th className="py-3 px-3 text-right font-bold text-gray-600 w-36">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.length > 0 ? (
                    topCustomers.map((cust, index) => (
                      <tr key={index} className="border-t border-gray-50 hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${index === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white" :
                            index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                              index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white" :
                                "bg-white text-gray-400 border border-gray-200"
                            }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800 text-xs leading-tight">{cust.fullname || "Khách vãng lai"}</div>
                          {cust.phone && <div className="text-[10px] text-gray-400 mt-0.5">{cust.phone}</div>}
                          {cust.email && <div className="text-[10px] text-gray-400 mt-0.5">{cust.email}</div>}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-purple-700 text-xs">
                          {(cust.totalSpent || 0).toLocaleString("vi-VN")}₫
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-5xl">👥</div>
                          <p className="text-sm text-gray-500">Chưa có dữ liệu. Hãy chọn khoảng thời gian và nhấn lọc.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 5 bán chạy */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-gray-800">Top 5 sản phẩm bán chạy nhất</h2>
            </div>

            {topError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <span>⚠️</span> {topError}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-3 text-left font-bold text-gray-600 w-12">Hạng</th>
                    <th className="py-3 px-3 text-left font-bold text-gray-600">Sản phẩm</th>
                    <th className="py-3 px-3 text-center font-bold text-gray-600 w-24">Số lượng</th>
                    <th className="py-3 px-3 text-right font-bold text-gray-600 w-32">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingProducts.length > 0 ? (
                    topSellingProducts.map((product, index) => (
                      <tr key={index} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${index === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white" :
                            index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                              index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white" :
                                "bg-white text-gray-400 border border-gray-200"
                            }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800 text-xs leading-tight">{product.productDetailName || "Không xác định"}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-black border border-blue-100">
                            {(product.totalQuantitySold || 0).toLocaleString()} sp
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-gray-700 text-xs">
                          {(product.totalRevenue || 0).toLocaleString("vi-VN")}₫
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-5xl">📊</div>
                          <p className="text-sm text-gray-500">Chưa có dữ liệu. Hãy chọn khoảng thời gian và nhấn lọc.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
