# K6 Performance Testing Project

This project contains performance tests using Grafana K6 for testing various web applications and APIs.

## Local Setup

1. Install K6:
   - Windows: `winget install k6 --source winget`
   - macOS: `brew install k6`
   - Linux: `sudo apt-get install k6`

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your email credentials:
   ```
   ALERT_EMAIL_USER=email@example.com
   ALERT_EMAIL_PASS=your-app-password
   ```

4. Run all tests:
   ```
   node run-async-k6.js
   ```

## Running with Docker

You can run the tests using Docker:

```bash
# Set environment variables
export ALERT_EMAIL_USER=email@example.com
export ALERT_EMAIL_PASS=your-app-password

# Run all tests with the node-runner service
docker-compose up node-runner

# Or run a specific test with the k6 service
docker-compose up k6
```

## CI/CD Integration

### Jenkins

1. Create the following credentials in Jenkins:
   - `k6-alert-email-user`: Email address for alerts
   - `k6-alert-email-pass`: Email password/app password for alerts

2. Create a new Pipeline job using the provided `jenkins-pipeline.yml` file.

### GitHub Actions

1. Add the following secrets to your GitHub repository:
   - `ALERT_EMAIL_USER`: Email address for alerts
   - `ALERT_EMAIL_PASS`: Email password/app password for alerts

2. Place the `github-workflow.yml` file in the `.github/workflows` directory of your repository.

## Configuration

You can modify the test configuration in `config.js`:

- `stopOnFailure`: Whether to stop running tests after a failure
- `testFolder`: Directory containing test files
- `outputFolder`: Directory for test reports
- `generateCharts`: Whether to generate charts in reports