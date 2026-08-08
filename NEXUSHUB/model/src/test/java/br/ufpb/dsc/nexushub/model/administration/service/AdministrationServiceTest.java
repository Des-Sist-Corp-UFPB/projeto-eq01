package br.ufpb.dsc.nexushub.model.administration.service;
import static org.junit.jupiter.api.Assertions.*;import static org.mockito.Mockito.*;
import br.ufpb.dsc.nexushub.model.identity.domain.*;import br.ufpb.dsc.nexushub.model.identity.repository.*;
import java.util.*;import org.junit.jupiter.api.*;
class AdministrationServiceTest{
 UserRepository users=mock(UserRepository.class);RoleRepository roles=mock(RoleRepository.class);AdministrationService service=new AdministrationService(users,roles);
 @Test void listsUsers(){when(users.findAll()).thenReturn(List.of());assertTrue(service.users().isEmpty());}
 @Test void changesStatusAndRole(){UUID id=UUID.randomUUID(),actor=UUID.randomUUID();User user=mock(User.class);Role role=mock(Role.class);when(user.getId()).thenReturn(id);when(users.findById(id)).thenReturn(Optional.of(user));when(users.save(user)).thenReturn(user);when(roles.findByName("ADMIN")).thenReturn(Optional.of(role));assertSame(user,service.active(id,false,actor));assertSame(user,service.role(id,"admin",actor));verify(user).setActive(false,actor);verify(user).changeRole(role,actor);}
 @Test void preventsSelfBlock(){UUID id=UUID.randomUUID();User user=mock(User.class);when(user.getId()).thenReturn(id);when(users.findById(id)).thenReturn(Optional.of(user));assertThrows(IllegalArgumentException.class,()->service.active(id,false,id));}
 @Test void rejectsMissingData(){assertThrows(IllegalArgumentException.class,()->service.active(UUID.randomUUID(),true,UUID.randomUUID()));assertThrows(IllegalArgumentException.class,()->service.role(UUID.randomUUID(),"none",UUID.randomUUID()));}
}
