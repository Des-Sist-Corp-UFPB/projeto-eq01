package br.ufpb.dsc.nexushub.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ShopRequest(
        @NotBlank(message = "Nome da loja não pode ser vazio") String name,
        String description,
        String logo,
        String banner,
        String meetLocations,
        String paymentMethods,
        String pixKey,
        @NotBlank(message = "Campus de operação não pode ser vazio") String campus,
        @NotNull boolean active
) {}
