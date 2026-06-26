package br.ufpb.dsc.nexushub.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "br.ufpb.dsc.nexushub")
@EntityScan({
        "br.ufpb.dsc.nexushub.model.identity.domain",
        "br.ufpb.dsc.nexushub.model.people.domain",
        "br.ufpb.dsc.nexushub.model.groups.domain",
        "br.ufpb.dsc.nexushub.model.projects.domain",
        "br.ufpb.dsc.nexushub.model.opportunities.domain"
})
@EnableJpaRepositories({
        "br.ufpb.dsc.nexushub.model.identity.repository",
        "br.ufpb.dsc.nexushub.model.people.repository",
        "br.ufpb.dsc.nexushub.model.groups.repository",
        "br.ufpb.dsc.nexushub.model.projects.repository",
        "br.ufpb.dsc.nexushub.model.opportunities.repository"
})
public class NexusHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusHubApplication.class, args);
    }
}
