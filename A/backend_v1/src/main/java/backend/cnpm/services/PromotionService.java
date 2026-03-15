package backend.cnpm.services;

import backend.cnpm.dto.request.PromotionCreateRequest;
import backend.cnpm.dto.request.PromotionUpdateRequest;
import backend.cnpm.dto.response.PromotionResponse;
import backend.cnpm.entities.Promotion;
import backend.cnpm.exceptions.ResourceNotFoundException;
import backend.cnpm.mapper.PromotionMapper;
import backend.cnpm.repositories.PromotionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private AuditLogService auditLogService;

    public Page<PromotionResponse> getAllPromotion(
            String search,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Integer minPercent,
            Integer maxPercent,
            Boolean status,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Promotion> promotions = promotionRepository.searchPromotions(
                search, startDate, endDate, minPercent, maxPercent, status, pageable);

        return promotions.map(PromotionMapper::toPromotionResponse);
    }

    public PromotionResponse getPromotionById(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion không tồn tại với ID: " + id));
        return PromotionMapper.toPromotionResponse(promotion);
    }

    public PromotionResponse createPromotion(PromotionCreateRequest promotionCreateRequest) {
        if (promotionCreateRequest.getStartDate().isAfter(promotionCreateRequest.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        }
        if (promotionCreateRequest.getPromotionPercent() < 0 || promotionCreateRequest.getPromotionPercent() > 100) {
            throw new IllegalArgumentException("Phần trăm khuyến mãi phải từ 0 đến 100!");
        }

        Promotion promotion = new Promotion();
        promotion.setPromotionName(promotionCreateRequest.getPromotionName());
        promotion.setPromotionPercent(promotionCreateRequest.getPromotionPercent());
        promotion.setStartDate(promotionCreateRequest.getStartDate());
        promotion.setEndDate(promotionCreateRequest.getEndDate());
        promotion.setDescription(promotionCreateRequest.getDescription());
        promotion.setStatus(promotionCreateRequest.getStatus());

        promotion = promotionRepository.save(promotion);

        // Ghi log
        auditLogService.log("Promotion", promotion.getId(), "CREATE", null,
                null, PromotionMapper.toPromotionResponse(promotion),
                "Tạo mới đợt Khuyến mãi: " + promotion.getPromotionName());

        return PromotionMapper.toPromotionResponse(promotion);
    }

    public PromotionResponse updatePromotion(PromotionUpdateRequest updateRequest, Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion không tồn tại với ID: " + id));

        // Capture old state BEFORE modification
        PromotionResponse oldState = PromotionMapper.toPromotionResponse(promotion);

        if (updateRequest.getStartDate().isAfter(updateRequest.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        }

        if (updateRequest.getPromotionPercent() < 0 || updateRequest.getPromotionPercent() > 100) {
            throw new IllegalArgumentException("Phần trăm khuyến mãi phải từ 0 đến 100!");
        }

        promotion.setPromotionName(updateRequest.getPromotionName());
        promotion.setPromotionPercent(updateRequest.getPromotionPercent());
        promotion.setStartDate(updateRequest.getStartDate());
        promotion.setEndDate(updateRequest.getEndDate());
        promotion.setDescription(updateRequest.getDescription());
        promotion.setStatus(updateRequest.getStatus());

        promotion = promotionRepository.save(promotion);

        // Ghi log
        auditLogService.log("Promotion", promotion.getId(), "UPDATE", null,
                oldState,
                PromotionMapper.toPromotionResponse(promotion),
                "Cập nhật đợt Khuyến mãi: " + promotion.getPromotionName());

        return PromotionMapper.toPromotionResponse(promotion);
    }

    @Transactional
    public void deletePromotion(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion không tồn tại với ID: " + id));
        PromotionResponse oldResponse = PromotionMapper.toPromotionResponse(promotion);
        promotionRepository.delete(promotion);

        // Ghi log
        auditLogService.log("Promotion", id, "DELETE", null,
                oldResponse, null,
                "Xóa đợt Khuyến mãi: " + oldResponse.getPromotionName());
    }

    @Transactional
    public PromotionResponse toggleStatusPromotionResponse(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion khong co id: " + id));
        boolean oldStatus = promotion.getStatus();
        promotion.setStatus(!promotion.getStatus());
        Promotion newPromotion = promotionRepository.save(promotion);

        // Ghi log
        auditLogService.log("Promotion", newPromotion.getId(), "TOGGLE_STATUS", null,
                oldStatus ? "Đang hoạt động" : "Ngừng hoạt động",
                newPromotion.getStatus() ? "Đang hoạt động" : "Ngừng hoạt động",
                "Thay đổi trạng thái Khuyến mãi: " + newPromotion.getPromotionName());

        return PromotionMapper.toPromotionResponse(newPromotion);
    }
}
