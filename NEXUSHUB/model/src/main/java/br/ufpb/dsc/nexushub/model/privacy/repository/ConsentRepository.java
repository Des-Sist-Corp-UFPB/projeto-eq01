package br.ufpb.dsc.nexushub.model.privacy.repository;
import br.ufpb.dsc.nexushub.model.privacy.domain.Consent;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ConsentRepository extends JpaRepository<Consent,UUID>{List<Consent> findByUserIdOrderByCreatedAtDesc(UUID userId);}
