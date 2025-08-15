-- Add LocationId column to AspNetUsers table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AspNetUsers' AND COLUMN_NAME = 'LocationId')
BEGIN
    ALTER TABLE [AspNetUsers] ADD [LocationId] int NULL;
    PRINT 'LocationId column added to AspNetUsers table';
END
ELSE
BEGIN
    PRINT 'LocationId column already exists in AspNetUsers table';
END

-- Update existing users with a default location (assuming location ID 1 exists)
UPDATE [AspNetUsers] 
SET [LocationId] = 1 
WHERE [LocationId] IS NULL AND EXISTS (SELECT 1 FROM [Locations] WHERE [Id] = 1);

PRINT 'Updated existing users with default LocationId = 1';
