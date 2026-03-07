package backend.datn.services;

import backend.datn.dto.request.ProductCreateRequest;
import backend.datn.dto.request.ProductUpdateRequest;
import backend.datn.dto.response.ProductDetailResponse;
import backend.datn.dto.response.ProductResponse;
import backend.datn.dto.response.UserProductResponse;
import backend.datn.entities.*;
import backend.datn.exceptions.EntityAlreadyExistsException;
import backend.datn.helpers.CodeGeneratorHelper;
import backend.datn.mapper.ProductDetailMapper;
import backend.datn.mapper.ProductMapper;
import backend.datn.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private BrandRepository brandRepository;

        @Autowired
        private CategoryRepository categoryRepository;

        @Autowired
        private MaterialRepository materialRepository;

        @Autowired
        private ProductDetailRepository productDetailRepository;

        @Autowired
        private AuditLogService auditLogService;

        public Page<ProductResponse> getAllProducts(String keyword, Boolean status, int page, int size, String sortBy,
                        String sortDirection) {
                sortBy = (sortBy == null || sortBy.trim().isEmpty()) ? "id" : sortBy;
                Sort sort = "asc".equalsIgnoreCase(sortDirection) ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();
                Pageable pageable = PageRequest.of(page, size, sort);

                return productRepository.findAllWithFilters(keyword, status, pageable)
                                .map(ProductMapper::toProductResponse);
        }

        public ProductResponse getProductById(int id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy sản phẩm với ID: " + id));
                return ProductMapper.toProductResponse(product);
        }

        @Transactional
        public ProductResponse createProduct(ProductCreateRequest request) {
                if (productRepository.existsByProductName(request.getProductName())) {
                        throw new EntityAlreadyExistsException("Tên sản phẩm đã tồn tại.");
                }

                Brand brand = brandRepository.findById(request.getBrandId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thương hiệu."));

                Category category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thể loại."));

                Material material = materialRepository.findById(request.getMaterialId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chất liệu."));

                Product product = new Product();
                product.setProductCode(CodeGeneratorHelper.generateCode("PRO"));
                product.setProductName(request.getProductName());
                product.setBrand(brand);
                product.setCategory(category);
                product.setMaterial(material);
                product.setStatus(true);

                product = productRepository.save(product);

                ProductResponse response = ProductMapper.toProductResponse(product);
                auditLogService.log("Product", product.getId(), "CREATE", null,
                                null, response, "Tạo mới sản phẩm: " + product.getProductName());

                return response;
        }

        @Transactional
        public ProductResponse updateProduct(int id, ProductUpdateRequest request) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy sản phẩm với ID: " + id));

                // Capture state
                ProductResponse oldState = ProductMapper.toProductResponse(product);

                if (productRepository.existsByProductNameAndNotId(request.getProductName(), id)) {
                        throw new EntityAlreadyExistsException("Tên sản phẩm đã tồn tại.");
                }

                Brand brand = brandRepository.findById(request.getBrandId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thương hiệu."));

                Category category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thể loại."));

                Material material = materialRepository.findById(request.getMaterialId())
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chất liệu."));

                product.setProductName(request.getProductName());
                product.setBrand(brand);
                product.setCategory(category);
                product.setMaterial(material);

                product = productRepository.save(product);

                ProductResponse newState = ProductMapper.toProductResponse(product);
                auditLogService.log("Product", product.getId(), "UPDATE", null,
                                oldState, newState, "Cập nhật sản phẩm: " + product.getProductName());

                return newState;
        }

        @Transactional
        public void deleteProduct(Integer id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy sản phẩm với ID: " + id));

                ProductResponse oldState = ProductMapper.toProductResponse(product);
                productRepository.delete(product);

                auditLogService.log("Product", id, "DELETE", null,
                                oldState, null, "Xóa sản phẩm: " + product.getProductName());
        }

        @Transactional
        public ProductResponse toggleProductStatus(int id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy sản phẩm với ID: " + id));

                boolean oldStatus = product.getStatus();
                product.setStatus(!oldStatus);
                product = productRepository.save(product);

                ProductResponse response = ProductMapper.toProductResponse(product);
                auditLogService.log("Product", product.getId(), "TOGGLE_STATUS", null,
                                oldStatus, !oldStatus, "Đổi trạng thái sản phẩm: " + product.getProductName());

                return response;
        }

        public List<ProductDetailResponse> getProductDetailsByProductCode(String productCode) {
                List<ProductDetail> productDetails = productDetailRepository.findByProductCode(productCode);
                if (productDetails.isEmpty()) {
                        throw new EntityNotFoundException("No product details found for product code: " + productCode);
                }
                return productDetails.stream()
                                .map(ProductDetailMapper::toProductDetailResponse)
                                .collect(Collectors.toList());
        }

        public Page<UserProductResponse> getAllProductUser(
                        String search, List<Integer> brandIds, List<Integer> categoryIds,
                        List<Integer> materialIds, List<Integer> collarIds, List<Integer> sleeveIds,
                        List<Integer> colorIds, List<Integer> sizeIds, BigDecimal minPrice,
                        BigDecimal maxPrice, String sortBy, String sortDir, int page, int size) {
                // Kiểm tra giá trị hợp lệ của sortBy
                List<String> allowedSortFields = List.of("id", "productName", "quantity", "salePrice");
                if (!allowedSortFields.contains(sortBy)) {
                        sortBy = "id"; // Mặc định nếu không hợp lệ
                }

                // Tạo Sort object từ sortBy và sortDir
                Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();
                Pageable pageable = PageRequest.of(page, size, sort);

                return productRepository.findAllWithFilters(
                                search, brandIds, categoryIds, materialIds, collarIds, sleeveIds, colorIds, sizeIds,
                                minPrice, maxPrice, pageable);
        }

}
