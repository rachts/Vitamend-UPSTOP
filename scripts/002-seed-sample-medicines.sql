-- Seed sample medicines for testing

INSERT INTO medicines (name, brand, generic_name, dosage, quantity, expiry_date, category, condition, available, verified, image_urls)
VALUES
  ('Paracetamol', 'Tylenol', 'Acetaminophen', '500mg', 100, '2026-12-31', 'Pain Relief', 'new', true, true, '{}'),
  ('Ibuprofen', 'Advil', 'Ibuprofen', '200mg', 50, '2026-06-30', 'Pain Relief', 'new', true, true, '{}'),
  ('Amoxicillin', 'Amoxil', 'Amoxicillin', '250mg', 30, '2025-09-15', 'Antibiotics', 'new', true, true, '{}'),
  ('Metformin', 'Glucophage', 'Metformin HCl', '500mg', 60, '2026-03-20', 'Diabetes', 'new', true, true, '{}'),
  ('Omeprazole', 'Prilosec', 'Omeprazole', '20mg', 45, '2025-11-30', 'Digestive Health', 'new', true, true, '{}'),
  ('Cetirizine', 'Zyrtec', 'Cetirizine HCl', '10mg', 80, '2026-08-15', 'Allergy', 'new', true, true, '{}'),
  ('Losartan', 'Cozaar', 'Losartan Potassium', '50mg', 25, '2025-12-01', 'Blood Pressure', 'new', true, true, '{}'),
  ('Atorvastatin', 'Lipitor', 'Atorvastatin Calcium', '10mg', 40, '2026-02-28', 'Cholesterol', 'new', true, true, '{}')
ON CONFLICT DO NOTHING;
