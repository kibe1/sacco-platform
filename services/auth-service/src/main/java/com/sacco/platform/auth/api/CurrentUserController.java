package com.sacco.platform.auth.api;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
public class CurrentUserController {
    private static final String LOCAL_TENANT_ID = "local-sacco";

    @GetMapping("/current-user")
    public ResponseEntity<ApiEnvelope<CurrentUserResponse>> currentUser(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Correlation-Id", required = false) String correlationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantId) {
        String resolvedTenantId = resolveTenantId(jwt, tenantId);
        AccessProfile profile = new AccessProfile(
                jwt.getSubject(),
                resolvedTenantId,
                displayName(jwt),
                email(jwt),
                roles(jwt),
                permissions(jwt),
                List.of());

        ApiMeta meta = new ApiMeta(resolveCorrelationId(correlationId), resolvedTenantId);
        return ResponseEntity.ok(new ApiEnvelope<>(new CurrentUserResponse(profile), meta));
    }

    private static String resolveTenantId(Jwt jwt, String tenantIdHeader) {
        if (tenantIdHeader != null && !tenantIdHeader.isBlank()) {
            return tenantIdHeader;
        }

        String tenantId = jwt.getClaimAsString("tenant_id");
        return tenantId == null || tenantId.isBlank() ? LOCAL_TENANT_ID : tenantId;
    }

    private static String resolveCorrelationId(String correlationId) {
        return correlationId == null || correlationId.isBlank() ? UUID.randomUUID().toString() : correlationId;
    }

    private static String displayName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) {
            return name;
        }

        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");
        String fullName = String.join(" ",
                givenName == null ? "" : givenName,
                familyName == null ? "" : familyName).trim();
        if (!fullName.isBlank()) {
            return fullName;
        }

        String preferredUsername = jwt.getClaimAsString("preferred_username");
        return preferredUsername == null || preferredUsername.isBlank() ? "Authenticated User" : preferredUsername;
    }

    private static String email(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email != null && !email.isBlank()) {
            return email;
        }

        String preferredUsername = jwt.getClaimAsString("preferred_username");
        if (preferredUsername != null && preferredUsername.contains("@")) {
            return preferredUsername;
        }

        return "";
    }

    private static List<String> roles(Jwt jwt) {
        Set<String> roles = new LinkedHashSet<>();
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        Object realmRoles = realmAccess == null ? null : realmAccess.get("roles");

        if (realmRoles instanceof List<?> values) {
            values.stream().filter(String.class::isInstance).map(String.class::cast).forEach(roles::add);
        }

        String authorizedParty = jwt.getClaimAsString("azp");
        if (authorizedParty != null && !authorizedParty.isBlank()) {
            roles.add(authorizedParty.replace("-portal", ""));
        }

        if (roles.isEmpty()) {
            roles.add("member");
        }

        return new ArrayList<>(roles);
    }

    private static List<String> permissions(Jwt jwt) {
        Set<String> roles = new LinkedHashSet<>(roles(jwt));
        Set<String> permissions = new LinkedHashSet<>();

        if (roles.contains("admin") || roles.contains("super-admin") || roles.contains("realm-admin")) {
            permissions.addAll(List.of(
                    "tenant.manage",
                    "users.manage",
                    "members.read",
                    "members.manage",
                    "savings.read",
                    "savings.manage",
                    "loans.read",
                    "loans.manage",
                    "payments.read",
                    "reports.read",
                    "audit.read"));
        } else {
            permissions.addAll(List.of("members.read", "savings.read", "loans.read", "payments.read", "reports.read"));
        }

        return new ArrayList<>(permissions);
    }
}
