package br.ufpb.dsc.nexushub.model.privacy.service;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import br.ufpb.dsc.nexushub.model.privacy.domain.*;
import br.ufpb.dsc.nexushub.model.privacy.repository.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class PrivacyService {
 private final ConsentRepository consents; private final DataSubjectRequestRepository requests; private final UserRepository users;
 public PrivacyService(ConsentRepository consents,DataSubjectRequestRepository requests,UserRepository users){this.consents=consents;this.requests=requests;this.users=users;}
 @Transactional public Consent consent(UUID user,String purpose,String version,boolean granted){requireUser(user);return consents.save(new Consent(user,purpose,version,granted));}
 @Transactional public DataSubjectRequest request(UUID user,String type){requireUser(user);return requests.save(new DataSubjectRequest(user,type));}
 @Transactional(readOnly=true) public Map<String,Object> export(UUID userId){
  User user=requireUser(userId);
  Map<String,Object> data=new LinkedHashMap<>();
  data.put("id",user.getId());data.put("name",user.getHuman().getName());data.put("email",user.getEmail());
  data.put("role",user.getRole().getName());data.put("consents",consents.findByUserIdOrderByCreatedAtDesc(userId));
  data.put("requests",requests.findByUserIdOrderByCreatedAtDesc(userId));
  return data;
 }
 private User requireUser(UUID id){return users.findById(id).orElseThrow(()->new IllegalArgumentException("Usuario nao encontrado."));}
}
