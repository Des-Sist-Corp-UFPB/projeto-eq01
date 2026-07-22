package br.ufpb.dsc.nexushub.controller;
import br.ufpb.dsc.nexushub.model.administration.service.AuditService;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import br.ufpb.dsc.nexushub.model.payments.domain.*;
import br.ufpb.dsc.nexushub.model.payments.service.PaymentService;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/pagamentos")
public class PaymentRestController {
 private final PaymentService payments;private final IdentityService identity;private final AuditService audit;private final String webhookSecret;private final boolean fake;
 public PaymentRestController(PaymentService payments,IdentityService identity,AuditService audit,
  @Value("${app.payment.webhook-secret:}")String webhookSecret,@Value("${app.payment.fake:true}")boolean fake){
  this.payments=payments;this.identity=identity;this.audit=audit;this.webhookSecret=webhookSecret;this.fake=fake;
 }
 @GetMapping("/produtos") public List<Product> products(){return payments.products();}
 @GetMapping("/pedidos") public List<PaymentOrder> orders(Principal p){return payments.orders(user(p).getId());}
 @PostMapping("/checkout") public ResponseEntity<PaymentOrder> checkout(@RequestBody Checkout body,@RequestHeader("Idempotency-Key")String key,Principal p,HttpServletRequest req){
  User user=user(p);PaymentOrder order=payments.checkout(user.getId(),body.productId(),key);
  audit.record(user.getId(),"PAYMENT_CREATED","PAYMENT",order.getId().toString(),"SUCCESS",req.getRemoteAddr(),req.getHeader("X-Correlation-ID"),null,"amount="+order.getAmount());
  return ResponseEntity.status(HttpStatus.CREATED).body(order);
 }
 @PostMapping("/webhook") public ResponseEntity<Void> webhook(@RequestParam(name="data.id",required=false)String paymentId,
   @RequestParam(name="id",required=false)String legacyId,@RequestHeader(value="x-request-id",required=false)String requestId,
   @RequestHeader(value="x-signature",required=false)String signature,@RequestBody(required=false)String payload){
  String id=paymentId!=null?paymentId:legacyId;if(id==null)return ResponseEntity.badRequest().build();
  if(!fake&&!validSignature(id,requestId,signature))return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
  payments.processWebhook(requestId==null?id:requestId,id,payload);
  return ResponseEntity.ok().build();
 }
 @PostMapping("/fake/{orderId}") public ResponseEntity<Void> fake(@PathVariable UUID orderId,Principal p,HttpServletRequest req){
  if(!fake)return ResponseEntity.notFound().build();
  payments.processWebhook("fake-event-"+orderId,"fake-"+orderId,"{}");
  User user=user(p);audit.record(user.getId(),"PAYMENT_COMPLETED","PAYMENT",orderId.toString(),"SUCCESS",req.getRemoteAddr(),req.getHeader("X-Correlation-ID"),null,"status=PAID");
  return ResponseEntity.noContent().build();
 }
 boolean validSignature(String dataId,String requestId,String signature){
  if(webhookSecret.isBlank()||signature==null||requestId==null)return false;
  Map<String,String> parts=new HashMap<>();for(String part:signature.split(",")){String[] kv=part.split("=",2);if(kv.length==2)parts.put(kv[0].trim(),kv[1].trim());}
  String ts=parts.get("ts"),v1=parts.get("v1");if(ts==null||v1==null)return false;
  try{
   String manifest="id:"+dataId.toLowerCase()+";request-id:"+requestId+";ts:"+ts+";";
   Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
   String expected=HexFormat.of().formatHex(mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8)));
   return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),v1.getBytes(StandardCharsets.UTF_8));
  }catch(GeneralSecurityException e){throw new IllegalStateException("Falha ao validar webhook.",e);}
 }
 private User user(Principal p){return identity.findByEmail(p.getName());}
 public record Checkout(UUID productId){}
}
