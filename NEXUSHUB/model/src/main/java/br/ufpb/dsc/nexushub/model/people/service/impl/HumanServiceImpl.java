package br.ufpb.dsc.nexushub.model.people.service.impl;

import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.people.domain.HumanInterest;
import br.ufpb.dsc.nexushub.model.people.domain.Interest;
import br.ufpb.dsc.nexushub.model.people.repository.HumanInterestRepository;
import br.ufpb.dsc.nexushub.model.people.repository.HumanRepository;
import br.ufpb.dsc.nexushub.model.people.repository.InterestRepository;
import br.ufpb.dsc.nexushub.model.people.service.HumanService;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HumanServiceImpl implements HumanService {

    private final HumanRepository humanRepository;
    private final InterestRepository interestRepository;
    private final HumanInterestRepository humanInterestRepository;

    public HumanServiceImpl(
            HumanRepository humanRepository,
            InterestRepository interestRepository,
            HumanInterestRepository humanInterestRepository
    ) {
        this.humanRepository = humanRepository;
        this.interestRepository = interestRepository;
        this.humanInterestRepository = humanInterestRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Human> findById(UUID humanId) {
        return humanRepository.findById(humanId);
    }

    @Override
    @Transactional
    public Human updateAcademicProfile(UUID humanId, String bio, String course, Integer period, UUID updatedById) {
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa nao encontrada."));
        human.updateProfile(human.getName(), human.getEmail(), bio, course, period, updatedById);
        return humanRepository.save(human);
    }

    @Override
    @Transactional
    public void addInterest(UUID humanId, UUID interestId, UUID updatedById) {
        Human human = humanRepository.findById(humanId)
                .orElseThrow(() -> new IllegalArgumentException("Pessoa nao encontrada."));
        Interest interest = interestRepository.findById(interestId)
                .orElseThrow(() -> new IllegalArgumentException("Interesse nao encontrado."));
        humanInterestRepository.save(new HumanInterest(human, interest, updatedById));
    }
}
