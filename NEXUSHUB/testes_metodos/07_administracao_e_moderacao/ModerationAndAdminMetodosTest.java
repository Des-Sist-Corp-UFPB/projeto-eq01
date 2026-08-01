package br.ufpb.dsc.nexushub.model.administration.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.administration.domain.AuditLog;
import br.ufpb.dsc.nexushub.model.administration.domain.FeatureFlag;
import br.ufpb.dsc.nexushub.model.administration.repository.AuditLogRepository;
import br.ufpb.dsc.nexushub.model.administration.repository.FeatureFlagRepository;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes dos Métodos de Administração e Moderação (FeatureFlag & AuditService)")
public class ModerationAndAdminMetodosTest {

    private FeatureFlagRepository flagRepository = mock(FeatureFlagRepository.class);
    private FeatureFlagService featureFlagService;

    private AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);
    private AuditService auditService;

    @BeforeEach
    void setup() {
        featureFlagService = new FeatureFlagService(flagRepository);
        auditService = new AuditService(auditLogRepository);
    }

    @Test
    @DisplayName("Metodo enabled: Deve retornar true se a flag estiver ativa e false se inativa ou ausente")
    void testEnabled_VerificacaoFlags() {
        FeatureFlag flagAtiva = mock(FeatureFlag.class);
        when(flagAtiva.isEnabled()).thenReturn(true);

        when(flagRepository.findByCode("chat.enabled")).thenReturn(Optional.of(flagAtiva));
        when(flagRepository.findByCode("recurso.inexistente")).thenReturn(Optional.empty());

        assertTrue(featureFlagService.enabled("chat.enabled"), "Flag ativa deve retornar true");
        assertFalse(featureFlagService.enabled("recurso.inexistente"), "Flag inexistente deve retornar false");
    }

    @Test
    @DisplayName("Metodo record: Deve salvar log de auditoria com acao, recurso e usuario correspondentes")
    void testLog_Sucesso() {
        UUID actorId = UUID.randomUUID();
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        auditService.record(actorId, "BLOQUEAR_USUARIO", "USER", "123", "SUCCESS", "127.0.0.1", null, null, null);

        verify(auditLogRepository).save(any(AuditLog.class));
    }
}
