package br.ufpb.dsc.mercado.service;

import br.ufpb.dsc.mercado.domain.Produto;
import br.ufpb.dsc.mercado.dto.ProdutoForm;
import br.ufpb.dsc.mercado.exception.ProdutoNaoEncontradoException;
import br.ufpb.dsc.mercado.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para {@link ProdutoService}.
 *
 * <p><strong>Testes Unitários vs Testes de Integração:</strong>
 * <ul>
 *   <li><strong>Unitário</strong>: testa uma classe isolada, substituindo suas dependências
 *       por objetos falsos (mocks). Rápido, sem banco de dados.</li>
 *   <li><strong>Integração</strong>: testa múltiplas camadas juntas com infraestrutura real
 *       (banco, HTTP, etc.). Mais lento, mais realista.</li>
 * </ul>
 *
 * <p><strong>Mockito:</strong><br>
 * Mockito é o framework de mocking mais usado no ecossistema Spring.
 * Permite criar objetos "falsos" que simulam o comportamento das dependências:
 * <ul>
 *   <li>{@code @Mock} — cria um mock da classe/interface.</li>
 *   <li>{@code @InjectMocks} — cria a classe sob teste e injeta os mocks nela.</li>
 *   <li>{@code when(...).thenReturn(...)} — configura o comportamento do mock.</li>
 *   <li>{@code verify(...)} — verifica se um método foi chamado.</li>
 * </ul>
 *
 * <p><strong>AssertJ:</strong><br>
 * Biblioteca de asserções fluentes incluída no Spring Boot Test.
 * Mais legível que o JUnit assertions padrão:
 * {@code assertThat(resultado).isNotNull().hasFieldOrPropertyWithValue("nome", "Arroz")}
 *
 * @author DSC - UFPB Campus IV
 */
@ExtendWith(MockitoExtension.class) // Ativa o suporte ao Mockito no JUnit 5
@DisplayName("ProdutoService — Testes Unitários")
class ProdutoServiceTest {

    // @Mock cria um objeto falso que simula o ProdutoRepository
    // Nenhuma consulta real ao banco é feita — tudo é simulado
    @Mock
    private ProdutoRepository produtoRepository;

    // @InjectMocks cria uma instância real do ProdutoService
    // e injeta automaticamente o @Mock acima no construtor
    @InjectMocks
    private ProdutoService produtoService;

    // Dados de teste compartilhados
    private Produto produtoExistente;
    private ProdutoForm formValido;

    /**
     * Configuração executada antes de cada teste.
     * {@code @BeforeEach} garante um estado limpo e previsível para cada teste.
     */
    @BeforeEach
    void setUp() {
        produtoExistente = new Produto("Arroz Integral", "Arroz integral tipo 1", new BigDecimal("8.99"));
        produtoExistente.setId(1L);

        formValido = new ProdutoForm("Feijão Preto", "Feijão preto premium", new BigDecimal("7.50"));
    }

    // =========================================================================
    // TESTES: buscarPorId
    // =========================================================================

    @Test
    @DisplayName("buscarPorId: deve retornar produto quando ID existe")
    void buscarPorId_quandoIdExiste_deveRetornarProduto() {
        // GIVEN (Arrange) — configura o comportamento do mock
        // "Quando findById(1L) for chamado, retorne o produto de teste"
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produtoExistente));

        // WHEN (Act) — executa o método sob teste
        Produto resultado = produtoService.buscarPorId(1L);

        // THEN (Assert) — verifica o resultado
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(1L);
        assertThat(resultado.getNome()).isEqualTo("Arroz Integral");

        // Verifica que o repositório foi chamado exatamente uma vez com o ID correto
        verify(produtoRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("buscarPorId: deve lançar exceção quando ID não existe")
    void buscarPorId_quandoIdNaoExiste_deveLancarExcecao() {
        // GIVEN
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN + THEN — assertThatThrownBy verifica que a exceção é lançada
        assertThatThrownBy(() -> produtoService.buscarPorId(99L))
                .isInstanceOf(ProdutoNaoEncontradoException.class)
                .hasMessageContaining("99");

        verify(produtoRepository, times(1)).findById(99L);
    }

    // =========================================================================
    // TESTES: criar
    // =========================================================================

    @Test
    @DisplayName("criar: deve salvar e retornar o novo produto")
    void criar_comFormValido_deveSalvarERetornarProduto() {
        // GIVEN
        // Simula o save() retornando um produto com ID gerado pelo banco
        Produto produtoSalvo = new Produto(formValido.nome(), formValido.descricao(), formValido.preco());
        produtoSalvo.setId(2L);
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        // WHEN
        Produto resultado = produtoService.criar(formValido);

        // THEN
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(2L);
        assertThat(resultado.getNome()).isEqualTo("Feijão Preto");
        assertThat(resultado.getPreco()).isEqualByComparingTo("7.50");

        // Verifica que save() foi chamado com qualquer Produto (não importa qual instância)
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    // =========================================================================
    // TESTES: atualizar
    // =========================================================================

    @Test
    @DisplayName("atualizar: deve modificar os dados do produto existente")
    void atualizar_quandoProdutoExiste_deveAtualizarDados() {
        // GIVEN
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produtoExistente));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoExistente);

        ProdutoForm formAtualizado = new ProdutoForm("Arroz Branco", "Arroz branco tipo 1", new BigDecimal("5.99"));

        // WHEN
        Produto resultado = produtoService.atualizar(1L, formAtualizado);

        // THEN
        assertThat(resultado.getNome()).isEqualTo("Arroz Branco");
        assertThat(resultado.getPreco()).isEqualByComparingTo("5.99");

        verify(produtoRepository).findById(1L);
        verify(produtoRepository).save(any(Produto.class));
    }

    @Test
    @DisplayName("atualizar: deve lançar exceção quando produto não existe")
    void atualizar_quandoProdutoNaoExiste_deveLancarExcecao() {
        // GIVEN
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN + THEN
        assertThatThrownBy(() -> produtoService.atualizar(99L, formValido))
                .isInstanceOf(ProdutoNaoEncontradoException.class);

        // Verifica que save() NUNCA foi chamado (produto não existe, não deve salvar)
        verify(produtoRepository, never()).save(any());
    }

    // =========================================================================
    // TESTES: excluir
    // =========================================================================

    @Test
    @DisplayName("excluir: deve deletar produto quando ID existe")
    void excluir_quandoProdutoExiste_deveDeletar() {
        // GIVEN
        when(produtoRepository.existsById(1L)).thenReturn(true);
        // doNothing() é o padrão para void, mas declaramos explicitamente para clareza
        doNothing().when(produtoRepository).deleteById(1L);

        // WHEN — não deve lançar exceção
        assertThatCode(() -> produtoService.excluir(1L))
                .doesNotThrowAnyException();

        // THEN
        verify(produtoRepository).existsById(1L);
        verify(produtoRepository).deleteById(1L);
    }

    @Test
    @DisplayName("excluir: deve lançar exceção quando produto não existe")
    void excluir_quandoProdutoNaoExiste_deveLancarExcecao() {
        // GIVEN
        when(produtoRepository.existsById(99L)).thenReturn(false);

        // WHEN + THEN
        assertThatThrownBy(() -> produtoService.excluir(99L))
                .isInstanceOf(ProdutoNaoEncontradoException.class)
                .hasMessageContaining("99");

        // deleteById NUNCA deve ser chamado se o produto não existe
        verify(produtoRepository, never()).deleteById(any());
    }
}
