package br.ufpb.dsc.nexushub.controller;
import br.ufpb.dsc.nexushub.model.administration.domain.*;
import br.ufpb.dsc.nexushub.model.administration.service.*;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin")
public class AdminRestController {
 private final AdministrationService admin;private final AuditService audits;private final FeatureFlagService features;private final IdentityService identity;
 public AdminRestController(AdministrationService admin,AuditService audits,FeatureFlagService features,IdentityService identity){this.admin=admin;this.audits=audits;this.features=features;this.identity=identity;}
 @GetMapping("/usuarios") public List<UsuarioResponse> users(){return admin.users().stream().map(UsuarioResponse::from).toList();}
 @PatchMapping("/usuarios/{id}/ativo") public UsuarioResponse active(@PathVariable UUID id,@RequestBody Enabled body,Principal principal,HttpServletRequest req){
  User actor=actor(principal);User changed=admin.active(id,body.enabled(),actor.getId());audit(actor,"USER_STATUS",id,req,String.valueOf(body.enabled()));return UsuarioResponse.from(changed);
 }
 @PatchMapping("/usuarios/{id}/papel") public UsuarioResponse role(@PathVariable UUID id,@RequestBody RoleBody body,Principal principal,HttpServletRequest req){
  User actor=actor(principal);
  if (!"ADMIN".equals(actor.getRole().getName()) && !"SYSADMIN".equals(actor.getRole().getName())) {
      throw new org.springframework.security.access.AccessDeniedException("Apenas administradores podem alterar o cargo.");
  }
  User changed=admin.role(id,body.role(),actor.getId());audit(actor,"USER_ROLE",id,req,body.role());return UsuarioResponse.from(changed);
 }
 @GetMapping("/auditoria") public Page<AuditLog> audit(@RequestParam(required=false)String action,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){
  return audits.list(action,PageRequest.of(page,Math.min(size,100),Sort.by(Sort.Direction.DESC,"createdAt")));
 }
 @GetMapping("/features") public List<FeatureFlag> features(){return features.list();}
 @PatchMapping("/features/{code}") public FeatureFlag feature(@PathVariable String code,@RequestBody Enabled body,Principal principal,HttpServletRequest req){
  FeatureFlag flag=features.update(code,body.enabled());audit(actor(principal),"FEATURE_UPDATE",flag.getId(),req,code+"="+body.enabled());return flag;
 }
 private User actor(Principal p){return identity.findByEmail(p.getName());}
 private void audit(User actor,String action,UUID id,HttpServletRequest req,String after){audits.record(actor.getId(),action,"ADMIN",id.toString(),"SUCCESS",req.getRemoteAddr(),req.getHeader("X-Correlation-ID"),null,after);}
 public record Enabled(boolean enabled){} public record RoleBody(String role){}
}
