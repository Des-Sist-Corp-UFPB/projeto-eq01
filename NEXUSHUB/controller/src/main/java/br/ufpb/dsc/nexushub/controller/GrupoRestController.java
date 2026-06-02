package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.entity.Grupo;
import br.ufpb.dsc.nexushub.model.repository.GrupoRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@RestController
@RequestMapping("/api/grupos")
public class GrupoRestController {

    private final GrupoRepository grupoRepository;

    public GrupoRestController(GrupoRepository grupoRepository) {
        this.grupoRepository = grupoRepository;
    }

    @GetMapping
    public List<Grupo> listar() {
        return grupoRepository.findAll();
    }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> obterPorId(@PathVariable Long id) {
        return grupoRepository.findById(id)
                .map(grupo -> org.springframework.http.ResponseEntity.ok().body(grupo))
                .orElseGet(() -> org.springframework.http.ResponseEntity.notFound().build());
    }

    @PostMapping
    public Grupo criar(@RequestBody Grupo grupo) {
        return grupoRepository.save(grupo);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deletar(@PathVariable("id") Long id) {
        return grupoRepository.findById(id)
                .map(grupo -> {
                    grupoRepository.delete(grupo);
                    return org.springframework.http.ResponseEntity.noContent().build();
                })
                .orElseGet(() -> org.springframework.http.ResponseEntity.notFound().build());
    }
}
