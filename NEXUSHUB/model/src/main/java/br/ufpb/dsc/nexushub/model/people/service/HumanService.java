package br.ufpb.dsc.nexushub.model.people.service;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import java.util.Optional;
import java.util.UUID;

public interface HumanService {

    Optional<Human> findById(UUID humanId);

    Human updateAcademicProfile(UUID humanId, String bio, String course, String period, UUID updatedById);

    void addInterest(UUID humanId, UUID interestId, UUID updatedById);
}
