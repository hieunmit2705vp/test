package backend.cnpm.controllers;

import backend.cnpm.dto.ApiResponse;
import backend.cnpm.dto.response.statistic.*;
import backend.cnpm.services.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticController {

    @Autowired
    private StatisticService statisticService;

    @GetMapping("/daily-stats")
    public ResponseEntity<ApiResponse> getDailyStats(@RequestParam(required = false) String startDate, @RequestParam(required = false) String endDate) {
        try {
            List<UnifiedStatisticResponse> data = statisticService.getDailyStats(startDate, endDate);
            return ResponseEntity.ok(new ApiResponse("success", "Truy vấn thống kê hàng ngày thành công", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Lỗi: " + e.getMessage(), null));
        }
    }

    @GetMapping("/weekly-stats")
    public ResponseEntity<ApiResponse> getWeeklyStats(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            List<UnifiedStatisticResponse> data = statisticService.getWeeklyStats(startDate, endDate);
            return ResponseEntity.ok(new ApiResponse("success", "Truy vấn thống kê hàng tuần thành công", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Lỗi: " + e.getMessage(), null));
        }
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<ApiResponse> getMonthlyStats(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            List<UnifiedStatisticResponse> data = statisticService.getMonthlyStats(startDate, endDate);
            return ResponseEntity.ok(new ApiResponse("success", "Truy vấn thống kê hàng tháng thành công", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Lỗi: " + e.getMessage(), null));
        }
    }

    @GetMapping("/yearly-stats")
    public ResponseEntity<ApiResponse> getYearlyStats(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            List<UnifiedStatisticResponse> data = statisticService.getYearlyStats(startDate, endDate);
            return ResponseEntity.ok(new ApiResponse("success", "Truy vấn thống kê hàng năm thành công", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Lỗi: " + e.getMessage(), null));
        }
    }

    @GetMapping("/channel-revenue")
    public ResponseEntity<ApiResponse> getChannelRevenue(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            List<ChannelRevenueResponse> data = statisticService.getChannelRevenue(startDate, endDate);
            ApiResponse response = new ApiResponse("success", "Truy vấn doanh thu theo kênh thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn doanh thu theo kênh thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/order-status-distribution")
    public ResponseEntity<ApiResponse> getOrderStatusDistribution(@RequestParam(required = false) String startDate, @RequestParam(required = false) String endDate) {
        try {
            List<OrderStatusDistributionResponse> data = statisticService.getOrderStatusDistribution(startDate, endDate);
            if (data.isEmpty()) {
                ApiResponse response = new ApiResponse("success", "Không có dữ liệu về tỷ lệ đơn hàng theo trạng thái", data);
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            ApiResponse response = new ApiResponse("success", "Truy vấn tỷ lệ đơn hàng theo trạng thái thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            // Ghi log lỗi
            System.err.println("Lỗi khi truy vấn tỷ lệ đơn hàng theo trạng thái: " + e.getMessage());
            e.printStackTrace();
            ApiResponse response = new ApiResponse("error", "Truy vấn tỷ lệ đơn hàng theo trạng thái thất bại: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/payment-method-distribution")
    public ResponseEntity<ApiResponse> getPaymentMethodDistribution(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            List<PaymentMethodDistributionResponse> data = statisticService.getPaymentMethodDistribution(startDate, endDate);
            if (data.isEmpty()) {
                ApiResponse response = new ApiResponse("success", "Không có dữ liệu về tỷ lệ thanh toán theo phương thức", data);
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            ApiResponse response = new ApiResponse("success", "Truy vấn tỷ lệ thanh toán theo phương thức thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Lỗi khi truy vấn tỷ lệ thanh toán theo phương thức: " + e.getMessage());
            e.printStackTrace();
            ApiResponse response = new ApiResponse("error", "Truy vấn tỷ lệ thanh toán theo phương thức thất bại: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/top-5-customers")
        public ResponseEntity<ApiResponse> getTop5Customers(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            List<TopCustomerResponse> data = statisticService.getTop5Customers(startDate, endDate);
            if (data.isEmpty()) {
                ApiResponse response = new ApiResponse("success", "Không có dữ liệu về top 5 khách hàng mua nhiều nhất", data);
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            ApiResponse response = new ApiResponse("success", "Truy vấn top 5 khách hàng mua nhiều nhất thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Lỗi khi truy vấn top 5 khách hàng mua nhiều nhất: " + e.getMessage());
            e.printStackTrace();
            ApiResponse response = new ApiResponse("error", "Truy vấn top 5 khách hàng mua nhiều nhất thất bại: " + e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/top-5-inventory-products")
    public ResponseEntity<ApiResponse> getTop5InventoryProducts() {
        try {
            List<TopInventoryProductResponse> data = statisticService.getTop5InventoryProducts();
            ApiResponse response = new ApiResponse("success", "Truy vấn top 5 sản phẩm tồn kho nhiều nhất thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn top 5 sản phẩm tồn kho nhiều nhất thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/top-5-products")
    public ResponseEntity<ApiResponse> getTopSellingProducts(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            List<ProductDetailDTO> data = statisticService.getTop5BestSellingProductDetailInAPeriodOfTime(startDate, endDate);
            ApiResponse response = new ApiResponse("success", "Truy vấn top 5 sản phẩm bán chạy nhất thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn top 5 sản phẩm bán chạy nhất thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/period-stats")
    public ResponseEntity<ApiResponse> getPeriodStatistics(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            PeriodStatisticResponse data = statisticService.getPeriodStatistics(startDate, endDate);
            ApiResponse response = new ApiResponse("success", "Truy vấn thống kê theo khoảng thời gian thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn thống kê theo khoảng thời gian thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/total-revenue")
    public ResponseEntity<ApiResponse> getTotalRevenue() {
        try {
            BigDecimal data = statisticService.getTotalRevenue();
            ApiResponse response = new ApiResponse("success", "Truy vấn tổng doanh thu thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn tổng doanh thu thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/total-customers")
    public ResponseEntity<ApiResponse> getTotalCustomers() {
        try {
            Integer data = statisticService.getNumberOfCustomers();
            ApiResponse response = new ApiResponse("success", "Truy vấn tổng số khách hàng thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn tổng số khách hàng thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/total-invoices")
    public ResponseEntity<ApiResponse> getTotalInvoices() {
        try {
            Integer data = statisticService.getNumberOfInvoices();
            ApiResponse response = new ApiResponse("success", "Truy vấn tổng số hóa đơn thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn tổng số hóa đơn thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/total-admins")
    public ResponseEntity<ApiResponse> getTotalAdmins() {
        try {
            Integer data = statisticService.getNumberOfAdmin();
            ApiResponse response = new ApiResponse("success", "Truy vấn tổng số admin thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn tổng số admin thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/total-staff")
    public ResponseEntity<ApiResponse> getTotalStaff() {
        try {
            Integer data = statisticService.getNumberOfStaff();
            ApiResponse response = new ApiResponse("success", "Truy vấn tổng số nhân viên thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn tổng số nhân viên thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/total-profit")
    public ResponseEntity<ApiResponse> getTotalProfit() {
        try {
            java.math.BigDecimal data = statisticService.getTotalProfit();
            ApiResponse response = new ApiResponse("success", "Truy vấn tổng lợi nhuận thành công", data);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse response = new ApiResponse("error", "Truy vấn tổng lợi nhuận thất bại", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
