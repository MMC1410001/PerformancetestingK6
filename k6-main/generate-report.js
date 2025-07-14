const fs = require('fs');            // To interact with any file 
const path = require('path');        // To pass folder and file loactions
const ExcelJS = require('exceljs');  // In built package to interact with excel from code
const { ChartJSNodeCanvas } = require('chartjs-node-canvas'); // Inbuilt package for Generating charts
const { generateCharts } = require('./config'); // Ensure generateCharts is true in config.js

// Determine resultPath: use command line argument or default
const resultPath = process.argv[2] || path.join('output', 'default_test', 'result.json'); // Added a more robust default
const reportDir = path.dirname(resultPath);
const resultName = path.basename(reportDir); // This will be the name of the parent folder of result.json

async function generateExcelReport() {
  console.log(`[Excel Gen] Attempting to read result file for Excel: ${resultPath}`);
  if (!fs.existsSync(resultPath)) {
    console.error(`[Excel Gen] ❌ Result file not found: ${resultPath}`);
    return;
  }

  try {
    const result = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('K6 Summary');

    sheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Threshold Status', key: 'status', width: 15 },
    ];

    const metrics = result.metrics || {};
    sheet.addRow({ metric: 'Test Name', value: resultName });
    sheet.addRow({}); // Empty row for spacing

    sheet.addRows([
      { metric: 'Total VUs x Duration', value: `${result.root_group?.options?.vus || 'N/A'} VUs x ${result.root_group?.options?.duration || 'N/A'}` }, // to document how many virtual users were simulated and for how long. //metric: This column will show the label 'Total VUs x Duration'. ; value: This dynamically constructs a string from test results ; ${result.root_group?.options?.vus || 'N/A'} gets the number of Virtual Users (VUs). If not available, it defaults to 'N/A'.; ${result.root_group?.options?.duration || 'N/A'} gets the test duration (e.g., 1m, 30s). Again, if not set, it defaults to 'N/A'. ; The final string might look like "50 VUs x 1m" or "N/A VUs x N/A".
      { metric: 'Total Iterations', value: metrics.iterations?.values?.count || metrics.iterations?.count || 0 },
      { metric: 'Total HTTP Requests', value: metrics.http_reqs?.values?.count || metrics.http_reqs?.count || 0 },
      { metric: 'Total Data Sent', value: `${(metrics.data_sent?.values?.count / (1024*1024) || metrics.data_sent?.count / (1024*1024) || 0).toFixed(2)} MB` },  //Division by (1024 * 1024) -> This converts bytes to megabytes.
      { metric: 'Total Data Received', value: `${(metrics.data_received?.values?.count / (1024*1024) || metrics.data_received?.count / (1024*1024) || 0).toFixed(2)} MB` },
      { metric: 'Blocked Time (avg)', value: `${metrics.http_req_blocking?.values?.avg?.toFixed(2) || metrics.http_req_blocking?.avg?.toFixed(2) || 'N/A'} ms` },
      { metric: 'Connecting Time (avg)', value: `${metrics.http_req_connecting?.values?.avg?.toFixed(2) || metrics.http_req_connecting?.avg?.toFixed(2) || 'N/A'} ms` },
      { metric: 'TLS Handshaking Time (avg)', value: `${metrics.http_req_tls_handshaking?.values?.avg?.toFixed(2) || metrics.http_req_tls_handshaking?.avg?.toFixed(2) || 'N/A'} ms` },
      { metric: 'Sending Time (avg)', value: `${metrics.http_req_sending?.values?.avg?.toFixed(2) || metrics.http_req_sending?.avg?.toFixed(2) || 'N/A'} ms` },
      { metric: 'Waiting Time (avg) / TTFB', value: `${metrics.http_req_waiting?.values?.avg?.toFixed(2) || metrics.http_req_waiting?.avg?.toFixed(2) || 'N/A'} ms` },
      { metric: 'Receiving Time (avg)', value: `${metrics.http_req_receiving?.values?.avg?.toFixed(2) || metrics.http_req_receiving?.avg?.toFixed(2) || 'N/A'} ms` },
    ]);
    sheet.addRow({}); // Empty row for spacing

    // Custom metrics from your test script
    sheet.addRows([
        { metric: 'Custom: Total Successes (checks)', value: metrics.success_count?.values?.count || metrics.success_count?.count || 0 },
        { metric: 'Custom: Total Failures (checks)', value: metrics.fail_count?.values?.count || metrics.fail_count?.count || 0 },
        { metric: 'Custom: Success Rate (checks)', value: metrics.success_rate?.values?.rate !== undefined ? (metrics.success_rate.values.rate * 100).toFixed(2) + '%' : 
                                                          metrics.success_rate?.value !== undefined ? (metrics.success_rate.value * 100).toFixed(2) + '%' : 'N/A' },
    ]);
    sheet.addRow({}); // Empty row for spacing
    
    // Get HTTP duration metrics, handling both formats
    const httpDuration = metrics.http_req_duration;
    const httpValues = httpDuration?.values || httpDuration;
    
    sheet.addRows([
      { metric: 'HTTP Request Duration: Min', value: `${httpValues?.min?.toFixed(2) || 'N/A'} ms` },  // toFixed(2) is used to limit value upto 2 decimals only
      { metric: 'HTTP Request Duration: Avg', value: `${httpValues?.avg?.toFixed(2) || 'N/A'} ms` },
      { metric: 'HTTP Request Duration: Max', value: `${httpValues?.max?.toFixed(2) || 'N/A'} ms` },
      { metric: 'HTTP Request Duration: Median', value: `${httpValues?.med?.toFixed(2) || 'N/A'} ms` },
      { metric: 'HTTP Request Duration: p(90)', value: `${httpValues?.['p(90)']?.toFixed(2) || 'N/A'} ms` },
      { metric: 'HTTP Request Duration: p(95)', value: `${httpValues?.['p(95)']?.toFixed(2) || 'N/A'} ms` },
      { metric: 'HTTP Request Duration: p(99)', value: `${httpValues?.['p(99)']?.toFixed(2) || 'N/A'} ms` },
    ]);
    sheet.addRow({});// Empty row for spacing
    
    // Handle both formats for http_req_failed -> This line ensures your script can robustly extract the HTTP request failure rate, regardless of how the K6 output is formatted.👇 Output Example: If rate is present: → failedRate = 0.01 ; If only value is present: → failedRate = 0.01 ; If neither is present: → failedRate = undefined
    const failedRate = metrics.http_req_failed?.values?.rate !== undefined ? metrics.http_req_failed.values.rate : 
                      metrics.http_req_failed?.value !== undefined ? metrics.http_req_failed.value : undefined;
    
    sheet.addRow({ 
      metric: 'HTTP Failed Requests Rate', 
      value: failedRate !== undefined ? (failedRate * 100).toFixed(2) + '%' : 'N/A' 
    });
    sheet.addRow({}); // Empty row for spacing

    // Thresholds
    sheet.addRow({ metric: 'Thresholds Summary', value: '', status: '' }).font = { bold: true };    // Adds a header row in the sheet with bold text.
    if (result.metrics) {                                                              // k6 stores threshold results within each metric //Checks if any metrics exist in the test result.
        for (const metricName in result.metrics) {                                    //Loops over each metric (like http_req_duration, http_req_failed, etc.).
             if (result.metrics[metricName].thresholds) {                             // Checks if that metric contains thresholds (which is where K6 stores pass/fail test results for that metric).
                for (const thName in result.metrics[metricName].thresholds) {        //Loops over all threshold rules defined for that metric.
                    const thOk = result.metrics[metricName].thresholds[thName].ok;   // ok is a boolean: true means the threshold passed ; false means it failed
                    sheet.addRow({                                                   //Adds a row for each threshold rule, indicating:
                        metric: `Threshold: ${metricName} (${thName})`,              // Which metric and threshold it refers to
                        value: thOk ? 'PASSED' : 'FAILED',                           // Whether it passed or failed
                        status: thOk ? '✅' : '❌'                                  //A checkmark or cross emoji for quick visual feedback
                    });
                }
            }
        }
    } else {
        sheet.addRow({ metric: 'No threshold data found in metrics.', value: '' });
    }

    const excelPath = path.join(reportDir, `${resultName}_K6_summary_report.xlsx`);
    await workbook.xlsx.writeFile(excelPath);
    console.log(`[Excel Gen] ✅ Excel report saved: ${excelPath}`);
  } catch (error) {
    console.error(`[Excel Gen] ❌ Error generating Excel report: ${error.message}`, error.stack);
  }
}

