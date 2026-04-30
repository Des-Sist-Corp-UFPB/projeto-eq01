package br.ufpb.dsc.mercado.exception;

/**
 * Exceção lançada quando um produto não é encontrado no banco de dados.
 *
 * <p><strong>Por que usar exceções específicas de domínio?</strong><br>
 * Em vez de lançar uma exceção genérica ({@code RuntimeException} com mensagem "not found"),
 * criar exceções específicas melhora:
 * <ul>
 *   <li><strong>Legibilidade</strong>: o código comunica claramente o que aconteceu.</li>
 *   <li><strong>Tratamento centralizado</strong>: é possível capturar esta exceção específica
 *       em um handler global ({@code @ControllerAdvice}) e retornar HTTP 404.</li>
 *   <li><strong>Rastreabilidade</strong>: logs ficam mais descritivos.</li>
 * </ul>
 *
 * <p><strong>Por que extends RuntimeException?</strong><br>
 * {@code RuntimeException} é uma "unchecked exception" — não precisa ser declarada no {@code throws}
 * nem capturada obrigatoriamente. É a abordagem moderna em Spring para exceções de negócio.
 * "Checked exceptions" (que extends {@code Exception}) são mais usadas para erros recuperáveis
 * de infraestrutura (I/O, rede, etc.).
 *
 * @author DSC - UFPB Campus IV
 */
public class ProdutoNaoEncontradoException extends RuntimeException {

    /**
     * Cria uma exceção com mensagem padrão informando o ID do produto não encontrado.
     *
     * @param id identificador do produto que não foi encontrado
     */
    public ProdutoNaoEncontradoException(Long id) {
        super("Produto não encontrado com id: " + id);
    }

    /**
     * Cria uma exceção com mensagem customizada.
     *
     * @param mensagem descrição do erro
     */
    public ProdutoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
