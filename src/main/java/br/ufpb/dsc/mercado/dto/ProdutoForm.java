package br.ufpb.dsc.mercado.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * DTO (Data Transfer Object) para criação e edição de produtos.
 *
 * <p><strong>Por que usar um DTO em vez da entidade diretamente?</strong><br>
 * É uma boa prática separar os dados de entrada (formulário) da entidade de domínio.
 * Isso evita problemas de segurança como "mass assignment" (atribuição em massa),
 * onde um usuário mal-intencionado poderia enviar campos que não deveriam ser editados
 * (ex.: {@code id}, {@code criadoEm}).
 *
 * <p><strong>Records Java (Java 16+):</strong><br>
 * Um {@code record} é uma classe imutável que gera automaticamente:
 * <ul>
 *   <li>Construtor com todos os campos</li>
 *   <li>Getters (acessados pelo nome do campo, sem prefixo "get")</li>
 *   <li>{@code equals()}, {@code hashCode()} e {@code toString()}</li>
 * </ul>
 * É ideal para DTOs porque os dados de entrada não devem ser modificados após recebidos.
 *
 * <p><strong>Bean Validation (Jakarta Validation):</strong><br>
 * As anotações abaixo definem regras de validação que são verificadas automaticamente
 * pelo Spring quando o controller recebe os dados com {@code @Valid} ou {@code @Validated}.
 * Se alguma regra falhar, o Spring lança {@code MethodArgumentNotValidException}.
 *
 * @param nome      nome do produto — obrigatório, entre 2 e 120 caracteres
 * @param descricao descrição opcional — máximo 2000 caracteres
 * @param preco     preço do produto — obrigatório, não negativo, máximo 2 casas decimais
 *
 * @author DSC - UFPB Campus IV
 */
public record ProdutoForm(

        /**
         * {@code @NotBlank} falha se o valor for {@code null}, vazio ("") ou apenas espaços.
         * Difere de {@code @NotNull} (aceita strings vazias) e {@code @NotEmpty} (aceita espaços).
         * {@code @Size} valida o comprimento da string.
         */
        @NotBlank(message = "O nome é obrigatório")
        @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres")
        String nome,

        /**
         * Campo opcional. Sem {@code @NotBlank}, o campo pode ser nulo ou vazio.
         * {@code @Size} ainda é aplicado quando o valor não for nulo.
         */
        @Size(max = 2000, message = "A descrição pode ter no máximo 2000 caracteres")
        String descricao,

        /**
         * {@code @NotNull} garante que o preço seja enviado.
         * {@code @DecimalMin} define o valor mínimo permitido (inclusive, por padrão).
         * {@code @Digits} controla a precisão: 8 dígitos inteiros e 2 decimais.
         */
        @NotNull(message = "O preço é obrigatório")
        @DecimalMin(value = "0.00", message = "O preço não pode ser negativo")
        @Digits(integer = 8, fraction = 2, message = "Preço deve ter no máximo 8 dígitos inteiros e 2 decimais")
        BigDecimal preco

) {
}
