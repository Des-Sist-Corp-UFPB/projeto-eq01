package br.ufpb.dsc.nexushub.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(scanBasePackages = "br.ufpb.dsc.nexushub")
@EntityScan("br.ufpb.dsc.nexushub.model")
@EnableJpaRepositories("br.ufpb.dsc.nexushub.model")
@EnableCaching
public class NexusHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusHubApplication.class, args);
    }
}
