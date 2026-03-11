package backend.datn.services;

import backend.datn.dto.response.statistic.*;
import backend.datn.repositories.StatisticRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatisticService {

    @Autowired
    private StatisticRepository statisticRepository;

    // Helper methods for safe casting
    private Integer safeInt(Object o, Integer defaultValue) {
        if (o == null) return defaultValue;
        if (o instanceof Number) return ((Number) o).intValue();
        try {
            // Xử lý trường hợp chuỗi có thể là số thập phân (BigDecimal.toString())
            return new BigDecimal(o.toString()).intValue();
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private String safeString(Object o, String defaultValue) {
        return (o != null) ? o.toString() : defaultValue;
    }

    private BigDecimal safeBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal) return (BigDecimal) o;
        try {
            return new BigDecimal(o.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    // Thống kê gộp (Doanh thu & Lợi nhuận)
    public List<UnifiedStatisticResponse> getDailyStats(String startDate, String endDate) {
        return convertToUnifiedResponse(statisticRepository.getDailyStats(startDate, endDate));
    }

    public List<UnifiedStatisticResponse> getWeeklyStats(String startDate, String endDate) {
        return convertToUnifiedResponse(statisticRepository.getWeeklyStats(startDate, endDate));
    }

    public List<UnifiedStatisticResponse> getMonthlyStats(String startDate, String endDate) {
        return convertToUnifiedResponse(statisticRepository.getMonthlyStats(startDate, endDate));
    }

    public List<UnifiedStatisticResponse> getYearlyStats(String startDate, String endDate) {
        return convertToUnifiedResponse(statisticRepository.getYearlyStats(startDate, endDate));
    }

    private List<UnifiedStatisticResponse> convertToUnifiedResponse(List<Object[]> rawData) {
        List<UnifiedStatisticResponse> result = new ArrayList<>();
        if (rawData == null) return result;
        
        for (Object[] record : rawData) {
            UnifiedStatisticResponse dto = new UnifiedStatisticResponse();
            dto.setLabel(record[0] != null ? record[0].toString() : "");
            
            // Ép kiểu an toàn cho Revenue (đề phòng database trả về Double/Long/BigDecimal)
            if (record[1] instanceof BigDecimal) {
                dto.setRevenue((BigDecimal) record[1]);
            } else if (record[1] instanceof Number) {
                dto.setRevenue(new BigDecimal(record[1].toString()));
            } else {
                dto.setRevenue(BigDecimal.ZERO);
            }

            // Ép kiểu an toàn cho Profit
            if (record[2] instanceof BigDecimal) {
                dto.setProfit((BigDecimal) record[2]);
            } else if (record[2] instanceof Number) {
                dto.setProfit(new BigDecimal(record[2].toString()));
            } else {
                dto.setProfit(BigDecimal.ZERO);
            }
            
            result.add(dto);
        }
        return result;
    }


    // doanh thu theo kênh:
    public List<ChannelRevenueResponse> getChannelRevenue(String startDate, String endDate) {
        List<Object[]> rawData = statisticRepository.getChannelRevenue(startDate, endDate);
        List<ChannelRevenueResponse> result = new ArrayList<>();
        if (rawData == null) return result;

        for (Object[] record : rawData) {
            ChannelRevenueResponse dto = new ChannelRevenueResponse();
            dto.setDayNumber(safeInt(record[0], 0));
            dto.setMonthNumber(safeInt(record[1], 0));
            dto.setYearNumber(safeInt(record[2], 0));
            dto.setOnlineRevenue(safeBigDecimal(record[3]));
            dto.setInStoreRevenue(safeBigDecimal(record[4]));
            result.add(dto);
        }

        return result;
    }

    // Tỷ Lệ Đơn Hàng Theo Trạng Thái
    public List<OrderStatusDistributionResponse> getOrderStatusDistribution(String startDate, String endDate) {
        try {
            List<Object[]> rawData = statisticRepository.getOrderStatusDistribution(startDate, endDate);
            List<OrderStatusDistributionResponse> result = new ArrayList<>();

            // Kiểm tra nếu rawData là null hoặc rỗng
            if (rawData == null || rawData.isEmpty()) {
                return result; // Trả về danh sách rỗng nếu không có dữ liệu
            }

            for (Object[] record : rawData) {
                OrderStatusDistributionResponse dto = new OrderStatusDistributionResponse();
                try {
                    dto.setStatusOrder(safeInt(record[0], -2));
                    dto.setStatusName(safeString(record[1], "Không xác định"));
                    dto.setOrderCount(safeInt(record[2], 0));
                    result.add(dto);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            return result;
        } catch (Exception e) {
            // Ghi log lỗi
            System.err.println("Lỗi khi truy vấn tỷ lệ đơn hàng theo trạng thái: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi truy vấn tỷ lệ đơn hàng theo trạng thái: " + e.getMessage());
        }
    }

    // Tỷ Lệ Thanh Toán Theo Phương Thức
    public List<PaymentMethodDistributionResponse> getPaymentMethodDistribution(String startDate, String endDate) {
        try {
            List<Object[]> rawData = statisticRepository.getPaymentMethodDistribution(startDate, endDate);
            List<PaymentMethodDistributionResponse> result = new ArrayList<>();

            // Kiểm tra nếu rawData là null hoặc rỗng
            if (rawData == null || rawData.isEmpty()) {
                return result; // Trả về danh sách rỗng nếu không có dữ liệu
            }

            for (Object[] record : rawData) {
                PaymentMethodDistributionResponse dto = new PaymentMethodDistributionResponse();
                try {
                    dto.setPaymentMethod(safeInt(record[0], -1));
                    dto.setMethodName(safeString(record[1], "Không xác định"));
                    dto.setOrderCount(safeInt(record[2], 0));
                    result.add(dto);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            return result;
        } catch (Exception e) {
            System.err.println("Lỗi khi truy vấn tỷ lệ thanh toán theo phương thức: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi truy vấn tỷ lệ thanh toán theo phương thức: " + e.getMessage());
        }
    }

    // Top 5 Khách Hàng Mua Nhiều Nhất
    public List<TopCustomerResponse> getTop5Customers(String startDate, String endDate) {
        try {
            List<Object[]> rawData = statisticRepository.getTop5Customers(startDate, endDate);
            List<TopCustomerResponse> result = new ArrayList<>();

            // Kiểm tra nếu rawData là null hoặc rỗng
            if (rawData == null || rawData.isEmpty()) {
                return result; // Trả về danh sách rỗng nếu không có dữ liệu
            }

            for (Object[] record : rawData) {
                TopCustomerResponse dto = new TopCustomerResponse();
                try {
                    dto.setCustomerName(safeString(record[0], "Khách hàng không xác định"));
                    dto.setTotalOrders(safeInt(record[1], 0));
                    dto.setTotalSpent(safeBigDecimal(record[2]));
                    result.add(dto);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            return result;
        } catch (Exception e) {
            System.err.println("Lỗi khi truy vấn top 5 khách hàng mua nhiều nhất: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi truy vấn top 5 khách hàng mua nhiều nhất: " + e.getMessage());
        }
    }

    // Top 5 Sản Phẩm Tồn Kho Nhiều Nhất
    public List<TopInventoryProductResponse> getTop5InventoryProducts() {
        List<Object[]> rawData = statisticRepository.getTop5InventoryProducts();
        List<TopInventoryProductResponse> result = new ArrayList<>();

        for (Object[] record : rawData) {
            TopInventoryProductResponse dto = new TopInventoryProductResponse();
            dto.setProductDetailName((String) record[0]);
            dto.setQuantity((Integer) record[1]);
            result.add(dto);
        }

        return result;
    }


    // Lấy top 5 sản phẩm bán chạy nhất trong khoảng thời gian:
    public List<ProductDetailDTO> getTop5BestSellingProductDetailInAPeriodOfTime(String startDate, String endDate) {
        List<Object[]> rawData = statisticRepository.getTop5BestSellingProductDetailInAPeriodOfTime(startDate, endDate);
        List<ProductDetailDTO> result = new ArrayList<>();
        for (Object[] record : rawData) {
            ProductDetailDTO dto = new ProductDetailDTO();
            dto.setProductDetailName(record[0] != null ? (String) record[0] : "Không xác định");
            
            // Ép kiểu an toàn cho Quantity
            if (record[1] instanceof Number) {
                dto.setTotalQuantitySold(((Number) record[1]).intValue());
            } else {
                dto.setTotalQuantitySold(0);
            }
            
            // Ép kiểu cho Revenue
            dto.setTotalRevenue(record[2] != null ? (BigDecimal) record[2] : BigDecimal.ZERO);
            
            // Ép kiểu cho Profit
            dto.setTotalProfit(record[3] != null ? (BigDecimal) record[3] : BigDecimal.ZERO);
            
            result.add(dto);
        }
        return result;
    }

    // Lấy tổng doanh thu
    public BigDecimal getTotalRevenue() {
        return statisticRepository.getTotalRevenue();
    }

    // Lấy số lượng khách hàng
    public Integer getNumberOfCustomers() {
        return statisticRepository.getNumberOfCustomers();
    }

    // Lấy tổng số hóa đơn
    public Integer getNumberOfInvoices() {
        return statisticRepository.getNumberOfInvoices();
    }

    // Lấy số lượng Admin
    public Integer getNumberOfAdmin() {
        return statisticRepository.getNumberOfAdmin();
    }

    // Lấy số lượng nhân viên
    public Integer getNumberOfStaff() {
        return statisticRepository.getNumberOfStaff();
    }

    // Tổng lợi nhuận
    public BigDecimal getTotalProfit() {
        return statisticRepository.getTotalProfit();
    }

    // Lấy thống kê theo khoảng thời gian (Doanh thu, Lợi nhuận, Số đơn hàng)
    public PeriodStatisticResponse getPeriodStatistics(String startDate, String endDate) {
        BigDecimal revenue = statisticRepository.getRevenueInPeriod(startDate, endDate);
        BigDecimal profit = statisticRepository.getProfitInPeriod(startDate, endDate);
        Long orderCount = statisticRepository.getOrderCountInPeriod(startDate, endDate);
        Long inStoreOrderCount = statisticRepository.getInStoreOrderCountInPeriod(startDate, endDate);
        Long onlineOrderCount = statisticRepository.getOnlineOrderCountInPeriod(startDate, endDate);

        return PeriodStatisticResponse.builder()
                .revenue(revenue)
                .profit(profit)
                .orderCount(orderCount)
                .inStoreOrderCount(inStoreOrderCount)
                .onlineOrderCount(onlineOrderCount)
                .build();
    }

    // Lợi nhuận theo ngày (Deprecated)
    @Deprecated
    public List<Object[]> getDailyProfit() { return new ArrayList<>(); }

    @Deprecated
    public List<Object[]> getMonthlyProfit() { return new ArrayList<>(); }

    @Deprecated
    public List<Object[]> getWeeklyProfit() { return new ArrayList<>(); }

    @Deprecated
    public List<Object[]> getYearlyProfit() { return new ArrayList<>(); }

}
