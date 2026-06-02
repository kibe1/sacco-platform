CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS tenants;
CREATE SCHEMA IF NOT EXISTS config;
CREATE SCHEMA IF NOT EXISTS members;
CREATE SCHEMA IF NOT EXISTS loans;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS accounting;
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS tenants.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config.tenant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  setting_key VARCHAR(120) NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, setting_key)
);

CREATE TABLE IF NOT EXISTS config.channel_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('WEB','MOBILE','USSD','PORTAL')),
  menu_code VARCHAR(100) NOT NULL,
  label VARCHAR(150) NOT NULL,
  route_or_action TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, channel, menu_code)
);

CREATE TABLE IF NOT EXISTS members.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  account_no VARCHAR(40) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  other_names VARCHAR(150),
  mobile VARCHAR(30) NOT NULL,
  email VARCHAR(160),
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, account_no),
  UNIQUE (tenant_id, mobile)
);

CREATE TABLE IF NOT EXISTS members.member_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  client_id UUID NOT NULL REFERENCES members.clients(id),
  account_no VARCHAR(40) NOT NULL,
  account_type VARCHAR(40) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'KES',
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, account_no)
);

CREATE TABLE IF NOT EXISTS loans.loan_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  client_id UUID NOT NULL REFERENCES members.clients(id),
  loan_no VARCHAR(60) NOT NULL,
  principal NUMERIC(18,2) NOT NULL CHECK (principal > 0),
  outstanding NUMERIC(18,2) NOT NULL CHECK (outstanding >= 0),
  interest_rate NUMERIC(8,4) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, loan_no)
);

CREATE TABLE IF NOT EXISTS loans.repayments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  loan_id UUID NOT NULL REFERENCES loans.loan_accounts(id),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  source VARCHAR(60) NOT NULL,
  external_ref VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, external_ref)
);

CREATE TABLE IF NOT EXISTS wallet.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  client_id UUID NOT NULL REFERENCES members.clients(id),
  amount NUMERIC(18,2) NOT NULL,
  direction VARCHAR(5) NOT NULL CHECK (direction IN ('CR','DR')),
  reason VARCHAR(120) NOT NULL,
  external_ref VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments.payment_callbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  provider VARCHAR(40) NOT NULL,
  external_ref VARCHAR(120) NOT NULL,
  account_reference VARCHAR(60),
  amount NUMERIC(18,2) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider, external_ref)
);

CREATE TABLE IF NOT EXISTS accounting.ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants.organizations(id),
  debit_account VARCHAR(80) NOT NULL,
  credit_account VARCHAR(80) NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  narration TEXT NOT NULL,
  external_ref VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants.organizations(id),
  actor VARCHAR(120),
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80),
  entity_id VARCHAR(120),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_tenant_status ON members.clients(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_client ON members.member_accounts(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_loans_tenant_client_status ON loans.loan_accounts(tenant_id, client_id, status);
CREATE INDEX IF NOT EXISTS idx_repayments_tenant_loan ON loans.repayments(tenant_id, loan_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tenant_client ON wallet.wallet_transactions(tenant_id, client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant_created ON accounting.ledger_entries(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON audit.audit_logs(tenant_id, created_at DESC);

INSERT INTO tenants.organizations (id, code, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'DEMO', 'KENYA SACCO LTD', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO config.tenant_settings (tenant_id, setting_key, setting_value)
VALUES
('00000000-0000-0000-0000-000000000001', 'portal_theme', '{"brandName":"CONNECTPLUS","primaryColor":"#382d28","accentColor":"#39b5df","highlightColor":"#47c1bd","buttonColor":"#ffe300"}'),
('00000000-0000-0000-0000-000000000001', 'account_number_prefix', '{"prefix":"100100","next":1}'),
('00000000-0000-0000-0000-000000000001', 'loan_rules', '{"maxApprovalFreeAmount":5000,"approvalLevels":[{"min":5001,"approvers":2}]}')
ON CONFLICT (tenant_id, setting_key) DO NOTHING;

INSERT INTO members.clients (id, tenant_id, account_no, first_name, last_name, mobile, email, status)
VALUES ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000001','1001000001','RONO','KENNETH','254700000001','demo@sacco.local','ACTIVE')
ON CONFLICT (tenant_id, account_no) DO NOTHING;

INSERT INTO members.member_accounts (tenant_id, client_id, account_no, account_type, currency, balance, status)
VALUES ('00000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','000180018','CURRENT ACCOUNT','KES',56340.06,'ACTIVE')
ON CONFLICT (tenant_id, account_no) DO NOTHING;

INSERT INTO loans.loan_accounts (tenant_id, client_id, loan_no, principal, outstanding, interest_rate, status)
VALUES ('00000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','LN-0001',50000.00,42000.00,12.5,'ACTIVE')
ON CONFLICT (tenant_id, loan_no) DO NOTHING;

INSERT INTO config.channel_menus (tenant_id, channel, menu_code, label, route_or_action, display_order)
VALUES
('00000000-0000-0000-0000-000000000001','PORTAL','HOME','Home','/portal',1),
('00000000-0000-0000-0000-000000000001','PORTAL','ACCOUNT_SERVICES','Account Services','/portal/account-services',2),
('00000000-0000-0000-0000-000000000001','PORTAL','PAYMENTS','Payments','/portal/payments',3),
('00000000-0000-0000-0000-000000000001','USSD','BALANCE','Check Balance','CHECK_BALANCE',1),
('00000000-0000-0000-0000-000000000001','USSD','LOAN','Loan Services','LOAN_MENU',2)
ON CONFLICT (tenant_id, channel, menu_code) DO NOTHING;
