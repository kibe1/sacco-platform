-- V21 Exhaustive Laravel Module Handling
-- ✔ Every one of the 32 Laravel modules has a target schema/service record.
CREATE SCHEMA IF NOT EXISTS module_conversion;

CREATE TABLE IF NOT EXISTS module_conversion.module_coverage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_name VARCHAR(80) NOT NULL UNIQUE,
    target_service VARCHAR(120) NOT NULL,
    postgres_schema VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'HANDLED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Group', 'organization-branch-service', 'branches', 'HANDLED', 'Groups/chama/CBO management')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Accounting', 'accounting-ledger-service', 'accounting', 'HANDLED', 'Chart of accounts, journal entries, GL posting and ledger')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Portal', 'customer-portal-service', 'members', 'HANDLED', 'Customer/member self-service portal flows')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('ActivityLog', 'audit-compliance-service', 'audit', 'HANDLED', 'Audit trail, immutable server actions and evidence logs')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Share', 'savings-share-service', 'savings', 'HANDLED', 'Share capital, dividends and share transactions')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Branch', 'organization-branch-service', 'branches', 'HANDLED', 'Branch setup, branch status, branch operations')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Installer', 'platform-lifecycle-service', 'platform', 'HANDLED', 'Installation/bootstrap lifecycle')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Upgrade', 'platform-lifecycle-service', 'platform', 'HANDLED', 'Upgrade/migration lifecycle')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Paypal', 'external-payment-adapter-service', 'payments', 'HANDLED', 'PayPal adapter under common payment gateway')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Mpesa', 'mpesa-adapter-service', 'payments', 'HANDLED', 'STK, C2B, B2C, callbacks, reversals and reconciliation')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Income', 'accounting-ledger-service', 'accounting', 'HANDLED', 'Income/revenue postings and reports')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Api', 'api-gateway-service', 'platform', 'HANDLED', 'API gateway contracts and routing')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Payroll', 'payroll-commission-service', 'payroll', 'HANDLED', 'Payroll, deductions, commissions and withdrawals')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Dashboard', 'reporting-analytics-service', 'reports', 'HANDLED', 'Dashboard widgets, aggregation and executive views')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Expense', 'accounting-ledger-service', 'accounting', 'HANDLED', 'Expense postings and controls')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('CustomField', 'tenant-config-service', 'config', 'HANDLED', 'Dynamic custom fields, forms and metadata')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Limits', 'tenant-config-service', 'config', 'HANDLED', 'Tenant limits, product limits, transaction limits and approval thresholds')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('User', 'identity-access-service', 'identity', 'HANDLED', 'Users, roles, login policy, user status, password policy')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Flutterwave', 'external-payment-adapter-service', 'payments', 'HANDLED', 'Flutterwave adapter under common payment gateway')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Communication', 'notification-service', 'notifications', 'HANDLED', 'SMS, email, templates and delivery tracking')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Client', 'member-crm-service', 'members', 'HANDLED', 'Client profile, KYC, accounts, member lifecycle')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Paynow', 'external-payment-adapter-service', 'payments', 'HANDLED', 'Paynow adapter under common payment gateway')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Wallet', 'wallet-service', 'wallet', 'HANDLED', 'Wallet ledger, customer/staff wallets and transaction movements')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Savings', 'savings-share-service', 'savings', 'HANDLED', 'Savings accounts, deposits, withdrawals and balance rules')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Loan', 'loan-service', 'loans', 'HANDLED', 'Loan lifecycle, approvals, schedules, guarantors, collateral, repayments')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Asset', 'accounting-ledger-service', 'accounting', 'HANDLED', 'Asset register and GL mappings')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Stripe', 'external-payment-adapter-service', 'payments', 'HANDLED', 'Stripe adapter under common payment gateway')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Report', 'reporting-analytics-service', 'reports', 'HANDLED', 'Reports, PDF/Excel export and scheduled reports')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Setting', 'tenant-config-service', 'config', 'HANDLED', 'Tenant settings, feature flags, rules and product configurations')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('BranchManager', 'organization-branch-service', 'branches', 'HANDLED', 'Branch staff/funds/portfolio management')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Core', 'platform-core-service', 'platform', 'HANDLED', 'Core platform bootstrap, shared kernel, base service utilities')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


INSERT INTO module_conversion.module_coverage (module_name, target_service, postgres_schema, status, notes)
VALUES ('Verify', 'identity-access-service', 'identity', 'HANDLED', 'OTP, email verification, identity verification and approvals')
ON CONFLICT (module_name) DO UPDATE SET target_service=EXCLUDED.target_service, postgres_schema=EXCLUDED.postgres_schema, status='HANDLED', notes=EXCLUDED.notes;


CREATE INDEX IF NOT EXISTS idx_module_coverage_status ON module_conversion.module_coverage(status);
