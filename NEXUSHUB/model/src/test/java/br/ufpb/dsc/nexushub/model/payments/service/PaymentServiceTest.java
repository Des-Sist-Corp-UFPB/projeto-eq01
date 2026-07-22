package br.ufpb.dsc.nexushub.model.payments.service;
import static org.junit.jupiter.api.Assertions.*;import static org.mockito.Mockito.*;
import br.ufpb.dsc.nexushub.model.administration.service.FeatureFlagService;import br.ufpb.dsc.nexushub.model.payments.domain.*;import br.ufpb.dsc.nexushub.model.payments.repository.*;
import java.math.BigDecimal;import java.util.*;import org.junit.jupiter.api.*;
class PaymentServiceTest{
 ProductRepository products=mock(ProductRepository.class);PaymentOrderRepository orders=mock(PaymentOrderRepository.class);PaymentWebhookRepository webhooks=mock(PaymentWebhookRepository.class);PaymentGateway gateway=mock(PaymentGateway.class);FeatureFlagService features=mock(FeatureFlagService.class);
 PaymentService service=new PaymentService(products,orders,webhooks,gateway,features);
 @BeforeEach void setup(){when(orders.save(any())).thenAnswer(i->i.getArgument(0));when(webhooks.save(any())).thenAnswer(i->i.getArgument(0));}
 @Test void listsProductsAndOrders(){UUID user=UUID.randomUUID();when(products.findByActiveTrue()).thenReturn(List.of());when(orders.findByUserIdOrderByCreatedAtDesc(user)).thenReturn(List.of());assertTrue(service.products().isEmpty());assertTrue(service.orders(user).isEmpty());}
 @Test void createsCheckoutAndReusesIdempotency(){
  UUID user=UUID.randomUUID(),productId=UUID.randomUUID();Product product=mock(Product.class);when(product.isActive()).thenReturn(true);when(product.getPrice()).thenReturn(BigDecimal.TEN);when(features.enabled("payment.enabled")).thenReturn(true);when(products.findById(productId)).thenReturn(Optional.of(product));when(gateway.createCheckout(any())).thenReturn(new PaymentGateway.GatewayCheckout("p","https://checkout"));when(orders.findByIdempotencyKey("key")).thenReturn(Optional.empty());
  PaymentOrder created=service.checkout(user,productId,"key");assertEquals("PENDING",created.getStatus());
  when(orders.findByIdempotencyKey("key")).thenReturn(Optional.of(created));assertSame(created,service.checkout(user,productId,"key"));
 }
 @Test void validatesCheckout(){when(features.enabled("payment.enabled")).thenReturn(false);assertThrows(IllegalStateException.class,()->service.checkout(UUID.randomUUID(),UUID.randomUUID(),"k"));when(features.enabled("payment.enabled")).thenReturn(true);assertThrows(IllegalArgumentException.class,()->service.checkout(UUID.randomUUID(),UUID.randomUUID(),""));assertThrows(IllegalArgumentException.class,()->service.checkout(UUID.randomUUID(),UUID.randomUUID(),"k"));}
 @Test void processesPaidFailedPendingAndDuplicate(){
  UUID id=UUID.randomUUID();PaymentOrder paid=mock(PaymentOrder.class);when(orders.findById(id)).thenReturn(Optional.of(paid));when(gateway.query("pay")).thenReturn(new PaymentGateway.GatewayVerification(PaymentGateway.GatewayStatus.PAID,id.toString()));assertTrue(service.processWebhook("e1","pay","{}"));verify(paid).paid();
  PaymentOrder failed=mock(PaymentOrder.class);when(orders.findById(id)).thenReturn(Optional.of(failed));when(gateway.query("fail")).thenReturn(new PaymentGateway.GatewayVerification(PaymentGateway.GatewayStatus.FAILED,id.toString()));assertTrue(service.processWebhook("e2","fail","{}"));verify(failed).failed();
  when(webhooks.existsByProviderAndEventId("MERCADO_PAGO","dup")).thenReturn(true);assertFalse(service.processWebhook("dup","x","{}"));
 }
 @Test void rejectsBadWebhook(){assertThrows(IllegalArgumentException.class,()->service.processWebhook("","x","{}"));when(gateway.query("x")).thenReturn(new PaymentGateway.GatewayVerification(PaymentGateway.GatewayStatus.PAID,"bad"));assertThrows(IllegalArgumentException.class,()->service.processWebhook("e","x","{}"));}
}
