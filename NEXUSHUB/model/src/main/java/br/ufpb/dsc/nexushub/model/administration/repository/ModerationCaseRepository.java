package br.ufpb.dsc.nexushub.model.administration.repository;

import br.ufpb.dsc.nexushub.model.administration.domain.ModerationCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ModerationCaseRepository extends JpaRepository<ModerationCase, UUID> {
    List<ModerationCase> findAllByStatusOrderByCreatedTimeDesc(String status);
}
