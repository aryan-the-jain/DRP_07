ALTER TABLE grievers ADD COLUMN time_of_onboarding TIMESTAMP NOT NULL;
ALTER TABLE support_groups ADD COLUMN time_of_creation TIMESTAMP NOT NULL;

UPDATE grievers SET time_of_onboarding=CURRENT_TIMESTAMP;
UPDATE support_groups SET time_of_creation=CURRENT_TIMESTAMP;
