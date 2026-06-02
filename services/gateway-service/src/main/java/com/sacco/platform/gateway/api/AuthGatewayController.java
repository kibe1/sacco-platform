package com.sacco.platform.gateway.api;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthGatewayController {
    private final WebClient authClient;

    public AuthGatewayController(WebClient.Builder webClientBuilder,
            @Value("${sacco.services.auth-service-url}") String authServiceUrl) {
        this.authClient = webClientBuilder.baseUrl(authServiceUrl).build();
    }

    @GetMapping("/current-user")
    public Mono<ResponseEntity<String>> currentUser(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestHeader(value = "X-Correlation-Id", required = false) String correlationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantId) {
        if (authorization == null || authorization.isBlank()) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("""
                    {"code":"UNAUTHENTICATED","message":"Missing Authorization header"}
                    """));
        }

        return authClient.get()
                .uri("/v1/auth/current-user")
                .header(HttpHeaders.AUTHORIZATION, authorization)
                .header("X-Correlation-Id", resolveCorrelationId(correlationId))
                .headers(headers -> {
                    if (tenantId != null && !tenantId.isBlank()) {
                        headers.set("X-Tenant-Id", tenantId);
                    }
                })
                .exchangeToMono(response -> response.toEntity(String.class))
                .onErrorResume(WebClientRequestException.class, error -> Mono.just(ResponseEntity
                        .status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body("""
                                {"code":"AUTH_SERVICE_UNAVAILABLE","message":"Auth service is temporarily unavailable"}
                                """)));
    }

    private static String resolveCorrelationId(String correlationId) {
        return correlationId == null || correlationId.isBlank() ? UUID.randomUUID().toString() : correlationId;
    }
}
