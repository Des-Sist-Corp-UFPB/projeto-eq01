package br.ufpb.dsc.mercado.controller;

import br.ufpb.dsc.mercado.domain.Produto;
import br.ufpb.dsc.mercado.dto.ProdutoForm;
import br.ufpb.dsc.mercado.exception.ProdutoNaoEncontradoException;
import br.ufpb.dsc.mercado.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Controller responsável pelo CRUD de produtos.
 *
 * <p><strong>Padrão HTMX + Thymeleaf:</strong><br>
 * HTMX permite fazer requisições AJAX sem escrever JavaScript, substituindo apenas
 * fragmentos específicos do DOM em vez de recarregar a página inteira.
 * O padrão utilizado neste controller é:
 * <ul>
 *   <li>Requisição normal (navegador) → retorna a página HTML completa</li>
 *   <li>Requisição HTMX (header {@code HX-Request: true}) → retorna apenas o fragmento necessário</li>
 * </ul>
 *
 * <p><strong>Fragmentos Thymeleaf:</strong><br>
 * Um fragmento é uma parte de um template HTML identificada por {@code th:fragment="nome"}.
 * Para retornar um fragmento, use a notação: {@code "caminho/arquivo :: nomeDoFragmento"}
 *
 * <p><strong>{@code @Controller} vs {@code @RestController}:</strong><br>
 * {@code @Controller} retorna nomes de views (templates Thymeleaf).
 * {@code @RestController} retorna dados serializados (JSON/XML) diretamente.
 * Como estamos usando templates, usamos {@code @Controller}.
 *
 * @author DSC - UFPB Campus IV
 */
@Controller
@RequestMapping("/produtos")
public class ProdutoController {

    private static final int TAMANHO_PAGINA = 10;

    // Header enviado pelo HTMX em toda requisição feita pela biblioteca
    private static final String HEADER_HTMX = "HX-Request";

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    // =========================================================================
    // LISTAGEM
    // =========================================================================

    /**
     * Exibe a página principal com a lista de produtos.
     *
     * <p>Verifica o header {@code HX-Request} para decidir se retorna a página
     * completa (primeira carga) ou apenas o fragmento da tabela (atualização via HTMX).
     *
     * @param busca   texto de busca opcional (vindo do campo de pesquisa)
     * @param pagina  número da página (começa em 0)
     * @param htmx    header HTMX — presente quando a requisição vem do HTMX
     * @param model   modelo do Thymeleaf com dados para o template
     * @return nome do template ou fragmento a ser renderizado
     */
    @GetMapping
    public String listar(
            @RequestParam(name = "busca", required = false, defaultValue = "") String busca,
            @RequestParam(name = "pagina", defaultValue = "0") int pagina,
            @RequestHeader(value = HEADER_HTMX, required = false) String htmx,
            Model model) {

        // Cria configuração de paginação: página atual, tamanho e ordenação por nome
        PageRequest pageRequest = PageRequest.of(pagina, TAMANHO_PAGINA, Sort.by("nome").ascending());
        Page<Produto> produtos = produtoService.buscar(busca, pageRequest);

        model.addAttribute("produtos", produtos);
        model.addAttribute("busca", busca);
        model.addAttribute("paginaAtual", pagina);

        // Se for requisição HTMX, retorna apenas o fragmento da tabela (mais eficiente)
        // O HTMX substitui apenas o elemento alvo, sem recarregar toda a página
        if (htmx != null) {
            return "produtos/fragments/tabela :: tabela";
        }

        // Requisição normal do navegador → página completa
        return "produtos/lista";
    }

    /**
     * Endpoint dedicado para o HTMX atualizar apenas o fragmento da tabela.
     * Útil para o campo de busca com {@code hx-trigger="keyup changed delay:400ms"}.
     *
     * @param busca  texto de busca
     * @param pagina número da página
     * @param model  modelo Thymeleaf
     * @return fragmento da tabela
     */
    @GetMapping("/fragmento-tabela")
    public String fragmentoTabela(
            @RequestParam(name = "busca", required = false, defaultValue = "") String busca,
            @RequestParam(name = "pagina", defaultValue = "0") int pagina,
            Model model) {

        PageRequest pageRequest = PageRequest.of(pagina, TAMANHO_PAGINA, Sort.by("nome").ascending());
        Page<Produto> produtos = produtoService.buscar(busca, pageRequest);

        model.addAttribute("produtos", produtos);
        model.addAttribute("busca", busca);
        model.addAttribute("paginaAtual", pagina);

        // Sempre retorna apenas o fragmento (este endpoint é exclusivo do HTMX)
        return "produtos/fragments/tabela :: tabela";
    }

    // =========================================================================
    // FORMULÁRIO (NOVO / EDITAR)
    // =========================================================================

    /**
     * Retorna o fragmento do formulário para criar um novo produto.
     *
     * <p>Chamado pelo HTMX quando o usuário clica em "Novo Produto":
     * <pre>
     *   hx-get="/produtos/novo" hx-target="#modal-container"
     * </pre>
     *
     * @param model modelo Thymeleaf
     * @return fragmento do formulário vazio
     */
    @GetMapping("/novo")
    public String novoForm(Model model) {
        // Passa um form vazio para o Thymeleaf vincular com th:object
        model.addAttribute("form", new ProdutoForm(null, null, null));
        model.addAttribute("produto", null); // sem produto = modo criação
        return "produtos/fragments/form :: modal";
    }

