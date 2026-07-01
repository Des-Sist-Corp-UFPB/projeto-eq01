package br.ufpb.dsc.nexushub.controller.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Encaminha acessos diretos às rotas do Angular para o shell da aplicação.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String route : new String[] {
                "/login", "/cadastro", "/esqueci-senha", "/perfil",
                "/grupos", "/loja", "/admin", "/privacidade"
        }) {
            registry.addViewController(route).setViewName("forward:/index.html");
        }
        registry.addViewController("/projetos/{id}").setViewName("forward:/index.html");
        registry.addViewController("/grupos/{id}").setViewName("forward:/index.html");
    }
}
