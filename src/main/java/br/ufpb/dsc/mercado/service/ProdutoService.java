package br.ufpb.dsc.mercado.service;

import br.ufpb.dsc.mercado.domain.Produto;
import br.ufpb.dsc.mercado.dto.ProdutoForm;
import br.ufpb.dsc.mercado.exception.ProdutoNaoEncontradoException;
import br.ufpb.dsc.mercado.repository.ProdutoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Serviço de negócio para operações relacionadas a {@link Produto}.
 *
 * <p><strong>O que é a camada de Service?</strong><br>
 * O Service é responsável pela lógica de negócio da aplicação. Ele fica entre o
 * Controller (que lida com HTTP) e o Repository (que acessa o banco).
 * Essa separação de responsabilidades segue o padrão de arquitetura em camadas:
 * <pre>
 *   Controller (HTTP) → Service (regras de negócio) → Repository (banco de dados)
 * </pre>
 *
 * <p><strong>{@code @Service}:</strong><br>
 * É uma especialização de {@code @Component}. Indica semanticamente que esta classe
 * contém lógica de negócio. O Spring a detecta no escaneamento de componentes.
 *
 * <p><strong>{@code @Transactional}:</strong><br>
 * Garante que operações de escrita (create, update, delete) sejam executadas dentro
 * de uma transação de banco de dados. Se ocorrer qualquer exceção em runtime, a
 * transação é automaticamente revertida (rollback), preservando a consistência dos dados.
 *
 * @author DSC - UFPB Campus IV
 */
@Service
// @Transactional(readOnly = true) como padrão da classe melhora performance em leituras,
// pois informa ao banco que não haverá escrita nesta transação.
@Transactional(readOnly = true)
public class ProdutoService {

    // Injeção de dependência via construtor — prática recomendada pelo Spring e mais testável
    private final ProdutoRepository produtoRepository;

    /**
     * Construtor com injeção de dependência.
     *
     * <p>Quando há apenas um construtor, o {@code @Autowired} é opcional a partir do Spring 4.3.
     * A injeção via construtor é preferível à injeção via campo ({@code @Autowired} no campo)
     * porque torna as dependências explícitas e facilita os testes unitários com Mockito.
     *
     * @param produtoRepository repositório JPA de produtos
     */
    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    /**
     * Lista todos os produtos com paginação.
     *
     * <p>Utiliza {@code @Transactional(readOnly = true)} herdado da classe,
     * otimizando a performance pois o banco sabe que não precisa rastrear mudanças.
     *
     * @param pageable configuração de página, tamanho e ordenação
     * @return página de produtos
     */
    public Page<Produto> listar(Pageable pageable) {
        return produtoRepository.findAll(pageable);
    }

    /**
     * Busca produtos pelo nome (parcial, sem distinção de maiúsculas/minúsculas).
     * Se a busca estiver vazia, retorna todos os produtos.
     *
     * @param busca    texto para filtrar por nome (pode ser nulo ou vazio)
     * @param pageable configuração de paginação
     * @return página de produtos filtrados
     */
    public Page<Produto> buscar(String busca, Pageable pageable) {
        if (!StringUtils.hasText(busca)) {
            return produtoRepository.findAll(pageable);
        }
        return produtoRepository.findByNomeContainingIgnoreCase(busca.trim(), pageable);
    }

    /**
     * Busca um produto pelo seu ID.
     *
     * <p>{@code orElseThrow} é um método do {@code Optional<T>} que retorna o valor
     * se presente, ou lança a exceção fornecida caso contrário.
     *
     * @param id identificador do produto
     * @return produto encontrado
     * @throws ProdutoNaoEncontradoException se nenhum produto for encontrado com o ID informado
     */
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
    }

    /**
     * Cria um novo produto a partir dos dados do formulário.
     *
     * <p>{@code @Transactional} (sem readOnly) garante que o INSERT seja
     * feito dentro de uma transação com rollback automático em caso de erro.
     *
     * @param form dados validados do formulário
     * @return produto criado e persistido com ID gerado
     */
    @Transactional
    public Produto criar(ProdutoForm form) {
        Produto produto = new Produto(
                form.nome(),
                form.descricao(),
                form.preco()
        );
        // O método save() do JpaRepository faz o INSERT e retorna a entidade com o ID gerado
        return produtoRepository.save(produto);
    }

    /**
     * Atualiza os dados de um produto existente.
     *
     * <p>O padrão aqui é "buscar, modificar, salvar":
     * <ol>
     *   <li>Busca a entidade gerenciada pelo JPA.</li>
     *   <li>Modifica seus campos.</li>
     *   <li>O JPA detecta as mudanças automaticamente (dirty checking) e faz UPDATE ao final da transação.</li>
     * </ol>
     *
     * @param id   identificador do produto a ser atualizado
     * @param form novos dados validados
     * @return produto atualizado
     * @throws ProdutoNaoEncontradoException se o produto não existir
     */
    @Transactional
    public Produto atualizar(Long id, ProdutoForm form) {
        Produto produto = buscarPorId(id);
        produto.setNome(form.nome());
        produto.setDescricao(form.descricao());
        produto.setPreco(form.preco());
        // Não precisa chamar save() explicitamente — o JPA (dirty checking) detecta a mudança
        // e executa o UPDATE automaticamente ao final da transação
        return produtoRepository.save(produto);
    }

    /**
     * Exclui um produto pelo ID.
     *
     * <p>Verifica se o produto existe antes de excluir, lançando exceção amigável
     * em vez de deixar o banco retornar um erro genérico.
     *
     * @param id identificador do produto a ser excluído
     * @throws ProdutoNaoEncontradoException se o produto não existir
     */
    @Transactional
    public void excluir(Long id) {
        // Verifica existência para dar mensagem de erro clara
        if (!produtoRepository.existsById(id)) {
            throw new ProdutoNaoEncontradoException(id);
        }
        produtoRepository.deleteById(id);
    }
}
