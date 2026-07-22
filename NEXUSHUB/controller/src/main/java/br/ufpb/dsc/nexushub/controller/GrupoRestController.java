package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.GrupoRequest;
import br.ufpb.dsc.nexushub.model.dto.GrupoResponse;
import br.ufpb.dsc.nexushub.model.groups.service.GroupService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grupos")
public class GrupoRestController {

    private final GroupService groupService;

    public GrupoRestController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    public List<GrupoResponse> listar() {
        return groupService.listActiveGroups().stream()
                .map(group -> GrupoResponse.from(group, groupService.getResponsibleName(group.getId())))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrupoResponse> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(GrupoResponse.from(groupService.getGroup(id), groupService.getResponsibleName(id)));
    }

    @PostMapping
    public GrupoResponse criar(@Valid @RequestBody GrupoRequest request) {
        var group = groupService.createGroup(request);
        return GrupoResponse.from(group, groupService.getResponsibleName(group.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

}


