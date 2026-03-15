package backend.cnpm.services;

import backend.cnpm.dto.request.SizeCreateRequest;
import backend.cnpm.dto.request.SizeUpdateRequest;
import backend.cnpm.dto.response.SizeResponse;
import backend.cnpm.entities.Size;
import backend.cnpm.exceptions.EntityAlreadyExistsException;
import backend.cnpm.exceptions.EntityNotFoundException;
import backend.cnpm.exceptions.ResourceNotFoundException;
import backend.cnpm.mapper.SizeMapper;
import backend.cnpm.repositories.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SizeService {
    @Autowired
    SizeRepository sizeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public Page<SizeResponse> getAllSizes(String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Size> sizes = sizeRepository.searchSizes(search, pageable);

        return sizes.map(SizeMapper::toSizeResponse);
    }

    public SizeResponse getSizeById(Integer id) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kích thước có id: " + id));
        return SizeMapper.toSizeResponse(size);
    }

    @Transactional
    public SizeResponse createSize(SizeCreateRequest sizeCreateRequest) {
        if (sizeRepository.existsBySizeName(sizeCreateRequest.getName())) {
            throw new ResourceNotFoundException("Kích thước có tên: " + sizeCreateRequest.getName() + " đã tồn tại");
        }
        Size size = new Size();
        size.setSizeName(sizeCreateRequest.getName());
        size = sizeRepository.save(size);

        SizeResponse response = SizeMapper.toSizeResponse(size);
        auditLogService.log("Size", size.getId(), "CREATE", null,
                null, response, "Tạo mới kích thước: " + size.getSizeName());

        return response;
    }

    @Transactional
    public SizeResponse updateSize(Integer id, SizeUpdateRequest sizeUpdateRequest) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kích thước có id: " + id));

        // Capture state
        SizeResponse oldState = SizeMapper.toSizeResponse(size);

        if (size.getSizeName().equalsIgnoreCase(sizeUpdateRequest.getName())
                && sizeRepository.existsBySizeName(sizeUpdateRequest.getName())) {
            throw new EntityAlreadyExistsException("Kích thước có tên: " + sizeUpdateRequest.getName() + " đã tồn tại");
        }
        size.setSizeName(sizeUpdateRequest.getName());
        size = sizeRepository.save(size);

        SizeResponse newState = SizeMapper.toSizeResponse(size);
        auditLogService.log("Size", size.getId(), "UPDATE", null,
                oldState, newState, "Cập nhật kích thước: " + size.getSizeName());

        return newState;
    }

    @Transactional
    public void deleteSize(Integer id) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kích thước có id: " + id));

        SizeResponse oldState = SizeMapper.toSizeResponse(size);
        sizeRepository.delete(size);

        auditLogService.log("Size", id, "DELETE", null,
                oldState, null, "Xóa kích thước: " + size.getSizeName());
    }

    @Transactional
    public SizeResponse toggleSizeStatus(Integer id) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kích thước có id: " + id));

        boolean oldStatus = size.getStatus();
        size.setStatus(!oldStatus);
        size = sizeRepository.save(size);

        SizeResponse response = SizeMapper.toSizeResponse(size);
        auditLogService.log("Size", size.getId(), "TOGGLE_STATUS", null,
                oldStatus, !oldStatus, "Đổi trạng thái kích thước: " + size.getSizeName());

        return response;
    }
}
