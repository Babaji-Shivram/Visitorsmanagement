import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Comprehensive Automated QA Runner
 * Orchestrates multiple testing approaches and generates detailed reports
 */

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
    
    // Generate summary report
    const summaryPath = path.join(config.outputDir, 'latest-summary.txt');
    const summaryContent = generateSummaryReport(reportData);
    await fs.writeFile(summaryPath, summaryContent);
    success(`Summary report saved: ${summaryPath}`);
    
    return reportData;
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
    
    // Run tests sequentially for better output readability
    info('Running tests sequentially...');
    for (const script of config.testScripts) {
        const result = await runTestScript(script);
        results.push(result);
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

// Run the comprehensive QA system
runAutomatedQA()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        error(`QA System Error: ${err.message}`);
        process.exit(1);
    });
