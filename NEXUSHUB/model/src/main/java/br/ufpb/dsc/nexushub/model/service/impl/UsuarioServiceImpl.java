package br.ufpb.dsc.nexushub.model.service.impl;

import br.ufpb.dsc.nexushub.model.dto.ForgotPasswordRequest;
import br.ufpb.dsc.nexushub.model.dto.LoginRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;
import br.ufpb.dsc.nexushub.model.entity.Usuario;
import br.ufpb.dsc.nexushub.model.repository.UsuarioRepository;
import br.ufpb.dsc.nexushub.model.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioServiceImpl.class);
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UsuarioResponse cadastrar(UsuarioCadastroRequest request) {
        String emailFormatado = request.email().trim().toLowerCase();
        log.info("[Service - Cadastro] Iniciando cadastro para email: '{}'", emailFormatado);
        
        if (usuarioRepository.findByEmail(emailFormatado).isPresent()) {
            log.warn("[Service - Cadastro] Email '{}' já está em uso.", emailFormatado);
            throw new IllegalArgumentException("Este e-mail já está cadastrado.");
        }

        Usuario usuario = new Usuario(
                request.nome().trim(),
                emailFormatado,
                passwordEncoder.encode(request.senha()),
                request.cargo() != null ? request.cargo() : "ESTUDANTE"
        );

        Usuario salvo = usuarioRepository.save(usuario);
        log.info("[Service - Cadastro] Usuário salvo no BD com sucesso. ID: {}", salvo.getId());
        return UsuarioResponse.from(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse login(LoginRequest request) {
        String emailFormatado = request.email().trim().toLowerCase();
        log.info("[Service - Login] Tentativa de login para o email: '{}'", emailFormatado);
        
        Usuario usuario = usuarioRepository.findByEmail(emailFormatado)
                .orElseThrow(() -> {
                    log.warn("[Service - Login] Usuário com email '{}' não encontrado no banco de dados.", emailFormatado);
                    return new IllegalArgumentException("E-mail ou senha incorretos.");
                });

        log.info("[Service - Login] Usuário encontrado. Validando senha criptografada...");
        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            log.warn("[Service - Login] Senha incorreta para o email '{}'.", emailFormatado);
            throw new IllegalArgumentException("E-mail ou senha incorretos.");
        }

        log.info("[Service - Login] Login autorizado para o email '{}' (ID: {}).", emailFormatado, usuario.getId());
        return UsuarioResponse.from(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse atualizarPerfil(Long id, UsuarioCadastroRequest request) {
        String emailFormatado = request.email().trim().toLowerCase();
        log.info("[Service - Perfil] Iniciando atualização do perfil ID: {}, Novo Email: '{}'", id, emailFormatado);
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[Service - Perfil] Usuário com ID {} não encontrado.", id);
                    return new IllegalArgumentException("Usuário não encontrado.");
                });

        // Se estiver alterando o email, verifica se já está em uso por outro usuário
        if (!usuario.getEmail().equalsIgnoreCase(request.email().trim())) {
            if (usuarioRepository.findByEmail(emailFormatado).isPresent()) {
                log.warn("[Service - Perfil] Email '{}' já está sendo usado por outro usuário.", emailFormatado);
                throw new IllegalArgumentException("Este e-mail já está em uso por outro usuário.");
            }
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(emailFormatado);
        if (request.cargo() != null && !request.cargo().isBlank()) {
            usuario.setCargo(request.cargo());
        }

        // Se a senha for enviada com comprimento mínimo de 6, redefinimos ela
        if (request.senha() != null && request.senha().trim().length() >= 6) {
            log.info("[Service - Perfil] Nova senha fornecida. Atualizando hash BCrypt...");
            usuario.setSenha(passwordEncoder.encode(request.senha().trim()));
        }

        Usuario salvo = usuarioRepository.save(usuario);
        log.info("[Service - Perfil] Perfil ID {} atualizado com sucesso no BD.", salvo.getId());
        return UsuarioResponse.from(salvo);
    }

    @Override
    @Transactional
    public void redefinirSenha(ForgotPasswordRequest request) {
        String emailFormatado = request.email().trim().toLowerCase();
        log.info("[Service - Esqueci Senha] Redefinindo senha para o email: '{}'", emailFormatado);
        
        Usuario usuario = usuarioRepository.findByEmail(emailFormatado)
                .orElseThrow(() -> {
                    log.warn("[Service - Esqueci Senha] Email '{}' não encontrado.", emailFormatado);
                    return new IllegalArgumentException("Nenhum usuário cadastrado com este e-mail.");
                });

        usuario.setSenha(passwordEncoder.encode(request.novaSenha().trim()));
        usuarioRepository.save(usuario);
        log.info("[Service - Esqueci Senha] Senha redefinida com sucesso no BD para o email: '{}'", emailFormatado);
    }
}
