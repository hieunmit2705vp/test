package backend.cnpm.services;

import backend.cnpm.dto.request.SleeveCreateRequest;
import backend.cnpm.dto.request.SleeveUpdateRequest;
import backend.cnpm.dto.response.SleeveResponse;
import backend.cnpm.entities.Sleeve;
import backend.cnpm.exceptions.EntityAlreadyExistsException;
import backend.cnpm.exceptions.EntityNotFoundException;
import backend.cnpm.mapper.SleeveMapper;
import backend.cnpm.repositories.SleeveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SleeveService {

    @Autowired
    private SleeveRepository sleeveRepository;

    @Autowired
    private AuditLogService auditLogService;

    public Page<SleeveResponse> getAllSleeves(String search, int page, int size, String sortBy, String sortDri) {

        Sort sort = sortDri.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Sleeve> sleevePage = sleeveRepository.searchSleeve(search, pageable);

        return sleevePage.map(SleeveMapper::toSleeveResponse);
    }

    public SleeveResponse getSleeveById(Integer id){
        Sleeve sleeve = sleeveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tay áo có id : " + id));
        return SleeveMapper.toSleeveResponse(sleeve);
    }

    @Transactional
    public SleeveResponse createSleeve(SleeveCreateRequest sleeveCreateRequest){
        if(sleeveRepository.existsBySleeveName(sleeveCreateRequest.getSleeveName())){
            throw  new EntityAlreadyExistsException("Tay áo có tên " + sleeveCreateRequest.getSleeveName() + " đã tồn tại");
        }

        Sleeve sleeve = new Sleeve();
        sleeve.setSleeveName(sleeveCreateRequest.getSleeveName());

        sleeve = sleeveRepository.save(sleeve);

        SleeveResponse response = SleeveMapper.toSleeveResponse(sleeve);
        auditLogService.log("Sleeve", sleeve.getId(), "CREATE", null,
                null, response, "Tạo mới tay áo: " + sleeve.getSleeveName());

        return response;
    }

    @Transactional
    public SleeveResponse updateSleeve(Integer id, SleeveUpdateRequest sleeveUpdateRequest){
        Sleeve sleeve = sleeveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tay áo có id: " + id));
        
        // Capture state
        SleeveResponse oldState = SleeveMapper.toSleeveResponse(sleeve);

        if (sleeve.getSleeveName().equalsIgnoreCase(sleeveUpdateRequest.getSleeveName()) && sleeveRepository.existsBySleeveName(sleeveUpdateRequest.getSleeveName())){
            throw new EntityAlreadyExistsException("Tay áo có tên: " + sleeveUpdateRequest.getSleeveName() + " đã tồn tại");
        }

        sleeve.setSleeveName(sleeveUpdateRequest.getSleeveName());
        sleeve = sleeveRepository.save(sleeve);

        SleeveResponse newState = SleeveMapper.toSleeveResponse(sleeve);
        auditLogService.log("Sleeve", sleeve.getId(), "UPDATE", null,
                oldState, newState, "Cập nhật tay áo: " + sleeve.getSleeveName());

        return newState;
    }

    @Transactional
    public SleeveResponse toggleSleeveStatus(Integer id){
        Sleeve sleeve = sleeveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tay áo có id: " + id));
        
        boolean oldStatus = sleeve.getStatus();
        sleeve.setStatus(!oldStatus);
        sleeve = sleeveRepository.save(sleeve);

        SleeveResponse response = SleeveMapper.toSleeveResponse(sleeve);
        auditLogService.log("Sleeve", sleeve.getId(), "TOGGLE_STATUS", null,
                oldStatus, !oldStatus, "Đổi trạng thái tay áo: " + sleeve.getSleeveName());

        return response;
    }
}