    /**
     * Retorna o fragmento do formulário preenchido com os dados do produto para edição.
     *
     * <p>Chamado pelo HTMX quando o usuário clica em "Editar":
     * <pre>
     *   hx-get="/produtos/{id}/editar" hx-target="#modal-container"
     * </pre>
     *
     * @param id    ID do produto a editar
     * @param model modelo Thymeleaf
     * @return fragmento do formulário preenchido
     */
    @GetMapping("/{id}/editar")
    public String editarForm(@PathVariable Long id, Model model) {
        Produto produto = produtoService.buscarPorId(id);
        // Converte entidade para form (preenche os campos do formulário)
        ProdutoForm form = new ProdutoForm(produto.getNome(), produto.getDescricao(), produto.getPreco());
        model.addAttribute("form", form);
        model.addAttribute("produto", produto); // com produto = modo edição
        return "produtos/fragments/form :: modal";
    }

    // =========================================================================
    // CRIAÇÃO
    // =========================================================================

    /**
     * Processa o formulário de criação de produto via HTMX.
     *
     * <p>{@code @Valid} ativa a validação Bean Validation no objeto {@code form}.
     * {@code BindingResult} captura os erros de validação (deve vir imediatamente após o objeto validado).
     *
     * <p>Fluxo HTMX esperado no formulário:
     * <pre>
     *   hx-post="/produtos"
     *   hx-target="#lista-produtos"
     *   hx-swap="beforeend"
     * </pre>
     * Isso adiciona a nova linha ao final da tabela sem recarregar.
     *
     * @param form          dados do formulário (validados automaticamente pelo Spring)
     * @param bindingResult resultado da validação
     * @param model         modelo Thymeleaf
     * @return fragmento da nova linha da tabela ou fragmento do form com erros
     */
    @PostMapping
    public String criar(
            @Valid @ModelAttribute("form") ProdutoForm form,
            BindingResult bindingResult,
            Model model) {

        // Se houver erros de validação, retorna o formulário com as mensagens de erro
        if (bindingResult.hasErrors()) {
            model.addAttribute("produto", null);
            return "produtos/fragments/form :: modal";
        }

        Produto novoProduto = produtoService.criar(form);
        model.addAttribute("produto", novoProduto);

        // Retorna apenas a linha da tabela para ser inserida via HTMX (hx-swap="beforeend")
        return "produtos/fragments/linha :: linha";
    }

    // =========================================================================
    // ATUALIZAÇÃO
    // =========================================================================

    /**
     * Processa o formulário de edição de produto via HTMX.
     *
     * <p>Fluxo HTMX esperado:
     * <pre>
     *   hx-put="/produtos/{id}"
     *   hx-target="#produto-{id}"
     *   hx-swap="outerHTML"
     * </pre>
     * Isso substitui a linha existente pela linha atualizada.
     *
     * @param id            ID do produto a atualizar
     * @param form          dados do formulário
     * @param bindingResult resultado da validação
     * @param model         modelo Thymeleaf
     * @return fragmento da linha atualizada ou fragmento do form com erros
     */
    @PutMapping("/{id}")
    public String atualizar(
            @PathVariable Long id,
            @Valid @ModelAttribute("form") ProdutoForm form,
            BindingResult bindingResult,
            Model model) {

        if (bindingResult.hasErrors()) {
            // Recarrega o produto para o formulário saber que está em modo edição
            Produto produto = produtoService.buscarPorId(id);
            model.addAttribute("produto", produto);
            return "produtos/fragments/form :: modal";
        }

        Produto produtoAtualizado = produtoService.atualizar(id, form);
        model.addAttribute("produto", produtoAtualizado);

        // Retorna a linha atualizada para substituir a linha antiga (hx-swap="outerHTML")
        return "produtos/fragments/linha :: linha";
    }

    // =========================================================================
    // EXCLUSÃO
    // =========================================================================

    /**
     * Exclui um produto via HTMX.
     *
     * <p>O HTMX com {@code hx-swap="outerHTML"} e um body vazio remove o elemento do DOM.
     * Fluxo esperado no template:
     * <pre>
     *   hx-delete="/produtos/{id}"
     *   hx-target="#produto-{id}"
     *   hx-swap="outerHTML"
     *   hx-confirm="Confirma exclusão?"
     * </pre>
     *
     * <p>Retornamos {@code ResponseEntity} aqui porque precisamos controlar o status HTTP
     * e retornar um body vazio (para o HTMX remover o elemento do DOM).
     *
     * @param id ID do produto a excluir
     * @return 200 OK com body vazio (HTMX remove o elemento) ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            produtoService.excluir(id);
            // 200 OK com body vazio → HTMX substitui o elemento por nada (remove da tela)
            return ResponseEntity.ok().build();
        } catch (ProdutoNaoEncontradoException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
