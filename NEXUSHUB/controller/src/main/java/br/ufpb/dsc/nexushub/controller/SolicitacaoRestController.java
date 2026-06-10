package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.SolicitacaoRequest;
import br.ufpb.dsc.nexushub.model.dto.SolicitacaoResponse;
import br.ufpb.dsc.nexushub.model.dto.SolicitacaoRespostaRequest;
import br.ufpb.dsc.nexushub.model.projects.service.ProjectService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoRestController {

    private final ProjectService projectService;

    public SolicitacaoRestController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody SolicitacaoRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(SolicitacaoResponse.from(projectService.requestMembership(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new UsuarioRestController.ErrorDto(e.getMessage()));
        }
    }

    @GetMapping("/projeto/{projetoId}")
    public ResponseEntity<List<SolicitacaoResponse>> listarPorProjeto(@PathVariable UUID projetoId) {
        return ResponseEntity.ok(projectService.listRequestsByProject(projetoId).stream().map(SolicitacaoResponse::from).toList());
    }

    @PutMapping("/{id}/resposta")
    public ResponseEntity<?> responder(@PathVariable UUID id, @Valid @RequestBody SolicitacaoRespostaRequest request) {
        try {
            projectService.respondMembershipRequest(id, Boolean.TRUE.equals(request.aprovado()));
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new UsuarioRestController.ErrorDto(e.getMessage()));
        }
    }
}


