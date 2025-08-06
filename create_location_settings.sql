SET QUOTED_IDENTIFIER ON;

-- Create location-specific settings for Corporate Office
INSERT INTO LocationSettings (
    LocationId, 
    PurposeOfVisitOptions, 
    IdTypeOptions, 
    IsPhotoMandatory, 
    CustomFields, 
    EnabledFields, 
    CreatedAt, 
    UpdatedAt
) VALUES (
    3,
    N'["Business Meeting","Interview","Consultation","Delivery","Maintenance","Training","Casual","Other"]',
    N'["Driver''s License","Passport","National ID","Employee ID","Student ID"]',
    0,
    N'[]',
    N'{"Email":true,"CompanyName":true,"IdProof":true,"Photo":true}',
    GETUTCDATE(),
    GETUTCDATE()
);

-- Check the results
SELECT Id, LocationId, PurposeOfVisitOptions, EnabledFields, CreatedAt FROM LocationSettings;
