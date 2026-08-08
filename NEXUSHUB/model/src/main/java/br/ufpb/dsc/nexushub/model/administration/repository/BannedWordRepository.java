package br.ufpb.dsc.nexushub.model.administration.repository;

import br.ufpb.dsc.nexushub.model.administration.domain.BannedWord;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannedWordRepository extends JpaRepository<BannedWord, UUID> {
    Optional<BannedWord> findByWordIgnoreCase(String word);
}
