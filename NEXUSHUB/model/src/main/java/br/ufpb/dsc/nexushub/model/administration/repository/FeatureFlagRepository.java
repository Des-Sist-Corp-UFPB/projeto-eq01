package br.ufpb.dsc.nexushub.model.administration.repository;
import br.ufpb.dsc.nexushub.model.administration.domain.FeatureFlag;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, UUID> {
    Optional<FeatureFlag> findByCode(String code);
}
