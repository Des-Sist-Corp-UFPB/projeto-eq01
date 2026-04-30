package br.ufpb.dsc.mercado;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal da aplicação Mercado.
 *
 * <p>A anotação {@code @SpringBootApplication} é um atalho que combina três anotações:
 * <ul>
 *   <li>{@code @Configuration} — indica que esta classe pode declarar beans Spring (métodos @Bean).</li>
 *   <li>{@code @EnableAutoConfiguration} — habilita a autoconfiguração do Spring Boot, que detecta
 *       automaticamente as dependências no classpath e configura beans necessários (ex.: DataSource
 *       para o banco, DispatcherServlet para web, etc.).</li>
 *   <li>{@code @ComponentScan} — escaneia o pacote atual e todos os subpacotes procurando por
 *       componentes Spring anotados com {@code @Component}, {@code @Service}, {@code @Repository},
 *       {@code @Controller}, etc.</li>
 * </ul>
 *
 * <p><strong>Disciplina:</strong> Desenvolvimento de Sistemas Corporativos (DSC)<br>
 * <strong>Professor:</strong> Rodrigo Rebouças — UFPB Campus IV
 *
 * @author DSC - UFPB Campus IV
 * @version 0.0.1-SNAPSHOT
 */
@SpringBootApplication
public class MercadoApplication {

    /**
     * Ponto de entrada da JVM.
     *
     * <p>{@code SpringApplication.run()} inicializa o contexto do Spring, cria todos os beans,
     * executa as migrações do Flyway e sobe o servidor embutido (Tomcat, por padrão).
     *
     * @param args argumentos de linha de comando (podem sobrescrever propriedades do application.yml)
     */
    public static void main(String[] args) {
        SpringApplication.run(MercadoApplication.class, args);
    }
}