async function generateChartsIfNeeded() {
  console.log('[Chart Gen] Checking if charts should be generated...');
  console.log(`[Chart Gen] generateCharts config value from config.js: ${generateCharts}`);

  if (!generateCharts) {
    console.log('[Chart Gen] generateCharts is false. Skipping chart generation.');
    return;
  }

  console.log(`[Chart Gen] Attempting to read result file for charts: ${resultPath}`);
  if (!fs.existsSync(resultPath)) {
    console.error(`[Chart Gen] ❌ Result file not found, cannot generate charts: ${resultPath}`);
    return;
  }

  try {
    const raw = fs.readFileSync(resultPath, 'utf-8');
    const data = JSON.parse(raw);

    const chartDir = path.join(reportDir, 'charts');
    console.log(`[Chart Gen] Chart directory will be: ${chartDir}`);
    if (!fs.existsSync(chartDir)) {
        fs.mkdirSync(chartDir, { recursive: true });
        console.log(`[Chart Gen] Created chart directory: ${chartDir}`);
    }

    const width = 800, height = 450;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width,
        height,
        chartCallback: (ChartJS) => {
            ChartJS.defaults.responsive = true;
            ChartJS.defaults.maintainAspectRatio = false;
        }
    });

    // Get HTTP request duration metrics
    const httpMetric = data.metrics?.http_req_duration;
    console.log('[Chart Gen] http_req_duration metric from JSON:', httpMetric ? 'Found' : 'Not Found');
    
    if (httpMetric) {
      // Get metrics from either direct properties or nested under 'values'
      const metricsSource = httpMetric.values || httpMetric;
      
      console.log('[Chart Gen] Creating HTTP Request Duration chart');
      const responseTimeChartConfig = {
        type: 'bar',
        data: {
          labels: ['min', 'avg', 'med', 'max', 'p(90)', 'p(95)'],
          datasets: [{
            label: 'HTTP Request Duration (ms)',
            data: [
              metricsSource.min,
              metricsSource.avg,
              metricsSource.med,
              metricsSource.max,
              metricsSource['p(90)'],
              metricsSource['p(95)']
            ].map(val => val !== undefined ? parseFloat(val).toFixed(2) : 0),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `HTTP Request Duration Summary - ${resultName}`,
              font: { size: 18 }
            },
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y} ms`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Duration (ms)',
                font: { size: 14 }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Metric Type',
                font: { size: 14 }
              }
            }
          }
        }
      };

      const bufferRespTime = await chartJSNodeCanvas.renderToBuffer(responseTimeChartConfig);
      const chartPathRespTime = path.join(chartDir, `${resultName}_response_time_summary.png`);
      fs.writeFileSync(chartPathRespTime, bufferRespTime);
      console.log(`[Chart Gen] 📊 Response Time Summary chart saved: ${chartPathRespTime}`);
    } else {
      console.warn('[Chart Gen] http_req_duration metric not found. Skipping response time summary chart.');
    }

    // Check for success/failure rate metrics
    const successRate = data.metrics?.success_rate;
    const failureRate = data.metrics?.failure_rate;
    
    console.log('[Chart Gen] success_rate metric from JSON:', successRate ? 'Found' : 'Not Found');
    console.log('[Chart Gen] failure_rate metric from JSON:', failureRate ? 'Found' : 'Not Found');
    
    if (successRate && failureRate) {
      // Get values from either direct properties or nested under 'values'
      const successValue = successRate.value !== undefined ? successRate.value : 
                          successRate.values?.rate !== undefined ? successRate.values.rate : 0;
      
      const failValue = failureRate.value !== undefined ? failureRate.value : 
                       failureRate.values?.rate !== undefined ? failureRate.values.rate : 0;
      
      console.log('[Chart Gen] Creating Success/Failure Rate chart');
      const checksRateChartConfig = {
        type: 'doughnut',
        data: {
          labels: ['Successful Checks', 'Failed Checks'],
          datasets: [{
            label: 'Check Success Rate',
            data: [
              successValue * 100,
              (1 - successValue) * 100
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 99, 132, 0.7)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Check Success vs. Failure Rate - ${resultName}`,
              font: { size: 18 }
            },
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed}%`;
                }
              }
            }
          }
        }
      };

      const bufferChecksRate = await chartJSNodeCanvas.renderToBuffer(checksRateChartConfig);    // ChartJS Node Canvas (a server-side rendering tool for Chart.js) to generate a chart image buffer based on a provided configuration object. renderToBuffer() -> This method takes a Chart.js configuration object and renders it into an image in-memory (not saved to disk). The result is a Node.js Buffer representing the image (typically in PNG format).
      const chartPathChecksRate = path.join(chartDir, `${resultName}_checks_success_rate.png`);
      fs.writeFileSync(chartPathChecksRate, bufferChecksRate);
      console.log(`[Chart Gen] 📊 Checks Success Rate chart saved: ${chartPathChecksRate}`);
    } else {
      console.warn('[Chart Gen] success_rate or failure_rate data not found. Skipping checks success rate chart.');
    }

  } catch (error) {
    console.error(`[Chart Gen] ❌ Error during chart generation process: ${error.message}`, error.stack);
  }
}

(async () => {
  try {
    await generateExcelReport();
    await generateChartsIfNeeded();
    console.log('✅ Reporting process completed.');
  } catch (err) {
    console.error(`🔥 Unexpected error in generate-report.js main execution: ${err.message}`, err.stack);
    process.exit(1); // Exit with error if the main reporting process fails catastrophically
  }
})();