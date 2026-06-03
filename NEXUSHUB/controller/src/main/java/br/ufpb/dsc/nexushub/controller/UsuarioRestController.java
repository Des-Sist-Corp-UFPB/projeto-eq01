package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.ForgotPasswordRequest;
import br.ufpb.dsc.nexushub.model.dto.LoginRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;
import br.ufpb.dsc.nexushub.model.service.UsuarioService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@RestController
@RequestMapping("/api/usuarios")
public class    UsuarioRestController {

    private static final Logger log = LoggerFactory.getLogger(UsuarioRestController.class);
    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@Valid @RequestBody UsuarioCadastroRequest request) {
        log.info("[Cadastro] Recebida requisição de cadastro para nome: '{}', email: '{}', cargo: '{}'", 
                request.nome(), request.email(), request.cargo());
        try {
            UsuarioResponse response = usuarioService.cadastrar(request);
            log.info("[Cadastro] Usuário cadastrado com sucesso! ID: {}, Email: {}", response.id(), response.email());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("[Cadastro] Falha no cadastro para email '{}'. Motivo: {}", request.email(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("[Login] Recebida requisição de login para email: '{}'", request.email());
        try {
            UsuarioResponse response = usuarioService.login(request);
            log.info("[Login] Login bem-sucedido para o email: '{}', ID: {}, Cargo: {}", 
                    response.email(), response.id(), response.cargo());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("[Login] Falha na autenticação para email '{}'. Motivo: {}", request.email(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> redefinirSenha(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("[Esqueci Senha] Recebida requisição de redefinição de senha para email: '{}'", request.email());
        try {
            usuarioService.redefinirSenha(request);
            log.info("[Esqueci Senha] Senha redefinida com sucesso para o email: '{}'", request.email());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("[Esqueci Senha] Falha ao redefinir senha para email '{}'. Motivo: {}", request.email(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PutMapping("/perfil/{id}")
    public ResponseEntity<?> atualizarPerfil(@PathVariable Long id, @Valid @RequestBody UsuarioCadastroRequest request) {
        log.info("[Perfil] Recebida requisição de atualização de perfil para ID: {}, novo email: '{}'", id, request.email());
        try {
            UsuarioResponse response = usuarioService.atualizarPerfil(id, request);
            log.info("[Perfil] Perfil ID {} atualizado com sucesso! Novo email: '{}'", response.id(), response.email());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("[Perfil] Falha ao atualizar perfil ID {}. Motivo: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    // Record interno para expor mensagens de erro limpas no formato JSON {"message": "..."}
    public record ErrorDto(String message) {}
}
