package com.sacco.platform.auth.api;

public record ApiEnvelope<T>(T data, ApiMeta meta) {
}
