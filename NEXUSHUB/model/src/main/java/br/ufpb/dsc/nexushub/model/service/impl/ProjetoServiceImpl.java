package br.ufpb.dsc.nexushub.model.service.impl;

import br.ufpb.dsc.nexushub.model.dto.ProjetoRequest;
import br.ufpb.dsc.nexushub.model.dto.ProjetoResponse;
import br.ufpb.dsc.nexushub.model.entity.Projeto;
import br.ufpb.dsc.nexushub.model.repository.ProjetoRepository;
import br.ufpb.dsc.nexushub.model.service.ProjetoService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjetoServiceImpl implements ProjetoService {

    private final ProjetoRepository projetoRepository;

    public ProjetoServiceImpl(ProjetoRepository projetoRepository) {
        this.projetoRepository = projetoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoResponse> listar() {
        return projetoRepository.findAll()
                .stream()
                .map(ProjetoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoResponse> listarQuentes() {
        // Ordena por xpDistribuido decrescente
        return projetoRepository.findAll()
                .stream()
                .sorted((p1, p2) -> {
                    Integer xp1 = p1.getXpDistribuido() != null ? p1.getXpDistribuido() : 0;
                    Integer xp2 = p2.getXpDistribuido() != null ? p2.getXpDistribuido() : 0;
                    return xp2.compareTo(xp1);
                })
                .map(ProjetoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoResponse> listarRecentes() {
        // Ordena por data de criacao decrescente
        return projetoRepository.findAll()
                .stream()
                .sorted((p1, p2) -> {
                    if (p1.getCriadoEm() == null) return 1;
                    if (p2.getCriadoEm() == null) return -1;
                    return p2.getCriadoEm().compareTo(p1.getCriadoEm());
                })
                .map(ProjetoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoResponse> listarColabs() {
        // Filtra por tipo Extensão ou outros com mais de 3 membros para incentivar participação
        return projetoRepository.findAll()
                .stream()
                .filter(p -> "Extensão".equalsIgnoreCase(p.getTipo()) || "Pesquisa".equalsIgnoreCase(p.getTipo()))
                .map(ProjetoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoResponse> listarPorUsuario(String autor) {
        if (autor == null || autor.isBlank()) {
            return List.of();
        }
        return projetoRepository.findAll()
                .stream()
                .filter(p -> autor.equalsIgnoreCase(p.getAutor()))
                .map(ProjetoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoResponse> listarPorTag(String tag) {
        if (tag == null || tag.isBlank()) {
            return List.of();
        }
        return projetoRepository.findAll()
                .stream()
                .filter(p -> p.getTags() != null && p.getTags().toLowerCase().contains(tag.toLowerCase()))
                .map(ProjetoResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ProjetoResponse criar(ProjetoRequest request) {
        Projeto projeto = new Projeto(
                request.nome(),
                request.resumo(),
                request.objetivos(),
                request.categoria(),
                request.tipo(),
                request.tags(),
                request.visibilidade(),
                request.grupoPertencente(),
                request.autor(),
                0, // curtidas inicial
                1, // quantidadeMembros inicial (autor)
                request.imagemCardUrl(),
                request.imagemLandingUrl(),
                request.xpDistribuido() != null ? request.xpDistribuido() : 0
        );

        return ProjetoResponse.from(projetoRepository.save(projeto));
    }

    @Override
    @Transactional(readOnly = true)
    public ProjetoResponse obterPorId(Long id) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com o ID fornecido: " + id));
        return ProjetoResponse.from(projeto);
    }
}
