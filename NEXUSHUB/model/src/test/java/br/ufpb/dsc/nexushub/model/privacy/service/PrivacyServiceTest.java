package br.ufpb.dsc.nexushub.model.privacy.service;
import static org.junit.jupiter.api.Assertions.*;import static org.mockito.Mockito.*;
import br.ufpb.dsc.nexushub.model.identity.domain.*;import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;import br.ufpb.dsc.nexushub.model.people.domain.Human;
import br.ufpb.dsc.nexushub.model.privacy.repository.*;import java.util.*;import org.junit.jupiter.api.*;
class PrivacyServiceTest{
 ConsentRepository consents=mock(ConsentRepository.class);DataSubjectRequestRepository requests=mock(DataSubjectRequestRepository.class);UserRepository users=mock(UserRepository.class);PrivacyService service=new PrivacyService(consents,requests,users);
 @Test void consentRequestAndExport(){UUID id=UUID.randomUUID();User user=mock(User.class);Human human=mock(Human.class);Role role=mock(Role.class);when(users.findById(id)).thenReturn(Optional.of(user));when(user.getId()).thenReturn(id);when(user.getHuman()).thenReturn(human);when(human.getName()).thenReturn("Ana");when(user.getEmail()).thenReturn("a@b.com");when(user.getRole()).thenReturn(role);when(role.getName()).thenReturn("STUDENT");when(consents.save(any())).thenAnswer(i->i.getArgument(0));when(requests.save(any())).thenAnswer(i->i.getArgument(0));assertTrue(service.consent(id,"analytics","1",true).isGranted());assertEquals("EXPORT",service.request(id,"EXPORT").getType());assertEquals("Ana",service.export(id).get("name"));}
 @Test void rejectsMissingUser(){assertThrows(IllegalArgumentException.class,()->service.export(UUID.randomUUID()));}
}
