package br.ufpb.dsc.nexushub.controller;
import br.ufpb.dsc.nexushub.model.administration.service.*;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.privacy.domain.*;
import br.ufpb.dsc.nexushub.model.privacy.service.PrivacyService;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/lgpd")
public class PrivacyRestController {
 private final PrivacyService privacy;private final IdentityService identity;private final AuditService audit;private final FeatureFlagService features;
 public PrivacyRestController(PrivacyService privacy,IdentityService identity,AuditService audit,FeatureFlagService features){this.privacy=privacy;this.identity=identity;this.audit=audit;this.features=features;}
 @PostMapping("/consentimentos") public Consent consent(@RequestBody ConsentBody body,Principal p,HttpServletRequest req){
  User user=user(p);Consent c=privacy.consent(user.getId(),body.purpose(),body.version(),body.granted());log(user,"CONSENT",c.getId().toString(),req);return c;
 }
 @PostMapping("/solicitacoes") public DataSubjectRequest request(@RequestBody PrivacyRequestBody body,Principal p,HttpServletRequest req){
  User user=user(p);DataSubjectRequest r=privacy.request(user.getId(),body.type());log(user,"LGPD_REQUEST",r.getId().toString(),req);return r;
 }
 @GetMapping("/meus-dados") public Map<String,Object> export(Principal p,HttpServletRequest req){
  if(!features.enabled("lgpd.export.enabled"))throw new IllegalStateException("Exportacao desabilitada.");
  User user=user(p);Map<String,Object> data=privacy.export(user.getId());log(user,"DATA_EXPORT",user.getId().toString(),req);return data;
 }
 private User user(Principal p){return identity.findByEmail(p.getName());}
 private void log(User u,String action,String id,HttpServletRequest req){audit.record(u.getId(),action,"LGPD",id,"SUCCESS",req.getRemoteAddr(),req.getHeader("X-Correlation-ID"),null,null);}
 public record ConsentBody(String purpose,String version,boolean granted){} public record PrivacyRequestBody(String type){}
}
