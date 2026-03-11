package backend.datn.services;

import backend.datn.entities.AuditLog;
import backend.datn.repositories.AuditLogRepository;
import backend.datn.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

import java.time.LocalDateTime;

@Service
public class AuditLogService {
    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void log(String entityName, Integer entityId, String action, String actor, Object oldValue, Object newValue,
            String notes) {
        try {
            AuditLog log = new AuditLog();
            log.setEntityName(entityName);
            log.setEntityId(entityId);
            log.setAction(action);

            // Tự động lấy actor nếu không được truyền vào
            if (actor == null || actor.isEmpty()) {
                try {
                    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                    if (principal instanceof CustomUserDetails) {
                        CustomUserDetails user = (CustomUserDetails) principal;
                        actor = user.getUsername() + " #" + user.getId();
                    } else if (principal instanceof String) {
                        actor = (String) principal;
                    }
                } catch (Exception e) {
                    actor = "Hệ thống";
                }
            }
            log.setActor(actor != null ? actor : "Hệ thống");

            log.setOldValue(oldValue != null ? objectMapper.writeValueAsString(oldValue) : null);
            log.setNewValue(newValue != null ? objectMapper.writeValueAsString(newValue) : null);
            log.setNotes(notes);

            auditLogRepository.save(log);
            logger.info("Saved AuditLog: {} for {} ID: {}", action, entityName, entityId);
        } catch (Exception e) {
            logger.error("Error saving AuditLog: {}", e.getMessage());
        }
    }

    public Page<AuditLog> getAllLogs(String search, String actor, String action, String entityName, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        logger.info("Yêu cầu lọc AuditLog: search={}, actor={}, action={}, entityName={}, from={}, to={}", 
            search, actor, action, entityName, startDate, endDate);
        
        Specification<AuditLog> spec = new Specification<AuditLog>() {
            @Override
            public Predicate toPredicate(@org.springframework.lang.Nullable jakarta.persistence.criteria.Root<AuditLog> root, 
                                       @org.springframework.lang.Nullable jakarta.persistence.criteria.CriteriaQuery<?> query, 
                                       @org.springframework.lang.Nullable jakarta.persistence.criteria.CriteriaBuilder cb) {
                if (root == null || cb == null) return null;
                List<Predicate> predicates = new ArrayList<>();

                // Tìm kiếm toàn cầu (Global Search)
                if (search != null && !search.trim().isEmpty()) {
                    String rawSearch = search.trim();
                    String pattern = "%" + rawSearch.toLowerCase() + "%";
                    List<Predicate> searchPredicates = new ArrayList<>();
                    
                    searchPredicates.add(cb.like(cb.lower(root.get("actor")), pattern));
                    searchPredicates.add(cb.like(cb.lower(root.get("entityName")), pattern));
                    searchPredicates.add(cb.like(cb.lower(root.get("action")), pattern));
                    searchPredicates.add(cb.like(cb.lower(root.get("notes")), pattern));
                    
                    // Hỗ trợ tìm kiếm kết hợp "EntityName #ID"
                    searchPredicates.add(cb.like(
                        cb.lower(
                            cb.concat(
                                cb.concat(root.get("entityName"), " #"), 
                                root.get("entityId").as(String.class)
                            )
                        ), 
                        pattern
                    ));

                    // Thử tìm kiếm theo ID nếu search là số hoặc có dạng #number
                    try {
                        String idStr = rawSearch.startsWith("#") ? rawSearch.substring(1) : rawSearch;
                        Long idSearch = Long.parseLong(idStr);
                        searchPredicates.add(cb.equal(root.get("id"), idSearch));
                        searchPredicates.add(cb.equal(root.get("entityId"), idSearch.intValue()));
                    } catch (NumberFormatException e) {
                        // Không phải số thì bỏ qua filter ID trực tiếp
                    }
                    
                    predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
                }

                if (actor != null && !actor.trim().isEmpty()) {
                    predicates.add(cb.like(cb.lower(root.get("actor")), "%" + actor.trim().toLowerCase() + "%"));
                }

                if (action != null && !action.trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("action"), action.trim()));
                    logger.debug("Thêm filter action: {}", action);
                }

                if (entityName != null && !entityName.trim().isEmpty()) {
                    String rawEntityName = entityName.trim();
                    if (rawEntityName.contains("#")) {
                        String pattern = "%" + rawEntityName.toLowerCase() + "%";
                        predicates.add(cb.like(
                            cb.lower(
                                cb.concat(
                                    cb.concat(root.get("entityName"), " #"), 
                                    root.get("entityId").as(String.class)
                                )
                            ), 
                            pattern
                        ));
                    } else {
                        predicates.add(cb.like(cb.lower(root.get("entityName")), "%" + rawEntityName.toLowerCase() + "%"));
                    }
                    logger.debug("Thêm filter entityName: {}", rawEntityName);
                }

                if (startDate != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
                    logger.debug("Thêm filter startDate: {}", startDate);
                }

                if (endDate != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
                    logger.debug("Thêm filter endDate: {}", endDate);
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            }
        };

        return auditLogRepository.findAll(spec, pageable);
    }
}
