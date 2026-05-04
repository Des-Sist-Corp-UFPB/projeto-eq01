package br.ufpb.dsc.mercado.exception;

public class UsuarioNaoEncontradoException extends RuntimeException {

    public UsuarioNaoEncontradoException(String username) {
        super("Usuario nao encontrado: " + username);
    }
}
