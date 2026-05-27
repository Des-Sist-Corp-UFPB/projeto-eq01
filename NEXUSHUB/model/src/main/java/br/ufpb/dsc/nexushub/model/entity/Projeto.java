package br.ufpb.dsc.nexushub.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;

    @NotBlank
    @Column(length = 1000)
    private String resumo;

    @Column(length = 2000)
    private String objetivos;

    private String categoria;
    private String tipo; // Interno, Pesquisa, Extensão, Empresa, Outros
    private String tags; // Comma-separated tags
    private String visibilidade; // Publico, Publico e Aberto, Privado
    private String grupoPertencente;
    private String autor;
    private Integer curtidas;
    private Integer quantidadeMembros;
    private String imagemCardUrl;
    private String imagemLandingUrl;
    private Integer xpDistribuido;
    private String status;
    private Integer pontos;
    private LocalDateTime criadoEm;

    protected Projeto() {
    }

    public Projeto(String nome, String resumo, String objetivos, String categoria, String tipo, 
                   String tags, String visibilidade, String grupoPertencente, String autor, 
                   Integer curtidas, Integer quantidadeMembros, String imagemCardUrl, 
                   String imagemLandingUrl, Integer xpDistribuido) {
        this.nome = nome;
        this.resumo = resumo;
        this.objetivos = objetivos;
        this.categoria = categoria;
        this.tipo = tipo;
        this.tags = tags;
        this.visibilidade = visibilidade;
        this.grupoPertencente = grupoPertencente;
        this.autor = autor;
        this.curtidas = curtidas;
        this.quantidadeMembros = quantidadeMembros;
        this.imagemCardUrl = imagemCardUrl;
        this.imagemLandingUrl = imagemLandingUrl;
        this.xpDistribuido = xpDistribuido;
    }

    @PrePersist
    void prePersist() {
        this.status = this.status == null ? "ABERTO" : this.status;
        this.pontos = this.pontos == null ? 0 : this.pontos;
        this.curtidas = this.curtidas == null ? 0 : this.curtidas;
        this.quantidadeMembros = this.quantidadeMembros == null ? 1 : this.quantidadeMembros;
        this.xpDistribuido = this.xpDistribuido == null ? 0 : this.xpDistribuido;
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getResumo() {
        return resumo;
    }

    public String getObjetivos() {
        return objetivos;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getTipo() {
        return tipo;
    }

    public String getTags() {
        return tags;
    }

    public String getVisibilidade() {
        return visibilidade;
    }

    public String getGrupoPertencente() {
        return grupoPertencente;
    }

    public String getAutor() {
        return autor;
    }

    public Integer getCurtidas() {
        return curtidas;
    }

    public Integer getQuantidadeMembros() {
        return quantidadeMembros;
    }

    public String getImagemCardUrl() {
        return imagemCardUrl;
    }

    public String getImagemLandingUrl() {
        return imagemLandingUrl;
    }

    public Integer getXpDistribuido() {
        return xpDistribuido;
    }

    public String getStatus() {
        return status;
    }

    public Integer getPontos() {
        return pontos;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setResumo(String resumo) {
        this.resumo = resumo;
    }

    public void setObjetivos(String objetivos) {
        this.objetivos = objetivos;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public void setVisibilidade(String visibilidade) {
        this.visibilidade = visibilidade;
    }

    public void setGrupoPertencente(String grupoPertencente) {
        this.grupoPertencente = grupoPertencente;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public void setCurtidas(Integer curtidas) {
        this.curtidas = curtidas;
    }

    public void setQuantidadeMembros(Integer quantidadeMembros) {
        this.quantidadeMembros = quantidadeMembros;
    }

    public void setImagemCardUrl(String imagemCardUrl) {
        this.imagemCardUrl = imagemCardUrl;
    }

    public void setImagemLandingUrl(String imagemLandingUrl) {
        this.imagemLandingUrl = imagemLandingUrl;
    }

    public void setXpDistribuido(Integer xpDistribuido) {
        this.xpDistribuido = xpDistribuido;
    }
}
