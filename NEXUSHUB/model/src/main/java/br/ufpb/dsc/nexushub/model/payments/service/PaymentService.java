package br.ufpb.dsc.nexushub.model.payments.service;
import br.ufpb.dsc.nexushub.model.administration.service.FeatureFlagService;
import br.ufpb.dsc.nexushub.model.payments.domain.*;
import br.ufpb.dsc.nexushub.model.payments.repository.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class PaymentService {
 private final ProductRepository products;private final PaymentOrderRepository orders;private final PaymentWebhookRepository webhooks;
 private final PaymentGateway gateway;private final FeatureFlagService features;
 public PaymentService(ProductRepository products,PaymentOrderRepository orders,PaymentWebhookRepository webhooks,PaymentGateway gateway,FeatureFlagService features){
  this.products=products;this.orders=orders;this.webhooks=webhooks;this.gateway=gateway;this.features=features;
 }
 @Transactional(readOnly=true) public List<Product> products(){return products.findByActiveTrue();}
 @Transactional(readOnly=true) public List<PaymentOrder> orders(UUID user){return orders.findByUserIdOrderByCreatedAtDesc(user);}
 @Transactional public PaymentOrder checkout(UUID user,UUID productId,String idempotency){
  if(!features.enabled("payment.enabled"))throw new IllegalStateException("Pagamentos desabilitados.");
  if(idempotency==null||idempotency.isBlank())throw new IllegalArgumentException("Chave de idempotencia obrigatoria.");
  Optional<PaymentOrder> existing=orders.findByIdempotencyKey(idempotency);
  if(existing.isPresent())return existing.get();
  Product product=products.findById(productId).orElseThrow(()->new IllegalArgumentException("Produto nao encontrado."));
  PaymentOrder order=orders.save(new PaymentOrder(user,product,idempotency));
  PaymentGateway.GatewayCheckout checkout=gateway.createCheckout(order);
  order.awaiting(checkout.providerId(),checkout.checkoutUrl());
  return orders.save(order);
 }
 @Transactional public boolean processWebhook(String eventId,String paymentId,String payload){
  if(eventId==null||eventId.isBlank())throw new IllegalArgumentException("Evento invalido.");
  if(webhooks.existsByProviderAndEventId("MERCADO_PAGO",eventId))return false;
  PaymentGateway.GatewayVerification verification=gateway.query(paymentId);
  UUID orderId;
  try{orderId=UUID.fromString(verification.externalReference());}catch(Exception e){throw new IllegalArgumentException("Referencia externa invalida.");}
  PaymentOrder order=orders.findById(orderId).orElseThrow(()->new IllegalArgumentException("Pedido nao encontrado."));
  PaymentGateway.GatewayStatus status=verification.status();
  if(status==PaymentGateway.GatewayStatus.PAID)order.paid(); else if(status==PaymentGateway.GatewayStatus.FAILED)order.failed();
  webhooks.save(new PaymentWebhook("MERCADO_PAGO",eventId,orderId,payload));
  orders.save(order);return true;
 }
}
