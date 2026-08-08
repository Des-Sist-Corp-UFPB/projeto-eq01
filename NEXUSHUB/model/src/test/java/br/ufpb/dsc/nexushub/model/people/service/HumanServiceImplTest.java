package br.ufpb.dsc.nexushub.model.people.service;
import static org.junit.jupiter.api.Assertions.*;import static org.mockito.Mockito.*;
import br.ufpb.dsc.nexushub.model.people.domain.*;import br.ufpb.dsc.nexushub.model.people.repository.*;import br.ufpb.dsc.nexushub.model.people.service.impl.HumanServiceImpl;
import java.util.*;import org.junit.jupiter.api.*;
class HumanServiceImplTest{
 HumanRepository humans=mock(HumanRepository.class);InterestRepository interests=mock(InterestRepository.class);HumanInterestRepository links=mock(HumanInterestRepository.class);HumanServiceImpl service=new HumanServiceImpl(humans,interests,links);
 @Test void findsAndUpdates(){UUID id=UUID.randomUUID(),actor=UUID.randomUUID();Human h=mock(Human.class);when(humans.findById(id)).thenReturn(Optional.of(h));when(h.getName()).thenReturn("Ana");when(h.getEmail()).thenReturn("a@b");when(humans.save(h)).thenReturn(h);assertSame(h,service.findById(id).orElseThrow());assertSame(h,service.updateAcademicProfile(id,"bio","curso","2",actor));verify(h).updateProfile("Ana","a@b","bio","curso","2",actor);}
 @Test void addsInterest(){UUID hId=UUID.randomUUID(),iId=UUID.randomUUID();Human h=mock(Human.class);Interest i=mock(Interest.class);when(humans.findById(hId)).thenReturn(Optional.of(h));when(interests.findById(iId)).thenReturn(Optional.of(i));service.addInterest(hId,iId,UUID.randomUUID());verify(links).save(any(HumanInterest.class));}
 @Test void rejectsMissingEntities(){UUID id=UUID.randomUUID();assertThrows(IllegalArgumentException.class,()->service.updateAcademicProfile(id,"","",null,null));assertThrows(IllegalArgumentException.class,()->service.addInterest(id,id,id));when(humans.findById(id)).thenReturn(Optional.of(mock(Human.class)));assertThrows(IllegalArgumentException.class,()->service.addInterest(id,id,id));}
}
