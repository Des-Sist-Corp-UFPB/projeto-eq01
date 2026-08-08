package br.ufpb.dsc.nexushub.model.administration.repository;

import br.ufpb.dsc.nexushub.model.administration.domain.XpRule;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface XpRuleRepository extends JpaRepository<XpRule, UUID> {
    Optional<XpRule> findByActionKey(String actionKey);
}
