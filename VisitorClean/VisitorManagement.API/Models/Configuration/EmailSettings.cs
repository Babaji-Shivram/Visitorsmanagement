namespace VisitorManagement.API.Models.Configuration
{
    public class EmailSettings
    {
        public string SmtpServer { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public bool EnableSsl { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 30;
        
        // Exchange Server Specific Settings
        public bool UseExchangeWebServices { get; set; } = false;
        public string ExchangeServerUrl { get; set; } = string.Empty;
        public string ExchangeDomain { get; set; } = string.Empty;
        public ExchangeVersion ExchangeVersion { get; set; } = ExchangeVersion.Exchange2016;
    }

    public enum ExchangeVersion
    {
        Exchange2010,
        Exchange2010_SP1,
        Exchange2010_SP2,
        Exchange2013,
        Exchange2013_SP1,
        Exchange2016,
        Exchange2019,
        ExchangeOnline
    }
}
