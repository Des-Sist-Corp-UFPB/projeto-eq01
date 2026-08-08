package br.ufpb.dsc.nexushub.model.payments.service;
import br.ufpb.dsc.nexushub.model.payments.domain.PaymentOrder;
public interface PaymentGateway {
 GatewayCheckout createCheckout(PaymentOrder order);
 GatewayVerification query(String paymentId);
 record GatewayCheckout(String providerId,String checkoutUrl){}
 record GatewayVerification(GatewayStatus status,String externalReference){}
 enum GatewayStatus {PENDING,PAID,FAILED}
}
