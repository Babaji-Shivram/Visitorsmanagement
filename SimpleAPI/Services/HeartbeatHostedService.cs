using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SimpleAPI.Services
{
    public class HeartbeatHostedService : BackgroundService
    {
        private readonly ILogger<HeartbeatHostedService> _logger;
        public HeartbeatHostedService(ILogger<HeartbeatHostedService> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[Heartbeat] Service started at {time}", DateTime.UtcNow);
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("[Heartbeat] API alive at {time}", DateTime.UtcNow);
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                }
                catch (TaskCanceledException) { }
            }
            _logger.LogInformation("[Heartbeat] Service stopping at {time}", DateTime.UtcNow);
        }
    }
}
