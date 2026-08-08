package br.ufpb.dsc.nexushub.model.privacy.repository;
import br.ufpb.dsc.nexushub.model.privacy.domain.DataSubjectRequest;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DataSubjectRequestRepository extends JpaRepository<DataSubjectRequest,UUID>{List<DataSubjectRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);}
