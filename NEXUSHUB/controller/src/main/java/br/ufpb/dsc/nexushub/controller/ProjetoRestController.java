package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.ProjetoRequest;
import br.ufpb.dsc.nexushub.model.dto.ProjetoResponse;
import br.ufpb.dsc.nexushub.model.service.ProjetoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@RestController
@RequestMapping("/api/projetos")
public class ProjetoRestController {

    private final ProjetoService projetoService;

    public ProjetoRestController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    @GetMapping
    public List<ProjetoResponse> listar(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String autor
    ) {
        if (tag != null && !tag.isBlank()) {
            return projetoService.listarPorTag(tag);
        }
        if (autor != null && !autor.isBlank()) {
            return projetoService.listarPorUsuario(autor);
        }
        return projetoService.listar();
    }

    @GetMapping("/quentes")
    public List<ProjetoResponse> listarQuentes() {
        return projetoService.listarQuentes();
    }

    @GetMapping("/recentes")
    public List<ProjetoResponse> listarRecentes() {
        return projetoService.listarRecentes();
    }

    @GetMapping("/colabs")
    public List<ProjetoResponse> listarColabs() {
        return projetoService.listarColabs();
    }

    @PostMapping
    public ResponseEntity<ProjetoResponse> criar(@Valid @RequestBody ProjetoRequest request) {
        ProjetoResponse projeto = projetoService.criar(request);
        return ResponseEntity.created(URI.create("/api/projetos/" + projeto.id())).body(projeto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obterPorId(@PathVariable Long id) {
        try {
            ProjetoResponse response = projetoService.obterPorId(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new UsuarioRestController.ErrorDto(e.getMessage()));
        }
    }
}
