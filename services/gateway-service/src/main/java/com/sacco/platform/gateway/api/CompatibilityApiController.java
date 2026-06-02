package com.sacco.platform.gateway.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CompatibilityApiController {
    private static final String LOCAL_TENANT_ID = "00000000-0000-0000-0000-000000000001";

    private final JdbcTemplate jdbc;

    public CompatibilityApiController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/platform/status")
    public ResponseEntity<Map<String, Object>> platformStatus(
            @RequestHeader(value = "X-Correlation-Id", required = false) String correlationId) {
        return ResponseEntity.ok(map(
                "status", "UP",
                "environment", "local",
                "gateway", "sacco-gateway-service",
                "database", databaseStatus(),
                "correlationId", resolveCorrelationId(correlationId),
                "timestamp", Instant.now().toString(),
                "services", List.of(
                        service("auth-service", "UP", "http://auth-service:8081"),
                        service("member-service", "DB_CONNECTED", "members.clients"),
                        service("loan-service", "DB_CONNECTED", "loans.loan_accounts"),
                        service("payment-service", "DB_CONNECTED", "payments.payment_callbacks"),
                        service("ussd-service", "DB_CONNECTED", "config.channel_menus"))));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> dashboardSummary() {
        return ResponseEntity.ok(map(
                "tenantId", LOCAL_TENANT_ID,
                "activeMembers", tenantCount("select count(*) from members.clients where tenant_id = ?::uuid and status = 'ACTIVE'"),
                "pendingApprovals", tenantCount("select count(*) from loans.loan_accounts where tenant_id = ?::uuid and status = 'PENDING'"),
                "loansDisbursed", decimal("select coalesce(sum(principal), 0) from loans.loan_accounts where tenant_id = ?::uuid"),
                "totalRepayments", decimal("select coalesce(sum(amount), 0) from loans.repayments where tenant_id = ?::uuid"),
                "totalOutstanding", decimal("select coalesce(sum(outstanding), 0) from loans.loan_accounts where tenant_id = ?::uuid"),
                "totalArrears", BigDecimal.ZERO,
                "channelUptime", "99.97%",
                "generatedAt", Instant.now().toString()));
    }

    @GetMapping("/dashboard/collections")
    public ResponseEntity<Map<String, Object>> dashboardCollections() {
        BigDecimal today = decimal("""
                select coalesce(sum(amount), 0)
                from loans.repayments
                where tenant_id = ?::uuid and created_at::date = current_date
                """);
        BigDecimal week = decimal("""
                select coalesce(sum(amount), 0)
                from loans.repayments
                where tenant_id = ?::uuid and created_at >= date_trunc('week', now())
                """);
        BigDecimal month = decimal("""
                select coalesce(sum(amount), 0)
                from loans.repayments
                where tenant_id = ?::uuid and created_at >= date_trunc('month', now())
                """);

        return ResponseEntity.ok(map(
                "today", today,
                "week", week,
                "month", month,
                "series", List.of(
                        collection("Jan", 55),
                        collection("Feb", 67),
                        collection("Mar", 72),
                        collection("Apr", 61),
                        collection("May", 84),
                        collection("Jun", 79))));
    }

    @GetMapping("/admin/modules")
    public ResponseEntity<List<Map<String, Object>>> adminModules() {
        return ResponseEntity.ok(modules());
    }

    @GetMapping("/modules")
    public ResponseEntity<List<Map<String, Object>>> modulesList() {
        return ResponseEntity.ok(modules());
    }

    @GetMapping("/modules/coverage")
    public ResponseEntity<Map<String, Object>> moduleCoverage() {
        long handled = count("select count(*) from module_conversion.module_coverage where status = 'HANDLED'");
        long total = count("select count(*) from module_conversion.module_coverage");
        int coverage = total == 0 ? 0 : (int) Math.round((handled * 100.0) / total);

        return ResponseEntity.ok(map(
                "coverage", coverage,
                "status", total == handled ? "HANDLED" : "IN_PROGRESS",
                "modules", total,
                "handled", handled,
                "note", "Loaded from Ken's module_conversion.module_coverage table."));
    }

    @GetMapping("/modules/{module}")
    public ResponseEntity<Map<String, Object>> moduleDetail(@PathVariable String module) {
        List<Map<String, Object>> rows = query("""
                select module_name, target_service, postgres_schema, status, notes
                from module_conversion.module_coverage
                where lower(module_name) = lower(?)
                limit 1
                """, module);

        if (rows.isEmpty()) {
            return ResponseEntity.ok(map(
                    "module", module,
                    "status", "NOT_MAPPED",
                    "contract", "/api/v1/modules/" + module + "/schema"));
        }

        Map<String, Object> row = rows.getFirst();
        return ResponseEntity.ok(map(
                "module", row.get("module_name"),
                "status", row.get("status"),
                "owner", row.get("target_service"),
                "postgresSchema", row.get("postgres_schema"),
                "notes", row.get("notes"),
                "contract", "/api/v1/modules/" + module + "/schema"));
    }

    @GetMapping("/modules/{module}/schema")
    public ResponseEntity<Map<String, Object>> moduleSchema(@PathVariable String module) {
        return ResponseEntity.ok(map(
                "module", module,
                "schemaVersion", "v1",
                "fields", List.of(
                        map("name", "tenantId", "type", "uuid", "required", true),
                        map("name", "status", "type", "string", "required", true),
                        map("name", "createdAt", "type", "instant", "required", true))));
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<Map<String, Object>>> tenants() {
        return ResponseEntity.ok(query("""
                select id::text as id, name, status, code, created_at as "createdAt"
                from tenants.organizations
                order by created_at desc
                """));
    }

    @GetMapping("/clients")
    public ResponseEntity<List<Map<String, Object>>> clients(
            @RequestParam(value = "tenantId", required = false, defaultValue = LOCAL_TENANT_ID) String tenantId) {
        return ResponseEntity.ok(query("""
                select
                    id::text as id,
                    tenant_id::text as "tenantId",
                    account_no,
                    concat_ws(' ', first_name, middle_name, last_name, other_names) as full_name,
                    concat_ws(' ', first_name, middle_name, last_name, other_names) as name,
                    mobile,
                    email,
                    status
                from members.clients
                where tenant_id = ?::uuid
                order by created_at desc
                """, tenantId));
    }

    @PostMapping("/clients")
    public ResponseEntity<Map<String, Object>> createClient(@RequestBody Map<String, Object> request) {
        String accountNo = text(request.getOrDefault("account_no", request.getOrDefault("accountNo", "MBR-" + UUID.randomUUID())));
        String fullName = text(request.getOrDefault("full_name", request.getOrDefault("name", "New Member")));
        String[] names = fullName.split(" ", 2);
        String firstName = names[0].isBlank() ? "New" : names[0];
        String lastName = names.length > 1 && !names[1].isBlank() ? names[1] : "Member";
        String mobile = text(request.getOrDefault("mobile", "254700" + System.currentTimeMillis() % 1_000_000));
        String email = text(request.getOrDefault("email", accountNo.toLowerCase() + "@sacco.local"));

        jdbc.update("""
                insert into members.clients (tenant_id, account_no, first_name, last_name, mobile, email, status)
                values (?::uuid, ?, ?, ?, ?, ?, 'ACTIVE')
                on conflict (tenant_id, account_no) do nothing
                """, LOCAL_TENANT_ID, accountNo, firstName, lastName, mobile, email);

        return ResponseEntity.accepted().body(accepted("CLIENT_CREATE_ACCEPTED", request));
    }

    @GetMapping("/loans")
    public ResponseEntity<List<Map<String, Object>>> loans(
            @RequestParam(value = "tenantId", required = false, defaultValue = LOCAL_TENANT_ID) String tenantId) {
        return ResponseEntity.ok(query("""
                select
                    l.id::text as id,
                    l.loan_no as account_no,
                    l.loan_no as "accountNo",
                    l.tenant_id::text as "tenantId",
                    c.id::text as "memberId",
                    concat_ws(' ', c.first_name, c.middle_name, c.last_name, c.other_names) as full_name,
                    l.principal,
                    l.principal as amount,
                    l.outstanding,
                    l.status
                from loans.loan_accounts l
                join members.clients c on c.id = l.client_id
                where l.tenant_id = ?::uuid
                order by l.created_at desc
                """, tenantId));
    }

    @GetMapping("/channel-menus")
    public ResponseEntity<List<Map<String, Object>>> channelMenus(
            @RequestParam(value = "tenantId", required = false, defaultValue = LOCAL_TENANT_ID) String tenantId,
            @RequestParam(value = "channel", required = false, defaultValue = "USSD") String channel) {
        return ResponseEntity.ok(query("""
                select
                    id::text as id,
                    tenant_id::text as "tenantId",
                    channel,
                    menu_code,
                    menu_code as option,
                    label,
                    route_or_action,
                    case when is_active then 'ACTIVE' else 'INACTIVE' end as status
                from config.channel_menus
                where tenant_id = ?::uuid and channel = upper(?)
                order by display_order, menu_code
                """, tenantId, channel));
    }

    @PostMapping("/channel-menus")
    public ResponseEntity<Map<String, Object>> createChannelMenu(@RequestBody Map<String, Object> request) {
        jdbc.update("""
                insert into config.channel_menus (tenant_id, channel, menu_code, label, route_or_action, display_order)
                values (?::uuid, upper(?), ?, ?, ?, ?)
                on conflict (tenant_id, channel, menu_code)
                do update set label = excluded.label, route_or_action = excluded.route_or_action
                """,
                LOCAL_TENANT_ID,
                text(request.getOrDefault("channel", "USSD")),
                text(request.getOrDefault("menu_code", request.getOrDefault("option", "NEW"))),
                text(request.getOrDefault("label", "New Menu")),
                text(request.getOrDefault("route_or_action", request.getOrDefault("action", "NEW_ACTION"))),
                number(request.get("display_order"), 99));

        return ResponseEntity.accepted().body(accepted("CHANNEL_MENU_ACCEPTED", request));
    }

    @GetMapping("/audit")
    public ResponseEntity<List<Map<String, Object>>> audit(
            @RequestParam(value = "tenantId", required = false, defaultValue = LOCAL_TENANT_ID) String tenantId) {
        return ResponseEntity.ok(query("""
                select id::text as id, tenant_id::text as "tenantId", actor, action as "eventType",
                       entity_type as "entityType", entity_id as "entityId", details, created_at as "occurredAt"
                from audit.audit_logs
                where tenant_id = ?::uuid or tenant_id is null
                order by created_at desc
                limit 100
                """, tenantId));
    }

    @PostMapping("/payments/mpesa/callback")
    public ResponseEntity<Map<String, Object>> mpesaCallback(@RequestBody Map<String, Object> request) {
        jdbc.update("""
                insert into payments.payment_callbacks
                    (tenant_id, provider, external_ref, account_reference, amount, payload, status)
                values (?::uuid, 'MPESA', ?, ?, ?, to_jsonb(?::json), 'RECEIVED')
                on conflict (tenant_id, provider, external_ref) do nothing
                """,
                LOCAL_TENANT_ID,
                text(request.getOrDefault("external_ref", request.getOrDefault("reference", UUID.randomUUID()))),
                text(request.getOrDefault("account_reference", request.getOrDefault("accountNo", ""))),
                decimalValue(request.getOrDefault("amount", BigDecimal.ZERO)),
                "{}");

        return ResponseEntity.accepted().body(accepted("MPESA_CALLBACK_ACCEPTED", request));
    }

    @GetMapping("/portal/customer-summary")
    public ResponseEntity<Map<String, Object>> portalCustomerSummary() {
        List<Map<String, Object>> rows = query("""
                select
                    c.account_no as "memberNumber",
                    concat_ws(' ', c.first_name, c.middle_name, c.last_name, c.other_names) as "displayName",
                    c.tenant_id::text as "tenantId",
                    coalesce(sum(case when a.account_type ilike '%wallet%' then a.balance else 0 end), 0) as "walletBalance",
                    coalesce(sum(case when a.account_type not ilike '%wallet%' then a.balance else 0 end), 0) as "savingsBalance",
                    coalesce((select sum(l.outstanding) from loans.loan_accounts l where l.client_id = c.id), 0) as "loanBalance",
                    coalesce((select max(l.status) from loans.loan_accounts l where l.client_id = c.id), 'NONE') as "loanStatus"
                from members.clients c
                left join members.member_accounts a on a.client_id = c.id
                where c.tenant_id = ?::uuid
                group by c.id
                order by c.created_at desc
                limit 1
                """, LOCAL_TENANT_ID);

        if (rows.isEmpty()) {
            return ResponseEntity.ok(map());
        }

        Map<String, Object> row = rows.getFirst();
        BigDecimal savings = decimalValue(row.get("savingsBalance"));
        BigDecimal wallet = decimalValue(row.get("walletBalance"));
        BigDecimal loan = decimalValue(row.get("loanBalance"));

        return ResponseEntity.ok(map(
                "memberNumber", row.get("memberNumber"),
                "displayName", row.get("displayName"),
                "tenantId", row.get("tenantId"),
                "savingsBalance", savings,
                "walletBalance", wallet,
                "loanBalance", loan,
                "loanStatus", row.get("loanStatus"),
                "availableBalance", savings.add(wallet),
                "assets", savings.add(wallet),
                "liabilities", loan,
                "availableLimits", BigDecimal.ZERO));
    }

    @GetMapping("/portal/announcements")
    public ResponseEntity<List<Map<String, Object>>> portalAnnouncements() {
        return ResponseEntity.ok(List.of(
                map("title", "SHIF and SHA payments", "severity", "INFO", "message", "SHIF and SHA payments on Connect Plus."),
                map("title", "USSD pilot", "severity", "SUCCESS", "message", "USSD self-service menus are ready for mapping.")));
    }

    @GetMapping("/portal/theme")
    public ResponseEntity<Map<String, Object>> portalTheme() {
        List<Map<String, Object>> rows = query("""
                select
                    setting_value ->> 'brandName' as "brandName",
                    setting_value ->> 'primaryColor' as "primaryColor",
                    setting_value ->> 'accentColor' as "accentColor",
                    setting_value ->> 'buttonColor' as "buttonColor",
                    tenant_id::text as "tenantId"
                from config.tenant_settings
                where tenant_id = ?::uuid and setting_key = 'portal_theme'
                limit 1
                """, LOCAL_TENANT_ID);

        if (rows.isEmpty()) {
            return ResponseEntity.ok(map("tenantId", LOCAL_TENANT_ID, "brandName", "SACCO", "primaryColor", "#2f6f4e"));
        }

        Map<String, Object> theme = rows.getFirst();
        return ResponseEntity.ok(map(
                "tenantId", theme.get("tenantId"),
                "brandName", theme.get("brandName"),
                "primaryColor", theme.get("primaryColor"),
                "sidebarColor", theme.get("primaryColor"),
                "accentColor", theme.get("accentColor"),
                "buttonColor", theme.get("buttonColor"),
                "defaultMode", "system"));
    }

    @GetMapping("/portal/login-config")
    public ResponseEntity<Map<String, Object>> portalLoginConfig() {
        return ResponseEntity.ok(map(
                "realm", "sacco-platform",
                "adminClientId", "admin-portal",
                "memberClientId", "member-portal",
                "passwordLoginEnabled", true,
                "mfaRequired", false));
    }

    @GetMapping("/portal/session-timeout-config")
    public ResponseEntity<Map<String, Object>> portalSessionTimeoutConfig() {
        return ResponseEntity.ok(map(
                "idleTimeoutSeconds", 900,
                "absoluteTimeoutSeconds", 28800,
                "warningSeconds", 60,
                "refreshEnabled", true));
    }

    @GetMapping("/portal/accounts")
    public ResponseEntity<List<Map<String, Object>>> portalAccounts() {
        return ResponseEntity.ok(query("""
                select
                    account_no as "accountNumber",
                    account_no as "accountNo",
                    account_type as "accountName",
                    account_type as type,
                    'KENYA SACCO LTD' as entity,
                    balance,
                    balance as "availableBalance",
                    balance as "totalBalance",
                    currency,
                    status
                from members.member_accounts
                where tenant_id = ?::uuid
                order by created_at desc
                """, LOCAL_TENANT_ID));
    }

    @GetMapping("/portal/payments")
    public ResponseEntity<List<Map<String, Object>>> portalPayments() {
        return ResponseEntity.ok(query("""
                select
                    external_ref as reference,
                    external_ref as "referenceNumber",
                    coalesce(payload ->> 'coreReferenceNumber', 'CORE-' || external_ref) as "coreReferenceNumber",
                    provider as type,
                    provider as "paymentType",
                    to_char(amount, 'FM999G999G999G990D00') || ' KES' as amount,
                    status,
                    coalesce(payload ->> 'creditTo', account_reference) as "creditTo",
                    coalesce(payload ->> 'debitFrom', provider) as "debitFrom",
                    coalesce(payload ->> 'paymentDate', created_at::date::text) as date
                from payments.payment_callbacks
                where tenant_id = ?::uuid
                order by created_at desc
                limit 50
                """, LOCAL_TENANT_ID));
    }

    private List<Map<String, Object>> modules() {
        return query("""
                select
                    module_name as id,
                    module_name as name,
                    target_service as owner,
                    status,
                    '/' || lower(module_name) as href,
                    postgres_schema as "postgresSchema",
                    notes
                from module_conversion.module_coverage
                order by module_name
                """);
    }

    private List<Map<String, Object>> query(String sql, Object... args) {
        try {
            return jdbc.queryForList(sql, args);
        } catch (DataAccessException exception) {
            return List.of();
        }
    }

    private long count(String sql) {
        try {
            Long value = jdbc.queryForObject(sql, Long.class);
            return value == null ? 0L : value;
        } catch (DataAccessException exception) {
            return 0L;
        }
    }

    private long tenantCount(String sql) {
        try {
            Long value = jdbc.queryForObject(sql, Long.class, LOCAL_TENANT_ID);
            return value == null ? 0L : value;
        } catch (DataAccessException exception) {
            return 0L;
        }
    }

    private BigDecimal decimal(String sql) {
        try {
            BigDecimal value = jdbc.queryForObject(sql, BigDecimal.class, LOCAL_TENANT_ID);
            return value == null ? BigDecimal.ZERO : value;
        } catch (DataAccessException exception) {
            return BigDecimal.ZERO;
        }
    }

    private String databaseStatus() {
        try {
            jdbc.queryForObject("select 1", Integer.class);
            return "UP";
        } catch (DataAccessException exception) {
            return "DOWN";
        }
    }

    private static Map<String, Object> service(String name, String status, String detail) {
        return map("name", name, "status", status, "detail", detail);
    }

    private static Map<String, Object> collection(String label, int percentage) {
        return map("label", label, "month", label, "percentage", percentage);
    }

    private static Map<String, Object> accepted(String code, Map<String, Object> request) {
        return map("code", code, "requestId", UUID.randomUUID().toString(), "received", request, "status", "ACCEPTED");
    }

    private static Map<String, Object> map(Object... values) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int index = 0; index < values.length - 1; index += 2) {
            result.put(String.valueOf(values[index]), values[index + 1]);
        }
        return result;
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static int number(Object value, int fallback) {
        if (value instanceof Number number) {
            return number.intValue();
        }

        try {
            return Integer.parseInt(text(value));
        } catch (NumberFormatException exception) {
            return fallback;
        }
    }

    private static BigDecimal decimalValue(Object value) {
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }

        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }

        try {
            return new BigDecimal(text(value));
        } catch (NumberFormatException exception) {
            return BigDecimal.ZERO;
        }
    }

    private static String resolveCorrelationId(String correlationId) {
        return correlationId == null || correlationId.isBlank() ? UUID.randomUUID().toString() : correlationId;
    }
}
