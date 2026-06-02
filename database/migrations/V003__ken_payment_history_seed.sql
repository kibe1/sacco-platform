INSERT INTO payments.payment_callbacks
    (tenant_id, provider, external_ref, account_reference, amount, payload, status)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Lipa na MPesa Transfer',
        'TBC260323069',
        '0001083 JOSAM MULTI LTD',
        116000.00,
        '{"creditTo":"0001083 JOSAM MULTI LTD","debitFrom":"000180018 RONO KENNETH","coreReferenceNumber":"FTX26082NB","paymentDate":"23/03/2026"}',
        'Processed by Bank'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Mobile Money Transfer',
        'TBC260323068',
        '254701018471 Fancy Kirui',
        5000.00,
        '{"creditTo":"254701018471 Fancy Kirui","debitFrom":"000180018 RONO KENNETH","coreReferenceNumber":"FTX26082NB","paymentDate":"23/03/2026"}',
        'Processed by Bank'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Pesalink Transfer',
        'TBC2602030535',
        '1134602855 RONO KENNETH',
        15.00,
        '{"creditTo":"1134602855 RONO KENNETH","debitFrom":"000180018 RONO KENNETH","coreReferenceNumber":"FTX26034FD","paymentDate":"03/02/2026"}',
        'Processed by Bank'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Pesalink Transfer',
        'TBC2602030534',
        '1134602855 RONO KENNETH',
        150.00,
        '{"creditTo":"1134602855 RONO KENNETH","debitFrom":"000180018 RONO KENNETH","coreReferenceNumber":"FTX26034FD","paymentDate":"03/02/2026"}',
        'Processed by Bank'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'Mobile Money Transfer',
        'TBC26012907',
        '254713000000 RONO KEN',
        50.00,
        '{"creditTo":"254713000000 RONO KEN","debitFrom":"000180018 RONO KENNETH","coreReferenceNumber":"","paymentDate":"29/01/2026"}',
        'Rejected by Bank'
    )
ON CONFLICT (tenant_id, provider, external_ref) DO NOTHING;

INSERT INTO loans.repayments (tenant_id, loan_id, amount, source, external_ref)
SELECT
    '00000000-0000-0000-0000-000000000001',
    id,
    8000.00,
    'MPESA',
    'RPT-SEED-001'
FROM loans.loan_accounts
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT (tenant_id, external_ref) DO NOTHING;
