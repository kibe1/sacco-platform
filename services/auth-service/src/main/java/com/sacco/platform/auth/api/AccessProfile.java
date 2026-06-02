package com.sacco.platform.auth.api;

import java.util.List;

public record AccessProfile(
        String userId,
        String tenantId,
        String displayName,
        String email,
        List<String> roles,
        List<String> permissions,
        List<String> branchIds) {
}
