package br.ufpb.dsc.nexushub.controller.payments;

import br.ufpb.dsc.nexushub.model.payments.domain.PaymentOrder;
import br.ufpb.dsc.nexushub.model.payments.service.PaymentGateway;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class MercadoPagoGateway implements PaymentGateway {
 private final RestClient client; private final String token; private final String baseUrl; private final boolean fake;
 public MercadoPagoGateway(RestClient.Builder builder,@Value("${app.payment.access-token:}") String token,
   @Value("${app.payment.base-url:https://api.mercadopago.com}") String baseUrl,
   @Value("${app.payment.fake:true}") boolean fake){
  this.client=builder.baseUrl(baseUrl).build();this.token=token;this.baseUrl=baseUrl;this.fake=fake;
 }
 @Override public GatewayCheckout createCheckout(PaymentOrder order){
  if(fake)return new GatewayCheckout("fake-"+order.getId(),"/api/pagamentos/fake/"+order.getId());
  requireToken();
  Map<String,Object> item=Map.of("title",order.getProduct().getName(),"quantity",1,"unit_price",order.getAmount());
  Map<String,Object> body=new LinkedHashMap<>();body.put("external_reference",order.getId().toString());body.put("items",List.of(item));
  body.put("notification_url",baseUrl+"/api/pagamentos/webhook");
  PreferenceResponse response=client.post().uri("/checkout/preferences")
    .header(HttpHeaders.AUTHORIZATION,"Bearer "+token).header("X-Idempotency-Key",order.getIdempotencyKey())
    .contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(PreferenceResponse.class);
  if(response==null||response.id()==null)throw new IllegalStateException("Resposta invalida do provedor.");
  return new GatewayCheckout(response.id(),response.init_point());
 }
 @Override public GatewayVerification query(String paymentId){
  if(fake){
   String reference=paymentId.startsWith("fake-")?paymentId.substring(5):paymentId;
   return new GatewayVerification(GatewayStatus.PAID,reference);
  }
  requireToken();
  PaymentResponse response=client.get().uri("/v1/payments/{id}",paymentId).header(HttpHeaders.AUTHORIZATION,"Bearer "+token)
    .retrieve().body(PaymentResponse.class);
  if(response==null)throw new IllegalStateException("Pagamento nao encontrado no provedor.");
  GatewayStatus status="approved".equalsIgnoreCase(response.status())?GatewayStatus.PAID:
    ("rejected".equalsIgnoreCase(response.status())||"cancelled".equalsIgnoreCase(response.status())?GatewayStatus.FAILED:GatewayStatus.PENDING);
  return new GatewayVerification(status,response.external_reference());
 }
 private void requireToken(){if(token==null||token.isBlank())throw new IllegalStateException("MERCADO_PAGO_ACCESS_TOKEN nao configurado.");}
 record PreferenceResponse(String id,String init_point){}
 record PaymentResponse(String status,String external_reference){}
}
