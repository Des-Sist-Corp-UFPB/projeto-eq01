package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.ProjetoRequest;
import br.ufpb.dsc.nexushub.model.dto.ProjetoResponse;
import br.ufpb.dsc.nexushub.model.projects.service.ProjectService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projetos")
public class ProjetoRestController {

    private final ProjectService projectService;

    public ProjetoRestController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjetoResponse> listar(@RequestParam(required = false) String tag, @RequestParam(required = false) String autor) {
        return projectService.listProjects(tag, autor).stream().map(ProjetoResponse::from).toList();
    }

    @GetMapping("/quentes")
    public List<ProjetoResponse> listarQuentes() {
        return projectService.listHotProjects().stream().map(ProjetoResponse::from).toList();
    }

    @GetMapping("/recentes")
    public List<ProjetoResponse> listarRecentes() {
        return projectService.listRecentProjects().stream().map(ProjetoResponse::from).toList();
    }

    @GetMapping("/colabs")
    public List<ProjetoResponse> listarColabs() {
        return projectService.listCollaborativeProjects().stream().map(ProjetoResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<ProjetoResponse> criar(@Valid @RequestBody ProjetoRequest request) {
        ProjetoResponse response = ProjetoResponse.from(projectService.createProject(request));
        return ResponseEntity.created(URI.create("/api/projetos/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetoResponse> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(ProjetoResponse.from(projectService.getProject(id)));
    }
}


