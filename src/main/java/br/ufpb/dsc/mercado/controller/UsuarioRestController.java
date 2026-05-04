package br.ufpb.dsc.mercado.controller;

import br.ufpb.dsc.mercado.domain.Usuario;
import br.ufpb.dsc.mercado.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.mercado.dto.UsuarioPerfilUpdateRequest;
import br.ufpb.dsc.mercado.dto.UsuarioResponse;
import br.ufpb.dsc.mercado.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios")
public class UsuarioRestController {

    private final UsuarioService usuarioService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria um usuario")
    public UsuarioResponse criar(@Valid @RequestBody UsuarioCadastroRequest request) {
        return UsuarioResponse.from(usuarioService.criar(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Consulta o perfil do usuario autenticado")
    public UsuarioResponse perfil(Authentication authentication) {
        return UsuarioResponse.from(usuarioService.buscarPorUsername(authentication.getName()));
    }

    @PutMapping("/me")
    @Operation(summary = "Atualiza o perfil do usuario autenticado")
    public UsuarioResponse atualizarPerfil(
            Authentication authentication,
            @Valid @RequestBody UsuarioPerfilUpdateRequest request) {

        Usuario usuario = usuarioService.atualizarPerfil(authentication.getName(), request);
        return UsuarioResponse.from(usuario);
    }

    @DeleteMapping("/me")
    @Operation(summary = "Exclui o perfil do usuario autenticado")
    public ResponseEntity<Void> excluirPerfil(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response) {

        usuarioService.excluirPerfil(authentication.getName());
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.noContent().build();
    }
}
