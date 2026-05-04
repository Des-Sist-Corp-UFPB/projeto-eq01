package br.ufpb.dsc.mercado.controller;

import br.ufpb.dsc.mercado.dto.ErroResponse;
import br.ufpb.dsc.mercado.exception.UsuarioNaoEncontradoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException exception) {
        List<String> mensagens = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        return erro(HttpStatus.BAD_REQUEST, mensagens);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponse> regraNegocio(IllegalArgumentException exception) {
        return erro(HttpStatus.BAD_REQUEST, List.of(exception.getMessage()));
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> usuarioNaoEncontrado(UsuarioNaoEncontradoException exception) {
        return erro(HttpStatus.NOT_FOUND, List.of(exception.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> credenciaisInvalidas() {
        return erro(HttpStatus.UNAUTHORIZED, List.of("Usuario ou senha invalidos"));
    }

    private ResponseEntity<ErroResponse> erro(HttpStatus status, List<String> mensagens) {
        return ResponseEntity.status(status)
                .body(new ErroResponse(Instant.now(), status.value(), status.getReasonPhrase(), mensagens));
    }
}
