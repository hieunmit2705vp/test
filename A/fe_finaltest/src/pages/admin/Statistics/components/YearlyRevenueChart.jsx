import React, { useEffect, useState } from "react";
import StatisticsService from "../../../../services/StatisticsService";
import { Card, CardContent } from "./card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const YearlyRevenueChart = ({ startDate, endDate }) => {
    const [yearlyData, setYearlyData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate) return;
            try {
                const data = await StatisticsService.getYearlyStats(startDate, endDate);
                setYearlyData(data);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu thống kê năm:", err);
                setError("Không thể tải dữ liệu thống kê năm.");
            }
        };
        fetchData();
    }, [startDate, endDate]);

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Doanh thu & Lợi nhuận hàng năm</h2>
                <p className="text-red-500 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Doanh thu & Lợi nhuận hàng năm</h2>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData}>
                        <XAxis dataKey="label" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => `${value.toLocaleString("vi-VN")} đ`} 
                        />
                        <Bar name="Doanh thu" dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar name="Lợi nhuận" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default YearlyRevenueChart;