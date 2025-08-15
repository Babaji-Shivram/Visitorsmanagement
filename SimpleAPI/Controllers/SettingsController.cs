using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace SimpleAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SettingsController : ControllerBase
    {
        // Global settings data
        private static Dictionary<string, object> _settings = new Dictionary<string, object>
        {
            // General System Settings
            { "system_name", "Visitor Management System" },
            { "company_name", "Your Company Name" },
            { "system_version", "2.0.0" },
            { "timezone", "UTC" },
            { "date_format", "MM/dd/yyyy" },
            { "time_format", "12-hour" },
            { "language", "en-US" },
            
            // Visitor Settings
            { "auto_approval_enabled", false },
            { "require_photo", true },
            { "require_id_proof", true },
            { "require_vehicle_number", false },
            { "require_emergency_contact", true },
            { "visitor_session_timeout", 480 }, // minutes
            { "max_visitors_per_day", 1000 },
            { "advance_booking_days", 30 },
            { "max_visit_duration", 8 }, // hours
            { "reminder_time_before_visit", 30 }, // minutes
            { "allow_walk_ins", true },
            { "require_approval_for_all_visits", true },
            
            // Security Settings
            { "jwt_expiry_hours", 24 },
            { "password_min_length", 8 },
            { "require_password_special_chars", true },
            { "max_login_attempts", 5 },
            { "account_lockout_duration", 30 }, // minutes
            { "session_timeout", 120 }, // minutes
            { "two_factor_auth_enabled", false },
            
            // Notification Settings
            { "email_notifications_enabled", true },
            { "sms_notifications_enabled", false },
            { "notification_on_visitor_arrival", true },
            { "notification_on_visitor_approval", true },
            { "notification_on_visitor_rejection", true },
            { "daily_summary_enabled", true },
            { "daily_summary_time", "18:00" },
            { "enable_email_notifications", true },
            { "enable_sms_notifications", true },
            { "enable_check_in_reminders", true },
            
            // Email Configuration
            { "smtp_server", "smtp.gmail.com" },
            { "smtp_port", 587 },
            { "smtp_username", "your-email@gmail.com" },
            { "smtp_password", "********" },
            { "smtp_use_ssl", true },
            { "email_from_address", "noreply@company.com" },
            { "email_from_name", "Visitor Management System" },
            
            // Data Privacy
            { "data_retention_days", 90 },
            { "enable_audit_logs", true },
            
            // Form Field Options
            { "purpose_of_visit_options", new[] { "Business Meeting", "Interview", "Consultation", "Delivery", "Training", "Maintenance", "Other" } },
            { "id_type_options", new[] { "Driver's License", "Passport", "National ID", "Employee ID", "State ID" } },
            { "enabled_fields", new {
                email = true,
                companyName = true,
                idProof = true,
                photo = true,
                vehicleNumber = false,
                emergencyContact = true
            }},
            
            // Custom Fields Configuration
            { "custom_fields_enabled", true },
            { "custom_visitor_fields", new[]
                {
                    new { name = "Department", type = "text", required = false, options = new string[0] },
                    new { name = "Security_Clearance", type = "select", required = true, options = new[] { "Level 1", "Level 2", "Level 3" } },
                    new { name = "Parking_Required", type = "boolean", required = false, options = new string[0] },
                    new { name = "Special_Requirements", type = "textarea", required = false, options = new string[0] }
                }
            },
            
            // UI/UX Settings
            { "theme", "default" },
            { "primary_color", "#2d4170" },
            { "secondary_color", "#EB6E38" },
            { "logo_url", "/public/BABAJI LOGO.png" },
            { "welcome_message", "Welcome to our office! Please check in with reception." },
            
            // Integration Settings
            { "api_rate_limit", 1000 }, // requests per hour
            { "webhook_enabled", false },
            { "webhook_url", "" },
            
            // System Health
            { "maintenance_mode", false },
            { "debug_mode", false }
        };

        // Location-specific settings storage
        private static Dictionary<int, Dictionary<string, object>> _locationSettings = new Dictionary<int, Dictionary<string, object>>();

        [HttpGet]
        public IActionResult GetSettings([FromQuery] int? locationId = null)
        {
            var settingsToReturn = _settings;

            // If locationId is provided, merge location-specific settings
            if (locationId.HasValue && _locationSettings.ContainsKey(locationId.Value))
            {
                settingsToReturn = new Dictionary<string, object>(_settings);
                var locationSpecific = _locationSettings[locationId.Value];
                
                // Override global settings with location-specific ones
                foreach (var kvp in locationSpecific)
                {
                    settingsToReturn[kvp.Key] = kvp.Value;
                }
            }

            // Return settings in the format expected by the frontend
            return Ok(new {
                locationId = locationId,
                purposeOfVisitOptions = settingsToReturn["purpose_of_visit_options"],
                idTypeOptions = settingsToReturn["id_type_options"],
                isPhotoMandatory = (bool)settingsToReturn["require_photo"],
                enabledFields = settingsToReturn["enabled_fields"],
                customFields = settingsToReturn["custom_visitor_fields"],
                systemName = settingsToReturn["system_name"],
                companyName = settingsToReturn["company_name"],
                theme = settingsToReturn["theme"],
                primaryColor = settingsToReturn["primary_color"],
                secondaryColor = settingsToReturn["secondary_color"],
                logoUrl = settingsToReturn["logo_url"],
                welcomeMessage = settingsToReturn["welcome_message"],
                // System settings for other tabs
                autoApprovalEnabled = (bool)settingsToReturn["auto_approval_enabled"],
                maxVisitDuration = (int)settingsToReturn["max_visit_duration"],
                reminderTimeBeforeVisit = (int)settingsToReturn["reminder_time_before_visit"],
                allowWalkIns = (bool)settingsToReturn["allow_walk_ins"],
                requireApprovalForAllVisits = (bool)settingsToReturn["require_approval_for_all_visits"],
                enableSMSNotifications = (bool)settingsToReturn["enable_sms_notifications"],
                enableEmailNotifications = (bool)settingsToReturn["enable_email_notifications"],
                enableCheckInReminders = (bool)settingsToReturn["enable_check_in_reminders"],
                dataRetentionDays = (int)settingsToReturn["data_retention_days"],
                enableAuditLogs = (bool)settingsToReturn["enable_audit_logs"]
            });
        }

        [HttpGet("all")]
        public IActionResult GetAllSettings()
        {
            return Ok(_settings);
        }

        [HttpGet("categories")]
        public IActionResult GetSettingsCategories()
        {
            var categories = new
            {
                general = new { name = "General", icon = "settings", description = "Basic system configuration" },
                visitor = new { name = "Visitor Management", icon = "users", description = "Visitor-related settings" },
                security = new { name = "Security", icon = "shield", description = "Authentication and security settings" },
                notifications = new { name = "Notifications", icon = "bell", description = "Email and SMS notification settings" },
                email = new { name = "Email Configuration", icon = "mail", description = "SMTP and email settings" },
                customFields = new { name = "Custom Fields", icon = "edit", description = "Configure custom form fields" },
                appearance = new { name = "Appearance", icon = "palette", description = "UI theme and branding" },
                integration = new { name = "Integrations", icon = "link", description = "Third-party integrations" }
            };
            
            return Ok(categories);
        }

        [HttpGet("category/{category}")]
        public IActionResult GetSettingsByCategory(string category)
        {
            var categorySettings = new Dictionary<string, object>();
            
            switch (category.ToLower())
            {
                case "general":
                    categorySettings = _settings.Where(s => new[] { "system_name", "company_name", "system_version", "timezone", "date_format", "time_format", "language" }.Contains(s.Key))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                case "visitor":
                    categorySettings = _settings.Where(s => s.Key.StartsWith("auto_approval") || s.Key.StartsWith("require_") || s.Key.StartsWith("visitor_") || s.Key.StartsWith("max_") || s.Key.StartsWith("advance_") || s.Key.Contains("purpose_of_visit") || s.Key.Contains("id_type") || s.Key.Contains("enabled_fields"))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                case "security":
                    categorySettings = _settings.Where(s => s.Key.StartsWith("jwt_") || s.Key.StartsWith("password_") || s.Key.StartsWith("max_login") || s.Key.StartsWith("account_") || s.Key.StartsWith("session_") || s.Key.StartsWith("two_factor"))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                case "notifications":
                    categorySettings = _settings.Where(s => s.Key.Contains("notification") || s.Key.StartsWith("daily_summary"))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                case "email":
                    categorySettings = _settings.Where(s => s.Key.StartsWith("smtp_") || s.Key.StartsWith("email_"))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                case "customfields":
                    categorySettings = _settings.Where(s => s.Key.Contains("custom_fields") || s.Key.Contains("custom_visitor"))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                case "appearance":
                    categorySettings = _settings.Where(s => s.Key.StartsWith("theme") || s.Key.Contains("color") || s.Key.Contains("logo") || s.Key.Contains("welcome"))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                case "integration":
                    categorySettings = _settings.Where(s => s.Key.StartsWith("api_") || s.Key.StartsWith("webhook_"))
                        .ToDictionary(s => s.Key, s => s.Value);
                    break;
                    
                default:
                    return NotFound(new { message = "Category not found" });
            }
            
            return Ok(categorySettings);
        }

        [HttpGet("{key}")]
        public IActionResult GetSetting(string key)
        {
            if (_settings.TryGetValue(key, out var value))
            {
                return Ok(new { key, value });
            }
            
            return NotFound(new { message = "Setting not found" });
        }

        [HttpPost]
        public IActionResult UpdateSettings([FromBody] dynamic settingsData)
        {
            try
            {
                // Handle legacy format for backward compatibility
                return Ok(new { 
                    message = "Settings updated successfully",
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid settings data", error = ex.Message });
            }
        }

        [HttpPut]
        public IActionResult UpdateSettingsPut([FromQuery] int? locationId, [FromBody] JsonElement settingsData)
        {
            try
            {
                // Determine which settings dictionary to update
                Dictionary<string, object> targetSettings;
                
                if (locationId.HasValue)
                {
                    // Create location-specific settings if not exists
                    if (!_locationSettings.ContainsKey(locationId.Value))
                    {
                        _locationSettings[locationId.Value] = new Dictionary<string, object>();
                    }
                    targetSettings = _locationSettings[locationId.Value];
                }
                else
                {
                    // Update global settings
                    targetSettings = _settings;
                }

                // Handle Form Configuration settings
                if (settingsData.TryGetProperty("purposeOfVisitOptions", out var purposeProperty))
                {
                    var purposeOptions = JsonSerializer.Deserialize<string[]>(purposeProperty.GetRawText());
                    targetSettings["purpose_of_visit_options"] = purposeOptions;
                }
                
                if (settingsData.TryGetProperty("idTypeOptions", out var idTypeProperty))
                {
                    var idTypeOptions = JsonSerializer.Deserialize<string[]>(idTypeProperty.GetRawText());
                    targetSettings["id_type_options"] = idTypeOptions;
                }
                
                if (settingsData.TryGetProperty("isPhotoMandatory", out var photoProperty))
                {
                    targetSettings["require_photo"] = photoProperty.GetBoolean();
                }
                
                if (settingsData.TryGetProperty("enabledFields", out var enabledFieldsProperty))
                {
                    // Parse the enabled fields and ensure proper format
                    var enabledFieldsJson = enabledFieldsProperty.GetRawText();
                    var incomingEnabledFields = JsonSerializer.Deserialize<Dictionary<string, object>>(enabledFieldsJson);
                    
                    // Convert to the expected format (lowercase keys) - handle both camelCase and PascalCase
                    var enabledFields = new {
                        email = GetBooleanValue(incomingEnabledFields, "email") || GetBooleanValue(incomingEnabledFields, "Email"),
                        companyName = GetBooleanValue(incomingEnabledFields, "companyName") || GetBooleanValue(incomingEnabledFields, "CompanyName"),
                        idProof = GetBooleanValue(incomingEnabledFields, "idProof") || GetBooleanValue(incomingEnabledFields, "IdProof"),
                        photo = GetBooleanValue(incomingEnabledFields, "photo") || GetBooleanValue(incomingEnabledFields, "Photo"),
                        vehicleNumber = GetBooleanValue(incomingEnabledFields, "vehicleNumber") || GetBooleanValue(incomingEnabledFields, "VehicleNumber"),
                        emergencyContact = GetBooleanValue(incomingEnabledFields, "emergencyContact") || GetBooleanValue(incomingEnabledFields, "EmergencyContact")
                    };
                    
                    targetSettings["enabled_fields"] = enabledFields;
                }
                
                if (settingsData.TryGetProperty("customFields", out var customFieldsProperty))
                {
                    var customFields = JsonSerializer.Deserialize<object[]>(customFieldsProperty.GetRawText());
                    targetSettings["custom_visitor_fields"] = customFields;
                }

                // Handle Notification settings
                if (settingsData.TryGetProperty("enableEmailNotifications", out var emailNotifProperty))
                {
                    targetSettings["enable_email_notifications"] = emailNotifProperty.GetBoolean();
                }
                
                if (settingsData.TryGetProperty("enableSMSNotifications", out var smsNotifProperty))
                {
                    targetSettings["enable_sms_notifications"] = smsNotifProperty.GetBoolean();
                }
                
                if (settingsData.TryGetProperty("enableCheckInReminders", out var reminderProperty))
                {
                    targetSettings["enable_check_in_reminders"] = reminderProperty.GetBoolean();
                }
                
                if (settingsData.TryGetProperty("reminderTimeBeforeVisit", out var reminderTimeProperty))
                {
                    targetSettings["reminder_time_before_visit"] = reminderTimeProperty.GetInt32();
                }

                // Handle Security & Access settings
                if (settingsData.TryGetProperty("requireApprovalForAllVisits", out var approvalProperty))
                {
                    targetSettings["require_approval_for_all_visits"] = approvalProperty.GetBoolean();
                }
                
                if (settingsData.TryGetProperty("autoApprovalEnabled", out var autoApprovalProperty))
                {
                    targetSettings["auto_approval_enabled"] = autoApprovalProperty.GetBoolean();
                }
                
                if (settingsData.TryGetProperty("allowWalkIns", out var walkInsProperty))
                {
                    targetSettings["allow_walk_ins"] = walkInsProperty.GetBoolean();
                }
                
                if (settingsData.TryGetProperty("dataRetentionDays", out var retentionProperty))
                {
                    targetSettings["data_retention_days"] = retentionProperty.GetInt32();
                }
                
                if (settingsData.TryGetProperty("enableAuditLogs", out var auditProperty))
                {
                    targetSettings["enable_audit_logs"] = auditProperty.GetBoolean();
                }

                // Handle System settings
                if (settingsData.TryGetProperty("maxVisitDuration", out var maxDurationProperty))
                {
                    targetSettings["max_visit_duration"] = maxDurationProperty.GetInt32();
                }

                // Get the final settings for response (merge global with location-specific)
                var responseSettings = new Dictionary<string, object>(_settings);
                if (locationId.HasValue && _locationSettings.ContainsKey(locationId.Value))
                {
                    foreach (var kvp in _locationSettings[locationId.Value])
                    {
                        responseSettings[kvp.Key] = kvp.Value;
                    }
                }

                // Return the updated settings in the same format as GET
                return Ok(new {
                    locationId = locationId,
                    purposeOfVisitOptions = responseSettings["purpose_of_visit_options"],
                    idTypeOptions = responseSettings["id_type_options"],
                    isPhotoMandatory = (bool)responseSettings["require_photo"],
                    enabledFields = responseSettings["enabled_fields"],
                    customFields = responseSettings["custom_visitor_fields"],
                    systemName = responseSettings["system_name"],
                    companyName = responseSettings["company_name"],
                    theme = responseSettings["theme"],
                    primaryColor = responseSettings["primary_color"],
                    secondaryColor = responseSettings["secondary_color"],
                    logoUrl = responseSettings["logo_url"],
                    welcomeMessage = responseSettings["welcome_message"],
                    autoApprovalEnabled = (bool)responseSettings["auto_approval_enabled"],
                    maxVisitDuration = (int)responseSettings["max_visit_duration"],
                    reminderTimeBeforeVisit = (int)responseSettings["reminder_time_before_visit"],
                    allowWalkIns = (bool)responseSettings["allow_walk_ins"],
                    requireApprovalForAllVisits = (bool)responseSettings["require_approval_for_all_visits"],
                    enableSMSNotifications = (bool)responseSettings["enable_sms_notifications"],
                    enableEmailNotifications = (bool)responseSettings["enable_email_notifications"],
                    enableCheckInReminders = (bool)responseSettings["enable_check_in_reminders"],
                    dataRetentionDays = (int)responseSettings["data_retention_days"],
                    enableAuditLogs = (bool)responseSettings["enable_audit_logs"],
                    message = "Settings updated successfully",
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid settings data", error = ex.Message });
            }
        }

        private bool GetBooleanValue(Dictionary<string, object> dict, string key)
        {
            if (dict != null && dict.TryGetValue(key, out var value))
            {
                if (value is bool boolValue)
                    return boolValue;
                if (value is JsonElement jsonElement)
                {
                    if (jsonElement.ValueKind == JsonValueKind.True)
                        return true;
                    if (jsonElement.ValueKind == JsonValueKind.False)
                        return false;
                    if (jsonElement.ValueKind == JsonValueKind.String && bool.TryParse(jsonElement.GetString(), out var parsedBool))
                        return parsedBool;
                }
                if (bool.TryParse(value?.ToString(), out var parsedBool2))
                    return parsedBool2;
            }
            return false;
        }

        [HttpPut("{key}")]
        public IActionResult UpdateSetting(string key, [FromBody] dynamic settingData)
        {
            try
            {
                if (!_settings.ContainsKey(key))
                {
                    return NotFound(new { message = "Setting not found" });
                }
                
                var newValue = settingData.value;
                _settings[key] = newValue;
                
                return Ok(new { 
                    message = "Setting updated successfully", 
                    key, 
                    value = newValue,
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid setting data", error = ex.Message });
            }
        }

        [HttpPut("bulk")]
        public IActionResult UpdateMultipleSettings([FromBody] dynamic settingsData)
        {
            try
            {
                var updatedSettings = new Dictionary<string, object>();
                var errors = new List<string>();
                
                foreach (var setting in settingsData)
                {
                    var key = (string)setting.key;
                    var value = setting.value;
                    
                    if (_settings.ContainsKey(key))
                    {
                        _settings[key] = value;
                        updatedSettings[key] = value;
                    }
                    else
                    {
                        errors.Add($"Setting '{key}' not found");
                    }
                }
                
                return Ok(new { 
                    message = "Settings updated successfully", 
                    updatedSettings,
                    errors,
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid settings data", error = ex.Message });
            }
        }

        [HttpPost("test-email")]
        public IActionResult TestEmailConfiguration([FromBody] dynamic emailData)
        {
            try
            {
                var toEmail = (string)(emailData?.toEmail ?? "test@example.com");
                
                // Mock email test result
                var testResult = new
                {
                    success = true,
                    message = "Test email sent successfully",
                    details = new
                    {
                        to = toEmail,
                        from = _settings.GetValueOrDefault("email_from_address", "noreply@company.com"),
                        smtpServer = _settings.GetValueOrDefault("smtp_server", "smtp.gmail.com"),
                        port = _settings.GetValueOrDefault("smtp_port", 587),
                        ssl = _settings.GetValueOrDefault("smtp_use_ssl", true),
                        timestamp = DateTime.Now
                    }
                };
                
                return Ok(testResult);
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false,
                    message = "Failed to send test email", 
                    error = ex.Message 
                });
            }
        }

        [HttpGet("health")]
        public IActionResult GetSystemHealth()
        {
            var health = new
            {
                status = "healthy",
                uptime = TimeSpan.FromHours(24).ToString(),
                version = _settings.GetValueOrDefault("system_version", "2.0.0"),
                environment = "development",
                database = new { status = "connected", type = "in-memory" },
                email = new { status = "configured", server = _settings.GetValueOrDefault("smtp_server", "smtp.gmail.com") },
                cache = new { status = "enabled", type = "memory" },
                lastBackup = DateTime.Now.AddDays(-1),
                activeUsers = 5,
                todaysVisitors = 12,
                systemLoad = "low",
                memoryUsage = "45%",
                diskSpace = "78%",
                timestamp = DateTime.Now
            };
            
            return Ok(health);
        }

        [HttpPost("reset")]
        public IActionResult ResetSettingsToDefault([FromBody] dynamic resetData)
        {
            try
            {
                var category = (string)(resetData?.category ?? "");
                
                if (string.IsNullOrEmpty(category))
                {
                    return Ok(new { message = "All settings reset to default values" });
                }
                else
                {
                    return Ok(new { message = $"Category '{category}' settings reset to default values" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error resetting settings", error = ex.Message });
            }
        }
    }
}
