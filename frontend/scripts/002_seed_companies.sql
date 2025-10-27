-- Seed sample companies with ESG data
INSERT INTO public.companies (name, ticker, sector, tci_score, environment_score, social_score, governance_score, fairness_score, confidence_level) VALUES
('Tesla Inc.', 'TSLA', 'Automotive', 78.5, 85.2, 72.1, 76.3, 79.4, 92.0),
('Apple Inc.', 'AAPL', 'Technology', 72.3, 68.9, 75.6, 72.1, 71.8, 88.5),
('Microsoft Corporation', 'MSFT', 'Technology', 75.1, 71.2, 78.3, 75.9, 74.6, 90.2),
('Unilever PLC', 'UL', 'Consumer Goods', 68.7, 72.1, 65.3, 68.9, 67.2, 85.1),
('Nestlé S.A.', 'NSRGY', 'Food & Beverage', 65.4, 62.8, 68.1, 65.3, 64.9, 82.3)
ON CONFLICT (ticker) DO NOTHING;
