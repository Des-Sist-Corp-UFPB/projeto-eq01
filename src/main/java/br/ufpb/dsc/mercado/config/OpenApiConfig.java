package br.ufpb.dsc.mercado.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI mercadoOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Mercado DSC API")
                        .description("API para cadastro, login e gerenciamento de perfil de usuarios.")
                        .version("v1"));
    }
}
