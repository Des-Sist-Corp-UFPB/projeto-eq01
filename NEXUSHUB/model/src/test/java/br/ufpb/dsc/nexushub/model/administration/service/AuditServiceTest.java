package br.ufpb.dsc.nexushub.model.administration.service;
import static org.junit.jupiter.api.Assertions.*;import static org.mockito.Mockito.*;
import br.ufpb.dsc.nexushub.model.administration.domain.AuditLog;import br.ufpb.dsc.nexushub.model.administration.repository.AuditLogRepository;
import java.util.UUID;import org.junit.jupiter.api.*;import org.springframework.data.domain.*;
class AuditServiceTest{
 AuditLogRepository repository=mock(AuditLogRepository.class);AuditService service=new AuditService(repository);
 @Test void recordsSanitizedAudit(){when(repository.save(any())).thenAnswer(i->i.getArgument(0));AuditLog log=service.record(UUID.randomUUID(),"LOGIN","USER","1","SUCCESS","ip","c",null,"senha=secret");assertEquals("senha=[REDACTED]",log.getAfterValue());}
 @Test void listsAllOrFiltered(){Pageable p=PageRequest.of(0,10);when(repository.findAll(p)).thenReturn(Page.empty());when(repository.findByActionContainingIgnoreCase("log",p)).thenReturn(Page.empty());assertTrue(service.list(null,p).isEmpty());assertTrue(service.list("log",p).isEmpty());}
}
