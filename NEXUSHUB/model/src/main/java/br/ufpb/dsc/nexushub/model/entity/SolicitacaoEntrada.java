package br.ufpb.dsc.nexushub.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
public class SolicitacaoEntrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Long projetoId;

    @NotBlank
    private String projetoNome;

    @NotBlank
    private String usuarioEmail;

    @NotBlank
    private String usuarioNome;

    @NotBlank
    @Column(length = 1000)
    private String motivo;

    @NotBlank
    private String status; // PENDENTE, APROVADO, REJEITADO

    private LocalDateTime criadoEm;

    protected SolicitacaoEntrada() {
    }

    public SolicitacaoEntrada(Long projetoId, String projetoNome, String usuarioEmail, String usuarioNome, String motivo) {
        this.projetoId = projetoId;
        this.projetoNome = projetoNome;
        this.usuarioEmail = usuarioEmail;
        this.usuarioNome = usuarioNome;
        this.motivo = motivo;
    }

    @PrePersist
    void prePersist() {
        this.status = this.status == null ? "PENDENTE" : this.status;
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getProjetoId() {
        return projetoId;
    }

    public String getProjetoNome() {
        return projetoNome;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public String getMotivo() {
        return motivo;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
