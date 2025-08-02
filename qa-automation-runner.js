#!/usr/bin/env node

/**
 * Comprehensive Automated QA Runner
 * Orchestrates multiple testing approaches and generates detailed reports
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
    testScripts: [
        {
            name: 'Integration Test Suite',
            command: 'node test-integration.js',
            type: 'integration',
            timeout: 30000
        },
        {
            name: 'Enhanced QA Suite',
            command: 'node automated-qa-suite.js',
            type: 'comprehensive',
            timeout: 60000
        },
        {
            name: 'PowerShell API Tests',
            command: 'powershell -ExecutionPolicy Bypass -File "simple-qa-powershell.ps1"',
            type: 'api',
            timeout: 45000
        }
    ],
    outputDir: './qa-reports',
    generateHtmlReport: true,
    runConcurrent: false
};

// Utility functions
const log = (message, color = 'reset') => {
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const info = (message) => log(`ℹ️  ${message}`, 'cyan');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');

// Test execution functions
async function runCommand(command, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const child = exec(command, { timeout });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout?.on('data', (data) => {
            stdout += data;
        });
        
        child.stderr?.on('data', (data) => {
            stderr += data;
        });
        
        child.on('close', (code) => {
            const duration = Date.now() - startTime;
            resolve({
                success: code === 0,
                code,
                stdout,
                stderr,
                duration,
                command
            });
        });
        
        child.on('error', (err) => {
            const duration = Date.now() - startTime;
            reject({
                success: false,
                error: err.message,
                duration,
                command
            });
        });
    });
}

async function runTestScript(script) {
    info(`Running ${script.name}...`);
    
    try {
        const result = await runCommand(script.command, script.timeout);
        
        if (result.success) {
            success(`${script.name} completed successfully (${result.duration}ms)`);
        } else {
            error(`${script.name} failed with exit code ${result.code} (${result.duration}ms)`);
        }
        
        return {
            ...script,
            ...result,
            timestamp: new Date().toISOString()
        };
    } catch (err) {
        error(`${script.name} encountered an error: ${err.error || err.message}`);
        return {
            ...script,
            success: false,
            error: err.error || err.message,
            duration: err.duration || 0,
            timestamp: new Date().toISOString()
        };
    }
}

// Report generation
async function generateReport(results) {
    try {
        await fs.mkdir(config.outputDir, { recursive: true });
    } catch (err) {
        // Directory might already exist
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            passed: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
        },
        results,
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            cwd: process.cwd()
        }
    };
    
    // Generate JSON report
    const jsonPath = path.join(config.outputDir, `qa-report-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2));
    success(`JSON report saved: ${jsonPath}`);
    
    // Generate HTML report if enabled
    if (config.generateHtmlReport) {
        const htmlPath = path.join(config.outputDir, `qa-report-${timestamp}.html`);
        const htmlContent = generateHtmlReport(reportData);
        await fs.writeFile(htmlPath, htmlContent);
        success(`HTML report saved: ${htmlPath}`);
    }
    
    // Generate summary report
    const summaryPath = path.join(config.outputDir, 'latest-summary.txt');
    const summaryContent = generateSummaryReport(reportData);
    await fs.writeFile(summaryPath, summaryContent);
    success(`Summary report saved: ${summaryPath}`);
    
    return reportData;
}

function generateHtmlReport(data) {
    const { summary, results, timestamp } = data;
    const passRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Test Report - ${timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0; font-size: 2em; }
        .metric p { margin: 5px 0 0 0; color: #666; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .warning { color: #ffc107; }
        .test-results { margin-top: 30px; }
        .test-item { margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid #ccc; }
        .test-pass { border-left-color: #28a745; background-color: #f8fff9; }
        .test-fail { border-left-color: #dc3545; background-color: #fff8f8; }
        .test-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .test-name { font-weight: bold; font-size: 1.1em; }
        .test-duration { color: #666; font-size: 0.9em; }
        .test-output { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.85em; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Automated QA Test Report</h1>
            <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3 class="${summary.passed === summary.total ? 'pass' : 'warning'}">${passRate}%</h3>
                <p>Pass Rate</p>
            </div>
            <div class="metric">
                <h3 class="pass">${summary.passed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="metric">
                <h3 class="fail">${summary.failed}</h3>
                <p>Tests Failed</p>
            </div>
            <div class="metric">
                <h3>${(summary.totalDuration / 1000).toFixed(1)}s</h3>
                <p>Total Duration</p>
            </div>
        </div>
        
        <div class="test-results">
            <h2>Test Results</h2>
            ${results.map(result => `
                <div class="test-item ${result.success ? 'test-pass' : 'test-fail'}">
                    <div class="test-header">
                        <span class="test-name">${result.success ? '✅' : '❌'} ${result.name}</span>
                        <span class="test-duration">${(result.duration / 1000).toFixed(2)}s</span>
                    </div>
                    <p><strong>Type:</strong> ${result.type}</p>
                    <p><strong>Command:</strong> <code>${result.command}</code></p>
                    ${result.success ? '' : `<p><strong>Exit Code:</strong> ${result.code || 'N/A'}</p>`}
                    ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
                    ${result.stdout ? `
                        <details>
                            <summary>Output</summary>
                            <div class="test-output">${result.stdout}</div>
                        </details>
                    ` : ''}
                    ${result.stderr ? `
                        <details>
                            <summary>Error Output</summary>  
                            <div class="test-output">${result.stderr}</div>
                        </details>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Report generated by Automated QA System | Node.js ${process.version} | ${process.platform}</p>
        </div>
    </div>
</body>
</html>`;
}

function generateSummaryReport(data) {
    const { summary, results, timestamp } = data;
    const passRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    let report = `AUTOMATED QA TEST SUMMARY
========================
Generated: ${new Date(timestamp).toLocaleString()}

OVERALL RESULTS:
- Total Tests: ${summary.total}
- Passed: ${summary.passed}
- Failed: ${summary.failed}
- Pass Rate: ${passRate}%
- Total Duration: ${(summary.totalDuration / 1000).toFixed(1)} seconds

INDIVIDUAL TEST RESULTS:
`;
    
    results.forEach(result => {
        const status = result.success ? 'PASS' : 'FAIL';
        const duration = (result.duration / 1000).toFixed(2);
        report += `${status.padEnd(4)} - ${result.name} (${duration}s)\n`;
        
        if (!result.success) {
            report += `       Error: ${result.error || 'Exit code ' + result.code}\n`;
        }
    });
    
    report += `
ASSESSMENT:
`;
    
    if (summary.passed === summary.total) {
        report += `🎉 ALL TESTS PASSED! System is ready for production deployment.`;
    } else if (passRate >= 80) {
        report += `⚠️  Most tests passed (${passRate}%). Review failed tests before deployment.`;
    } else {
        report += `❌ Multiple test failures (${passRate}% pass rate). System needs attention.`;
    }
    
    return report;
}

// Main execution
async function runAutomatedQA() {
    log('\n🤖 COMPREHENSIVE AUTOMATED QA SYSTEM', 'bright');
    log('==========================================', 'blue');
    info('Starting comprehensive quality assurance testing...');
    
    const startTime = Date.now();
    const results = [];
    
    if (config.runConcurrent) {
        // Run tests concurrently
        info('Running tests concurrently...');
        const promises = config.testScripts.map(script => runTestScript(script));
        const concurrentResults = await Promise.allSettled(promises);
        
        concurrentResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    ...config.testScripts[index],
                    success: false,
                    error: result.reason.message,
                    duration: 0,
                    timestamp: new Date().toISOString()
                });
            }
        });
    } else {
        // Run tests sequentially
        info('Running tests sequentially...');
        for (const script of config.testScripts) {
            const result = await runTestScript(script);
            results.push(result);
        }
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Generate reports
    info('Generating test reports...');
    const reportData = await generateReport(results);
    
    // Console summary
    log('\n📊 FINAL SUMMARY', 'bright');
    log('==========================================', 'blue');
    
    const { summary } = reportData;
    const passRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    log(`Total Tests: ${summary.total}`);
    log(`Passed: ${summary.passed}`, summary.passed === summary.total ? 'green' : 'yellow');
    log(`Failed: ${summary.failed}`, summary.failed === 0 ? 'green' : 'red');
    log(`Pass Rate: ${passRate}%`, passRate === '100.0' ? 'green' : passRate >= '80.0' ? 'yellow' : 'red');
    log(`Total Duration: ${(totalDuration / 1000).toFixed(1)} seconds`);
    
    log('\n🏆 ASSESSMENT:', 'bright');
    if (summary.passed === summary.total) {
        log('🎉 ALL TESTS PASSED! System is fully validated and ready for production deployment.', 'green');
    } else if (passRate >= 80) {
        log(`⚠️  ${passRate}% of tests passed. Review failed tests before deployment.`, 'yellow');
    } else {
        log(`❌ Only ${passRate}% of tests passed. System requires attention before deployment.`, 'red');
    }
    
    return summary.passed === summary.total;
}

// Export for programmatic use
module.exports = {
    runAutomatedQA,
    generateReport,
    runTestScript
};

// Run if called directly
if (require.main === module) {
    runAutomatedQA()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(err => {
            error(`QA System Error: ${err.message}`);
            process.exit(1);
        });
}
