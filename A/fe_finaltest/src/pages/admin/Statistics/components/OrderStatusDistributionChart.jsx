import React, { useEffect, useState } from "react";
import StatisticsService from "../../../../services/StatisticsService";
import { Card, CardContent } from "./card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const OrderStatusDistributionChart = ({ startDate, endDate }) => {
    const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate) return;
            try {
                const data = await StatisticsService.getOrderStatusDistribution(startDate, endDate);
                setOrderStatusDistribution(data);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi tải tỷ lệ đơn hàng theo trạng thái:", err);
                setError("Không thể tải dữ liệu tỷ lệ đơn hàng theo trạng thái.");
            }
        };
        fetchData();
    }, [startDate, endDate]);

    if (error) {
        return (
            <Card>
                <CardContent>
                    <h2 className="text-xl font-bold">Tỷ lệ đơn hàng theo trạng thái</h2>
                    <p className="text-red-500">{error}</p>
                </CardContent>
            </Card>
        );
    }

    const STATUS_COLORS = {
        "Chờ xác nhận": "#FBBF24",   // Vàng
        "Chờ thanh toán": "#93C5FD",  // Xanh dương nhạt
        "Đã xác nhận": "#3B82F6",    // Xanh dương
        "Đang giao hàng": "#6366F1",  // Indigo
        "Giao hàng thất bại": "#F97316", // Cam
        "Hoàn thành": "#10B981",      // Xanh lá cây
        "Đã hủy": "#EF4444",          // Đỏ
    };

    const getColor = (name) => STATUS_COLORS[name] || "#9CA3AF"; // Mặc định là xám nếu không khớp

    return (
        <Card>
            <CardContent>
                <h2 className="text-xl font-bold">Tỷ lệ đơn hàng theo trạng thái</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <Pie
                            data={orderStatusDistribution}
                            dataKey="orderCount"
                            nameKey="statusName"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            label={({ value }) => `${value}`}
                            paddingAngle={5}
                            minAngle={15}
                        >
                            {orderStatusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.statusName)} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} đơn hàng`, "Số lượng"]} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default OrderStatusDistributionChart;