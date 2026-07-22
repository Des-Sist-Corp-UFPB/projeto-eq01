package br.ufpb.dsc.nexushub.model.administration.service;
import br.ufpb.dsc.nexushub.model.identity.domain.*;
import br.ufpb.dsc.nexushub.model.identity.repository.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AdministrationService {
 private final UserRepository users;private final RoleRepository roles;
 public AdministrationService(UserRepository users,RoleRepository roles){this.users=users;this.roles=roles;}
 @Transactional(readOnly=true) public List<User> users(){return users.findAll();}
 @Transactional public User active(UUID id,boolean active,UUID actor){
  User user=find(id);if(user.getId().equals(actor)&&!active)throw new IllegalArgumentException("Administrador nao pode bloquear a si mesmo.");
  user.setActive(active,actor);return users.save(user);
 }
 @Transactional public User role(UUID id,String roleName,UUID actor){
  Role role=roles.findByName(roleName.toUpperCase()).orElseThrow(()->new IllegalArgumentException("Papel inexistente."));
  User user=find(id);user.changeRole(role,actor);return users.save(user);
 }
 private User find(UUID id){return users.findById(id).orElseThrow(()->new IllegalArgumentException("Usuario nao encontrado."));}
}
