package br.ufpb.dsc.nexushub.model.service;

import br.ufpb.dsc.nexushub.model.dto.ForgotPasswordRequest;
import br.ufpb.dsc.nexushub.model.dto.LoginRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;

public interface UsuarioService {
    UsuarioResponse cadastrar(UsuarioCadastroRequest request);
    UsuarioResponse login(LoginRequest request);
    UsuarioResponse atualizarPerfil(Long id, UsuarioCadastroRequest request);
    void redefinirSenha(ForgotPasswordRequest request);
}
