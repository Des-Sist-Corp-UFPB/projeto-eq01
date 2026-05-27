package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.SolicitacaoRequest;
import br.ufpb.dsc.nexushub.model.dto.SolicitacaoRespostaRequest;
import br.ufpb.dsc.nexushub.model.entity.SolicitacaoEntrada;
import br.ufpb.dsc.nexushub.model.service.SolicitacaoService;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoRestController {

    private static final Logger log = LoggerFactory.getLogger(SolicitacaoRestController.class);
    private final SolicitacaoService solicitacaoService;

    public SolicitacaoRestController(SolicitacaoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody SolicitacaoRequest request) {
        log.info("[Solicitacao REST] POST /api/solicitacoes recebido para projeto ID: {}, estudante: '{}'", 
                request.projetoId(), request.usuarioEmail());
        try {
            SolicitacaoEntrada response = solicitacaoService.criar(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("[Solicitacao REST] Erro ao criar solicitação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new UsuarioRestController.ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/projeto/{projetoId}")
    public ResponseEntity<List<SolicitacaoEntrada>> listarPorProjeto(@PathVariable Long projetoId) {
        log.info("[Solicitacao REST] GET /api/solicitacoes/projeto/{} recebido", projetoId);
        List<SolicitacaoEntrada> solicitacoes = solicitacaoService.listarPorProjeto(projetoId);
        return ResponseEntity.ok(solicitacoes);
    }

    @PutMapping("/{id}/resposta")
    public ResponseEntity<?> responder(@PathVariable Long id, @Valid @RequestBody SolicitacaoRespostaRequest request) {
        log.info("[Solicitacao REST] PUT /api/solicitacoes/{}/resposta recebido. Aprovado: {}", id, request.aprovado());
        try {
            solicitacaoService.responder(id, request.aprovado());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("[Solicitacao REST] Erro ao responder solicitação ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new UsuarioRestController.ErrorDto(e.getMessage()));
        }
    }
}
