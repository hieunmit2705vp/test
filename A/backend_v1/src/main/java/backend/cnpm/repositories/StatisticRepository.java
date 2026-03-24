package backend.cnpm.repositories;

import backend.cnpm.entities.ProductDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StatisticRepository extends JpaRepository<ProductDetail, Integer> {

    // Thống kê gộp (Doanh thu & Lợi nhuận) theo Ngày
    @Query(value = """
            SELECT
                DATE_FORMAT(ANY_VALUE(o.create_date), '%d/%m/%Y') as label,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0)), 0) as revenue,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0) - o_cost.total_import_cost), 0) as profit
            FROM `order` o
            JOIN (
                SELECT order_id, SUM(import_price * quantity) as total_import_cost
                FROM order_detail
                GROUP BY order_id
            ) o_cost ON o.id = o_cost.order_id
            WHERE o.status_order = 5
            AND ((:startDate IS NULL OR :startDate = '') OR o.create_date >= :startDate)
            AND ((:endDate IS NULL OR :endDate = '') OR o.create_date <= :endDate)
            GROUP BY DATE(o.create_date)
            ORDER BY DATE(o.create_date) ASC
            """, nativeQuery = true)
    List<Object[]> getDailyStats(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Thống kê gộp (Doanh thu & Lợi nhuận) theo Tuần
    @Query(value = """
            SELECT
                ANY_VALUE(CONCAT('Tuần ', WEEK(o.create_date, 1), '/', YEAR(o.create_date))) as label,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0)), 0) as revenue,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0) - o_cost.total_import_cost), 0) as profit
            FROM `order` o
            JOIN (
                SELECT order_id, SUM(import_price * quantity) as total_import_cost
                FROM order_detail
                GROUP BY order_id
            ) o_cost ON o.id = o_cost.order_id
            WHERE o.status_order = 5
            AND o.create_date BETWEEN :startDate AND :endDate
            GROUP BY YEAR(o.create_date), WEEK(o.create_date, 1)
            ORDER BY YEAR(o.create_date) ASC, WEEK(o.create_date, 1) ASC
            """, nativeQuery = true)
    List<Object[]> getWeeklyStats(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Thống kê gộp (Doanh thu & Lợi nhuận) theo Tháng
    @Query(value = """
            SELECT
                ANY_VALUE(DATE_FORMAT(o.create_date, '%m/%Y')) as label,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0)), 0) as revenue,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0) - o_cost.total_import_cost), 0) as profit
            FROM `order` o
            JOIN (
                SELECT order_id, SUM(import_price * quantity) as total_import_cost
                FROM order_detail
                GROUP BY order_id
            ) o_cost ON o.id = o_cost.order_id
            WHERE o.status_order = 5
            AND o.create_date BETWEEN :startDate AND :endDate
            GROUP BY YEAR(o.create_date), MONTH(o.create_date)
            ORDER BY YEAR(o.create_date) ASC, MONTH(o.create_date) ASC
            """, nativeQuery = true)
    List<Object[]> getMonthlyStats(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Thống kê gộp (Doanh thu & Lợi nhuận) theo Năm
    @Query(value = """
            SELECT
                ANY_VALUE(DATE_FORMAT(o.create_date, '%Y')) as label,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0)), 0) as revenue,
                COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0) - o_cost.total_import_cost), 0) as profit
            FROM `order` o
            JOIN (
                SELECT order_id, SUM(import_price * quantity) as total_import_cost
                FROM order_detail
                GROUP BY order_id
            ) o_cost ON o.id = o_cost.order_id
            WHERE o.status_order = 5
            AND o.create_date BETWEEN :startDate AND :endDate
            GROUP BY YEAR(o.create_date)
            ORDER BY YEAR(o.create_date) ASC
            """, nativeQuery = true)
    List<Object[]> getYearlyStats(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Top 5 sản phẩm bán chạy nhất trong khoảng thời gian
    @Query(value = """
                 SELECT
                     CONCAT(p.product_name, ' ', c.color_name, ' ', s.size_name) AS productDetailName,
                     SUM(od.quantity) AS totalQuantitySold,
                     SUM(od.quantity * od.price * (COALESCE((o.total_bill - COALESCE(o.shipfee, 0)), 0) / NULLIF(COALESCE(o.original_total, o.total_bill), 0))) AS totalRevenue,
                     SUM((od.quantity * od.price * (COALESCE((o.total_bill - COALESCE(o.shipfee, 0)), 0) / NULLIF(COALESCE(o.original_total, o.total_bill), 0))) - (od.quantity * od.import_price)) AS totalProfit
                 FROM `product` p
                 JOIN product_detail pd ON pd.product_id = p.id
                 JOIN size s ON pd.size_id = s.id
                 JOIN color c ON c.id = pd.color_id
                 JOIN order_detail od ON od.product_detail_id = pd.id
                 JOIN `order` o ON o.id = od.order_id
                 WHERE o.status_order = 5
                 AND o.create_date BETWEEN :startDate AND :endDate
                 GROUP BY pd.id, p.product_name, c.color_name, s.size_name
                 ORDER BY totalQuantitySold DESC, totalProfit DESC
                 LIMIT 5
            """, nativeQuery = true)
    List<Object[]> getTop5BestSellingProductDetailInAPeriodOfTime(@Param("startDate") String startDate,
            @Param("endDate") String endDate);

    // Tổng doanh thu của hóa đơn ở trạng thái hoàn thành
    @Query(value = """
                SELECT COALESCE(SUM(total_bill - COALESCE(shipfee, 0)), 0)
                FROM `order`
                WHERE status_order = 5
            """, nativeQuery = true)
    BigDecimal getTotalRevenue();

    // Tổng số lượng khách hàng
    @Query(value = """
            SELECT COUNT(id)
            FROM customer
            """, nativeQuery = true)
    Integer getNumberOfCustomers();

    // Tổng số hóa đơn
    @Query(value = """
            SELECT COUNT(id)
            FROM `order`
            WHERE status_order = 5
            """, nativeQuery = true)
    Integer getNumberOfInvoices();

    // Tổng số lượng admin - quản lý
    @Query(value = """
            SELECT COUNT(id)
            FROM employee
            WHERE role_id = 1
            """, nativeQuery = true)
    Integer getNumberOfAdmin();

    // Tổng số lượng employee - nhân viên
    @Query(value = """
            SELECT COUNT(id)
            FROM employee
            WHERE role_id = 2
            """, nativeQuery = true)
    Integer getNumberOfStaff();

    // Doanh thu theo kênh
    @Query(value = """
            SELECT
                DAY(o.create_date) AS dayNumber,
                MONTH(o.create_date) AS monthNumber,
                YEAR(o.create_date) AS yearNumber,
                SUM(CASE WHEN o.kind_of_order = 0 THEN o.total_bill - COALESCE(o.shipfee, 0) ELSE 0 END) AS onlineRevenue,
                SUM(CASE WHEN o.kind_of_order = 1 THEN o.total_bill - COALESCE(o.shipfee, 0) ELSE 0 END) AS inStoreRevenue
            FROM `order` o
            WHERE o.status_order = 5
            AND o.create_date BETWEEN :startDate AND :endDate
            GROUP BY YEAR(o.create_date), MONTH(o.create_date), DAY(o.create_date)
            ORDER BY yearNumber, monthNumber, dayNumber
            """, nativeQuery = true)
    List<Object[]> getChannelRevenue(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Tỷ lệ đơn hàng theo trạng thái
    @Query(value = """
            SELECT o.status_order,
                   CASE
                       WHEN o.status_order = 0 THEN 'Chờ xác nhận'
                       WHEN o.status_order = 1 THEN 'Chờ thanh toán'
                       WHEN o.status_order = 2 THEN 'Đã xác nhận'
                       WHEN o.status_order = 3 THEN 'Đang giao hàng'
                       WHEN o.status_order = 4 THEN 'Giao hàng thất bại'
                       WHEN o.status_order = 5 THEN 'Hoàn thành'
                       WHEN o.status_order = -1 THEN 'Đã hủy'
                       ELSE 'Khác'
                   END as status_name,
                   count(o.id) as order_count
            FROM `order` o
                     WHERE ((:startDate IS NULL OR :startDate = '') OR o.create_date >= :startDate)
                     AND ((:endDate IS NULL OR :endDate = '') OR o.create_date <= :endDate)
            GROUP BY o.status_order
            """, nativeQuery = true)
    List<Object[]> getOrderStatusDistribution(@Param("startDate") String startDate,
            @Param("endDate") String endDate);

    // Tỷ lệ thanh toán theo phương thức
    @Query(value = """
            SELECT o.payment_method,
                   CASE
                        WHEN o.payment_method = 0 THEN 'Tiền mặt'
                        WHEN o.payment_method = 1 THEN 'Chuyển khoản'
                        WHEN o.payment_method = 2 THEN 'Thẻ'
                        ELSE 'Khác'
                   END as method_name,
                   count(o.id) as order_count
            FROM `order` o
            WHERE o.create_date BETWEEN :startDate AND :endDate
            GROUP BY o.payment_method
            """, nativeQuery = true)
    List<Object[]> getPaymentMethodDistribution(@Param("startDate") String startDate,
            @Param("endDate") String endDate);

    // Top 5 khách hàng mua nhiều nhất
    @Query(value = """
            SELECT a.id,
                         a.fullname,
                         a.phone,
                         a.email,
                         count(o.id) as total_orders,
                         sum(o.total_bill - COALESCE(o.shipfee, 0)) as total_spent
            FROM `order` o
            JOIN customer a ON o.customer_id = a.id
            WHERE o.status_order = 5
                AND a.id > 0
                AND (:startDate IS NULL OR o.create_date >= :startDate)
                AND (:endDate IS NULL OR o.create_date <= :endDate)
            GROUP BY a.id, a.fullname, a.phone, a.email
            ORDER BY total_spent DESC
            LIMIT 5
            """, nativeQuery = true)
    List<Object[]> getTop5Customers(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Top 5 sản phẩm tồn kho nhiều nhất
    @Query(value = """
            SELECT
                CONCAT(p.product_name, ' ', c.color_name, ' ', s.size_name) AS productDetailName,
                pd.quantity AS quantity
            FROM product_detail pd
            JOIN `product` p ON p.id = pd.product_id
            JOIN color c ON c.id = pd.color_id
            JOIN size s ON s.id = pd.size_id
            WHERE pd.status = 1
            ORDER BY pd.quantity DESC
            LIMIT 5
            """, nativeQuery = true)
    List<Object[]> getTop5InventoryProducts();

    // Tổng lợi nhuận = (giá bán thực tế - giá nhập) * số lượng bán, trừ phí ship
    // (nếu có)
    @Query(value = """
            SELECT COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0) - o_cost.total_import_cost), 0)
            FROM `order` o
            JOIN (
                SELECT order_id, SUM(import_price * quantity) as total_import_cost
                FROM order_detail
                GROUP BY order_id
            ) o_cost ON o.id = o_cost.order_id
            WHERE o.status_order = 5
            """, nativeQuery = true)
    BigDecimal getTotalProfit();

    // Doanh thu theo khoảng thời gian
    @Query(value = """
            SELECT COALESCE(SUM(total_bill - COALESCE(shipfee, 0)), 0)
            FROM `order`
            WHERE status_order = 5
            AND create_date >= :startDate
            AND create_date < DATE_ADD(:endDate, INTERVAL 1 SECOND)
            """, nativeQuery = true)
    BigDecimal getRevenueInPeriod(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Lợi nhuận theo khoảng thời gian
    @Query(value = """
            SELECT COALESCE(SUM(o.total_bill - COALESCE(o.shipfee, 0) - o_cost.total_import_cost), 0)
            FROM `order` o
            JOIN (
                SELECT order_id, SUM(import_price * quantity) as total_import_cost
                FROM order_detail
                GROUP BY order_id
            ) o_cost ON o.id = o_cost.order_id
            WHERE o.status_order = 5
            AND o.create_date >= :startDate
            AND o.create_date < DATE_ADD(:endDate, INTERVAL 1 SECOND)
            """, nativeQuery = true)
    BigDecimal getProfitInPeriod(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Số hóa đơn hoàn thành theo khoảng thời gian
    @Query(value = """
            SELECT COUNT(id)
            FROM `order`
            WHERE status_order = 5
            AND create_date >= :startDate
            AND create_date < DATE_ADD(:endDate, INTERVAL 1 SECOND)
            """, nativeQuery = true)
    Long getOrderCountInPeriod(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Số hóa đơn tại quầy trong khoảng thời gian
    @Query(value = """
            SELECT COUNT(id)
            FROM `order`
            WHERE status_order = 5 AND kind_of_order = 1
            AND create_date >= :startDate
            AND create_date < DATE_ADD(:endDate, INTERVAL 1 SECOND)
            """, nativeQuery = true)
    Long getInStoreOrderCountInPeriod(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Số hóa đơn online trong khoảng thời gian
    @Query(value = """
            SELECT COUNT(id)
            FROM `order`
            WHERE status_order = 5 AND kind_of_order = 0
            AND create_date >= :startDate
            AND create_date < DATE_ADD(:endDate, INTERVAL 1 SECOND)
            """, nativeQuery = true)
    Long getOnlineOrderCountInPeriod(@Param("startDate") String startDate, @Param("endDate") String endDate);

}
