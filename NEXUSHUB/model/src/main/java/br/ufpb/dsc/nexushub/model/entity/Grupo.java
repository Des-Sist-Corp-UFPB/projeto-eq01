package br.ufpb.dsc.nexushub.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;

    @NotBlank
    private String descricao;

    private String area;
    private String responsavel;
    private String tipo;
    private String cor;
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String logo;

    protected Grupo() {
    }

    public Grupo(String nome, String descricao, String area, String responsavel) {
        this.nome = nome;
        this.descricao = descricao;
        this.area = area;
        this.responsavel = responsavel;
        this.tipo = "Aberto";
        this.cor = "#1e3a8a";
        this.logo = "🏫";
    }

    public Grupo(String nome, String descricao, String area, String responsavel, String tipo, String cor, String logo) {
        this.nome = nome;
        this.descricao = descricao;
        this.area = area;
        this.responsavel = responsavel;
        this.tipo = tipo;
        this.cor = cor;
        this.logo = logo;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getArea() {
        return area;
    }

    public String getResponsavel() {
        return responsavel;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }
}
