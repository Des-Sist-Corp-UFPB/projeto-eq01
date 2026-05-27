package br.ufpb.dsc.nexushub.model.repository;

import br.ufpb.dsc.nexushub.model.entity.SolicitacaoEntrada;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitacaoEntradaRepository extends JpaRepository<SolicitacaoEntrada, Long> {

    List<SolicitacaoEntrada> findByProjetoId(Long projetoId);

    List<SolicitacaoEntrada> findByProjetoIdAndStatus(Long projetoId, String status);

    List<SolicitacaoEntrada> findByUsuarioEmail(String email);
}
