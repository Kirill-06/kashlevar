INSERT INTO shop (name, price, type)
VALUES 
    ('XROS 5', 100, 'vape'),
    ('VapePro', 250, 'vape'),
    ('CloudMaster', 500, 'vape')
ON CONFLICT DO NOTHING;


INSERT INTO vape_items (shop_id, base_health_change, base_happiness_change)
SELECT id, -5, 10 FROM shop WHERE name = 'XROS 5'
ON CONFLICT DO NOTHING;

INSERT INTO vape_items (shop_id, base_health_change, base_happiness_change)
SELECT id, -10, 20 FROM shop WHERE name = 'VapePro'
ON CONFLICT DO NOTHING;

INSERT INTO vape_items (shop_id, base_health_change, base_happiness_change)
SELECT id, -15, 30 FROM shop WHERE name = 'CloudMaster'
ON CONFLICT DO NOTHING;
