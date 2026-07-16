package br.ufpb.dsc.nexushub.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.ufpb.dsc.nexushub.model.identity.domain.Role;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import java.security.Principal;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

class MonitoringRestControllerTest {

    @Mock
    private IdentityService identityService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private MonitoringRestController controller;

    private User mockAdminUser;
    private User mockNormalUser;
    private Principal mockPrincipal;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        mockAdminUser = mock(User.class);
        Role adminRole = mock(Role.class);
        when(adminRole.getName()).thenReturn("ADMIN");
        when(mockAdminUser.getRole()).thenReturn(adminRole);

        mockNormalUser = mock(User.class);
        Role userRole = mock(Role.class);
        when(userRole.getName()).thenReturn("USER");
        when(mockNormalUser.getRole()).thenReturn(userRole);

        mockPrincipal = mock(Principal.class);
        when(mockPrincipal.getName()).thenReturn("test@email.com");
    }

    @Test
    void testGetMetricsAsAdminSuccess() {
        when(identityService.findByEmail("test@email.com")).thenReturn(mockAdminUser);
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenReturn(1);

        ResponseEntity<?> response = controller.getSystemMetrics(mockPrincipal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertTrue(body.containsKey("database"));
        assertTrue(body.containsKey("jvm"));
    }

    @Test
    void testGetMetricsAsNormalUserForbidden() {
        when(identityService.findByEmail("test@email.com")).thenReturn(mockNormalUser);

        ResponseEntity<?> response = controller.getSystemMetrics(mockPrincipal);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void testGetMetricsUnauthorized() {
        ResponseEntity<?> response = controller.getSystemMetrics(null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
