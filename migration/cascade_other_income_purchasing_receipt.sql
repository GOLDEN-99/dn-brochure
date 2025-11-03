ALTER TABLE other_income_purchase_receipts
DROP CONSTRAINT FK_other_income_purchase_receipts_other_income_lists;

-- Step 2: Recreate the foreign key constraint with CASCADE DELETE
ALTER TABLE other_income_purchase_receipts
ADD CONSTRAINT FK_other_income_purchase_receipts_other_income_lists
FOREIGN KEY (month_id) 
REFERENCES other_income_lists(id)
ON DELETE CASCADE;