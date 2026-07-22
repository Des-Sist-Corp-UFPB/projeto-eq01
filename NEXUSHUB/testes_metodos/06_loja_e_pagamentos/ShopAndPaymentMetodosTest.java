package br.ufpb.dsc.nexushub.model.payments.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.administration.service.FeatureFlagService;
import br.ufpb.dsc.nexushub.model.payments.domain.*;
import br.ufpb.dsc.nexushub.model.payments.repository.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes dos Métodos da Loja e Pagamentos (PaymentService)")
public class ShopAndPaymentMetodosTest {

    private ProductRepository products = mock(ProductRepository.class);
    private PaymentOrderRepository orders = mock(PaymentOrderRepository.class);
    private PaymentWebhookRepository webhooks = mock(PaymentWebhookRepository.class);
    private PaymentGateway gateway = mock(PaymentGateway.class);
    private FeatureFlagService features = mock(FeatureFlagService.class);

    private PaymentService paymentService;

    @BeforeEach
    void setup() {
        paymentService = new PaymentService(products, orders, webhooks, gateway, features);
    }

    @Test
    @DisplayName("Metodo checkout: Deve realizar checkout de produto da loja com sucesso quando pagamentos estiverem ativos")
    void testCheckout_Sucesso() {
        UUID userId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        String idempotencyKey = UUID.randomUUID().toString();

        Product product = mock(Product.class);
        when(product.isActive()).thenReturn(true);

        when(features.enabled("payment.enabled")).thenReturn(true);
        when(orders.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(products.findById(productId)).thenReturn(Optional.of(product));
        when(orders.save(any(PaymentOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentGateway.GatewayCheckout checkoutMock = new PaymentGateway.GatewayCheckout("prov_123", "http://checkout.url");
        when(gateway.createCheckout(any())).thenReturn(checkoutMock);

        PaymentOrder order = paymentService.checkout(userId, productId, idempotencyKey);

        assertNotNull(order, "O pedido retornado pelo checkout nao deve ser nulo");
        verify(gateway).createCheckout(any());
        verify(orders, times(2)).save(any());
    }

    @Test
    @DisplayName("Metodo checkout: Deve lancar IllegalStateException quando a feature flag de pagamentos estiver desativada")
    void testCheckout_FeatureFlagDesativada() {
        when(features.enabled("payment.enabled")).thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            paymentService.checkout(UUID.randomUUID(), UUID.randomUUID(), "key-123");
        });

        assertTrue(ex.getMessage().contains("Pagamentos desabilitados"), "Deve informar que os pagamentos estao desabilitados");
    }
}
