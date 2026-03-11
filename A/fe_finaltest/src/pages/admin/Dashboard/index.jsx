import React, { useEffect, useState } from "react";
import StatisticsService from "../../../services/StatisticsService";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  LayoutDashboard,
  Shield,
  UserCheck
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${bgColor} ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold ${trend > 0 ? "text-emerald-600" : "text-rose-600"} bg-gray-50 px-2 py-1 rounded-lg`}>
          {trend > 0 ? "+" : ""}{trend}%
          <ArrowUpRight size={14} className="ml-1" />
        </span>
      )}
    </div>
    <p className="text-gray-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalAdmins: 0,
    totalStaff: 0,
    topProducts: [],
    periodStats: [],
    statusDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const formatDate = (date, isEndOfDay = false) => {
          const pad = (n) => String(n).padStart(2, "0");
          const time = isEndOfDay ? "23:59:59" : "00:00:00";
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${time}`;
        };

        const startDate = formatDate(thirtyDaysAgo);
        const endDate = formatDate(now, true);

        const [
          revenue, 
          profit, 
          customers, 
          invoices, 
          admins,
          staff,
          topProducts,
          dailyStats,
          statusDist
        ] = await Promise.all([
          StatisticsService.getTotalRevenue(),
          StatisticsService.getTotalProfit(),
          StatisticsService.getTotalCustomers(),
          StatisticsService.getTotalInvoices(),
          StatisticsService.getTotalAdmins(),
          StatisticsService.getTotalStaff(),
          StatisticsService.getTopSellingProducts(startDate, endDate),
          StatisticsService.getDailyStats(startDate, endDate),
          StatisticsService.getOrderStatusDistribution(startDate, endDate)
        ]);

        setStats({
          totalRevenue: revenue || 0,
          totalProfit: profit || 0,
          totalCustomers: customers || 0,
          totalInvoices: invoices || 0,
          totalAdmins: admins || 0,
          totalStaff: staff || 0,
          topProducts: (topProducts || []).slice(0, 5),
          periodStats: dailyStats || [],
          statusDistribution: statusDist || []
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse">Đang kiến tạo Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="text-blue-600" size={32} />
              Tổng Quan Hệ Thống
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Chào mừng trở lại! Dưới đây là tóm tắt hoạt động kinh doanh 30 ngày qua.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div className="pr-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Ngày hiện tại</p>
              <p className="text-sm font-black text-gray-800">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard 
            title="Tổng doanh thu" 
            value={`${stats.totalRevenue.toLocaleString("vi-VN")}₫`} 
            icon={DollarSign} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
          />
          <StatCard 
            title="Tổng lợi nhuận" 
            value={`${stats.totalProfit.toLocaleString("vi-VN")}₫`} 
            icon={TrendingUp} 
            color="text-emerald-600" 
            bgColor="bg-emerald-50" 
          />
          <StatCard 
            title="Khách hàng" 
            value={stats.totalCustomers} 
            icon={Users} 
            color="text-violet-600" 
            bgColor="bg-violet-50" 
          />
          <StatCard 
            title="Hóa đơn" 
            value={stats.totalInvoices} 
            icon={ShoppingBag} 
            color="text-rose-600" 
            bgColor="bg-rose-50" 
          />
          <StatCard 
            title="Quản trị viên" 
            value={stats.totalAdmins} 
            icon={Shield} 
            color="text-amber-600" 
            bgColor="bg-amber-50" 
          />
          <StatCard 
            title="Nhân viên" 
            value={stats.totalStaff} 
            icon={UserCheck} 
            color="text-teal-600" 
            bgColor="bg-teal-50" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-gray-900">Biểu đồ tăng trưởng</h2>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div> Doanh thu
                </div>
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Lợi nhuận
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.periodStats}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}} 
                    dy={10}
                    tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}}
                    tickFormatter={(val) => `${val/1000000}M`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [`${value.toLocaleString()}₫`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-black text-gray-900 mb-8">Trạng thái đơn hàng</h2>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="orderCount"
                    >
                      {stats.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-800">
                    {stats.statusDistribution.reduce((acc, curr) => acc + curr.orderCount, 0)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Tổng đơn</span>
                </div>
              </div>
              <div className="w-full mt-8 grid grid-cols-2 gap-3">
                {stats.statusDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                    <span className="text-xs text-gray-600 font-medium truncate">{entry.statusName || entry.status}</span>
                    <span className="text-xs font-bold text-gray-900 ml-auto">{entry.orderCount}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="mt-8 text-blue-600 text-xs font-black flex items-center justify-center gap-2 group">
              Xem chi tiết báo cáo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Top Products Table */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Package className="text-orange-500" size={24} />
                Sản phẩm bán chạy
              </h2>
              <button className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Sản phẩm</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Đã bán</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Doanh thu</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Lợi nhuận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.topProducts.map((product, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                            idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                            idx === 1 ? "bg-gray-100 text-gray-600" : 
                            "bg-blue-50 text-blue-600"
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="font-bold text-gray-800 text-sm truncate max-w-[200px]">{product.productDetailName}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-xs font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                          {product.totalQuantitySold}
                        </span>
                      </td>
                      <td className="py-4 text-right font-black text-gray-900 text-sm">
                        {product.totalRevenue.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="py-4 text-right font-black text-emerald-600 text-sm">
                        {product.totalProfit.toLocaleString("vi-VN")}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;