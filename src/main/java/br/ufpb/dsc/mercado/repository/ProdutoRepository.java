package br.ufpb.dsc.mercado.repository;

import br.ufpb.dsc.mercado.domain.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório Spring Data JPA para a entidade {@link Produto}.
 *
 * <p><strong>O que é Spring Data JPA?</strong><br>
 * Spring Data JPA elimina a necessidade de escrever implementações de repositório manualmente.
 * Ao estender {@code JpaRepository}, você ganha automaticamente os métodos CRUD mais comuns:
 * <ul>
 *   <li>{@code save(entity)} — INSERT ou UPDATE (decide pelo ID)</li>
 *   <li>{@code findById(id)} — SELECT por PK</li>
 *   <li>{@code findAll()} — SELECT * (com suporte a paginação)</li>
 *   <li>{@code deleteById(id)} — DELETE por PK</li>
 *   <li>{@code count()} — COUNT(*)</li>
 *   <li>e muitos outros...</li>
 * </ul>
 *
 * <p><strong>Query Methods (Derived Queries):</strong><br>
 * O Spring Data JPA consegue criar queries SQL automaticamente a partir do nome do método.
 * Ele analisa palavras-chave como {@code findBy}, {@code Containing}, {@code IgnoreCase}
 * e gera o JPQL equivalente em tempo de inicialização.
 *
 * <p><strong>Paginação com {@code Pageable}:</strong><br>
 * O parâmetro {@code Pageable} permite passar número de página, tamanho e ordenação.
 * O retorno {@code Page<T>} inclui os dados da página atual e metadados (total de elementos,
 * total de páginas, etc.).
 *
 * <p>Exemplo de uso:
 * <pre>
 *   Pageable pageable = PageRequest.of(0, 10, Sort.by("nome"));
 *   Page&lt;Produto&gt; pagina = repository.findByNomeContainingIgnoreCase("arroz", pageable);
 * </pre>
 *
 * @author DSC - UFPB Campus IV
 * @see JpaRepository
 * @see org.springframework.data.domain.Pageable
 */
@Repository // Opcional quando se estende JpaRepository, mas documenta a intenção
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    /**
     * Busca produtos cujo nome contenha o texto informado, sem distinção de maiúsculas/minúsculas.
     *
     * <p>O Spring Data JPA traduz este método para a query JPQL:
     * <pre>
     *   SELECT p FROM Produto p WHERE LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%'))
     * </pre>
     *
     * <p>Palavras-chave do método:
     * <ul>
     *   <li>{@code findBy} — início de uma query de busca</li>
     *   <li>{@code Nome} — campo da entidade a ser filtrado</li>
     *   <li>{@code Containing} — equivale ao operador SQL LIKE %valor%</li>
     *   <li>{@code IgnoreCase} — ignora diferença entre maiúsculas e minúsculas</li>
     * </ul>
     *
     * @param nome     texto a ser buscado no nome do produto
     * @param pageable configuração de paginação e ordenação
     * @return página de produtos que correspondem ao critério de busca
     */
    Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}
