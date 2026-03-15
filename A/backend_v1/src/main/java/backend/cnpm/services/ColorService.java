package backend.cnpm.services;

import backend.cnpm.dto.request.ColorCreateRequest;
import backend.cnpm.dto.request.ColorUpdateRequest;
import backend.cnpm.dto.response.ColorResponse;
import backend.cnpm.entities.Color;
import backend.cnpm.exceptions.EntityAlreadyExistsException;
import backend.cnpm.exceptions.EntityNotFoundException;
import backend.cnpm.exceptions.ResourceNotFoundException;
import backend.cnpm.mapper.ColorMapper;
import backend.cnpm.repositories.ColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ColorService {
    @Autowired
    ColorRepository colorRepository;

    @Autowired
    private AuditLogService auditLogService;

    public Page<ColorResponse> getAllColors(String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Color> colors = colorRepository.searchColors(search, pageable);

        return colors.map(ColorMapper::toColorResponse);
    }

    public ColorResponse getColorById(Integer id) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy màu sắc có id: " + id));
        return ColorMapper.toColorResponse(color);
    }

    @Transactional
    public ColorResponse createColor(ColorCreateRequest colorCreateRequest) {
        if (colorRepository.existsByColorName(colorCreateRequest.getName())) {
            throw new ResourceNotFoundException("Màu sắc có tên: " + colorCreateRequest.getName() + " đã tồn tại");
        }
        Color color = new Color();
        color.setColorName(colorCreateRequest.getName());
        color = colorRepository.save(color);

        ColorResponse response = ColorMapper.toColorResponse(color);
        auditLogService.log("Color", color.getId(), "CREATE", null,
                null, response, "Tạo mới màu sắc: " + color.getColorName());

        return response;
    }

    @Transactional
    public ColorResponse updateColor(Integer id, ColorUpdateRequest colorUpdateRequest) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy màu sắc có id: " + id));

        // Capture state
        ColorResponse oldState = ColorMapper.toColorResponse(color);

        if (color.getColorName().equalsIgnoreCase(colorUpdateRequest.getName())
                && colorRepository.existsByColorName(colorUpdateRequest.getName())) {
            throw new EntityAlreadyExistsException("Màu sắc có tên: " + colorUpdateRequest.getName() + " đã tồn tại");
        }
        color.setColorName(colorUpdateRequest.getName());
        color = colorRepository.save(color);

        ColorResponse newState = ColorMapper.toColorResponse(color);
        auditLogService.log("Color", color.getId(), "UPDATE", null,
                oldState, newState, "Cập nhật màu sắc: " + color.getColorName());

        return newState;
    }

    @Transactional
    public ColorResponse toggleColorStatus(Integer id) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy màu sắc có id: " + id));

        boolean oldStatus = color.getStatus();
        color.setStatus(!oldStatus);
        color = colorRepository.save(color);

        ColorResponse response = ColorMapper.toColorResponse(color);
        auditLogService.log("Color", color.getId(), "TOGGLE_STATUS", null,
                oldStatus, !oldStatus, "Đổi trạng thái màu sắc: " + color.getColorName());

        return response;
    }

    @Transactional
    public void deleteColor(Integer id) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy màu sắc có id: " + id));

        ColorResponse oldState = ColorMapper.toColorResponse(color);
        colorRepository.delete(color);

        auditLogService.log("Color", id, "DELETE", null,
                oldState, null, "Xóa màu sắc: " + color.getColorName());
    }
}
