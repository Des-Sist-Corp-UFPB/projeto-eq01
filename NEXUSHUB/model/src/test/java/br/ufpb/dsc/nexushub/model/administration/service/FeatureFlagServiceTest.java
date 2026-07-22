package br.ufpb.dsc.nexushub.model.administration.service;
import static org.junit.jupiter.api.Assertions.*;import static org.mockito.Mockito.*;
import br.ufpb.dsc.nexushub.model.administration.domain.FeatureFlag;
import br.ufpb.dsc.nexushub.model.administration.repository.FeatureFlagRepository;
import java.util.*;import org.junit.jupiter.api.*;
class FeatureFlagServiceTest{
 FeatureFlagRepository repository=mock(FeatureFlagRepository.class);FeatureFlagService service=new FeatureFlagService(repository);
 @Test void readsKnownAndUnknownFlags(){when(repository.findByCode("on")).thenReturn(Optional.of(new FeatureFlag("on",true,"x")));assertTrue(service.enabled("on"));assertFalse(service.enabled("off"));}
 @Test void listsFlags(){when(repository.findAll()).thenReturn(List.of(new FeatureFlag("a",false,"a")));assertEquals(1,service.list().size());}
 @Test void updatesFlag(){FeatureFlag flag=new FeatureFlag("a",false,"a");when(repository.findByCode("a")).thenReturn(Optional.of(flag));when(repository.save(flag)).thenReturn(flag);assertTrue(service.update("a",true).isEnabled());}
 @Test void rejectsUnknownUpdate(){assertThrows(IllegalArgumentException.class,()->service.update("x",true));}
}
