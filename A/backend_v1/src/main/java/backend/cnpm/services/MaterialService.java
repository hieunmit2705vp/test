package backend.cnpm.services;

import backend.cnpm.dto.request.MaterialCreateRequest;
import backend.cnpm.dto.request.MaterialUpdateRequest;
import backend.cnpm.dto.response.MaterialResponse;
import backend.cnpm.entities.Material;
import backend.cnpm.exceptions.EntityAlreadyExistsException;
import backend.cnpm.exceptions.EntityNotFoundException;
import backend.cnpm.mapper.MaterialMapper;
import backend.cnpm.repositories.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaterialService {

        @Autowired
        private MaterialRepository materialRepository;

        @Autowired
        private AuditLogService auditLogService;

        public Page<MaterialResponse> getAllMaterials(String search, int page, int size, String sortBy,
                        String sortDir) {
                Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();

                Pageable pageable = PageRequest.of(page, size, sort);

                Page<Material> materialPage = materialRepository.searchBrand(search, pageable);

                return materialPage.map(MaterialMapper::toMaterialResponse);
        }

        public MaterialResponse getMaterialById(int id) {
                Material material = materialRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chất liệu có id " + id));
                return MaterialMapper.toMaterialResponse(material);
        }

        @Transactional
        public MaterialResponse createMaterial(MaterialCreateRequest materialCreateRequest) {
                if (materialRepository.existsByMaterialName(materialCreateRequest.getMaterialName())) {
                        throw new EntityAlreadyExistsException(
                                        "Chất liệu có tên " + materialCreateRequest.getMaterialName() + " đã tồn tại");
                }
                Material material = new Material();
                material.setMaterialName(materialCreateRequest.getMaterialName());
                material = materialRepository.save(material);

                MaterialResponse response = MaterialMapper.toMaterialResponse(material);
                auditLogService.log("Material", material.getId(), "CREATE", null,
                                null, response, "Tạo mới chất liệu: " + material.getMaterialName());

                return response;
        }

        @Transactional
        public MaterialResponse updateMaterial(Integer id, MaterialUpdateRequest materialUpdateRequest) {
                Material material = materialRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chất liệu có id " + id));

                // Capture state
                MaterialResponse oldState = MaterialMapper.toMaterialResponse(material);

                if (material.getMaterialName().equalsIgnoreCase(materialUpdateRequest.getMaterialName())
                                && materialRepository.existsByMaterialName(materialUpdateRequest.getMaterialName())) {
                        throw new EntityAlreadyExistsException(
                                        "Chất liệu có tên " + materialUpdateRequest.getMaterialName() + " đã tồn tại");
                }

                material.setMaterialName(materialUpdateRequest.getMaterialName());
                material = materialRepository.save(material);

                MaterialResponse newState = MaterialMapper.toMaterialResponse(material);
                auditLogService.log("Material", material.getId(), "UPDATE", null,
                                oldState, newState, "Cập nhật chất liệu: " + material.getMaterialName());

                return newState;
        }

        @Transactional
        public MaterialResponse toggleMaterialStatus(Integer id) {
                Material material = materialRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy chất liệu có id: " + id));

                boolean oldStatus = material.getStatus();
                material.setStatus(!oldStatus);
                material = materialRepository.save(material);

                MaterialResponse response = MaterialMapper.toMaterialResponse(material);
                auditLogService.log("Material", material.getId(), "TOGGLE_STATUS", null,
                                oldStatus, !oldStatus, "Đổi trạng thái chất liệu: " + material.getMaterialName());

                return response;
        }
}
