package br.ufpb.dsc.nexushub.model.people.repository;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.domain.HumanInterest;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HumanInterestRepository extends JpaRepository<HumanInterest, UUID> {

    List<HumanInterest> findByHuman(Human human);
}
