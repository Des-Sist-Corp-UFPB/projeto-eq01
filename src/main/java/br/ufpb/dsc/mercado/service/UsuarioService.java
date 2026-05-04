package br.ufpb.dsc.mercado.service;

import br.ufpb.dsc.mercado.domain.Usuario;
import br.ufpb.dsc.mercado.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.mercado.dto.UsuarioPerfilUpdateRequest;
import br.ufpb.dsc.mercado.exception.UsuarioNaoEncontradoException;
import br.ufpb.dsc.mercado.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario criar(UsuarioCadastroRequest request) {
        validarUsernameDisponivel(request.username());
        validarEmailDisponivel(request.email());

        Usuario usuario = new Usuario(
                request.nome().trim(),
                request.username().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.senha())
        );

        return usuarioRepository.save(usuario);
    }

    public Usuario buscarPorUsername(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(username));
    }

    @Transactional
    public Usuario atualizarPerfil(String username, UsuarioPerfilUpdateRequest request) {
        Usuario usuario = buscarPorUsername(username);

        if (usuarioRepository.existsByEmailAndUsernameNot(request.email(), username)) {
            throw new IllegalArgumentException("Este e-mail ja esta em uso");
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(request.email().trim().toLowerCase());

        if (StringUtils.hasText(request.senha())) {
            if (request.senha().length() < 6) {
                throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres");
            }
            usuario.setSenha(passwordEncoder.encode(request.senha()));
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void excluirPerfil(String username) {
        Usuario usuario = buscarPorUsername(username);
        usuarioRepository.delete(usuario);
    }

    private void validarUsernameDisponivel(String username) {
        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Este usuario ja esta em uso");
        }
    }

    private void validarEmailDisponivel(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Este e-mail ja esta em uso");
        }
    }
}
