# APIPEDIA Developer Onboarding & Quickstart

This guide gets you up and running with APIPEDIA. You will learn how to set up your account, install the APIPEDIA CLI, verify your first third-party API integration, and use local sandboxes.

---

## Introduction

APIPEDIA helps you research, compare, run, and monitor APIs without having to constantly switch tabs between official docs, GitHub, and Postman. Let's get started by setting up your local environment.

---

## Onboarding Flow

### Step 1: Create Your Account & API Key
1. Go to the [APIPEDIA Dashboard](file:///c:/Users/chauh/OneDrive/Desktop/apiPedia/apiPedia/docs/website/landing-page.md#global-navigation-bar) and click **Login**.
2. Navigate to your Settings Panel and choose **Developer Access**.
3. Click **Generate New API Key** (this key will authenticate your CLI requests).
4. Save your token (it starts with `ap_dev_...`).

### Step 2: Install the CLI
We distribute the APIPEDIA CLI via standard package managers. Run the command appropriate for your operating system:

```bash
# macOS (Homebrew)
brew install apipedia/tap/apipedia

# Linux / Windows (curl bash wrapper)
curl -fsSL https://get.apipedia.dev | sh
```

Verify your installation by printing the version:
```bash
apipedia --version
# Output: apipedia CLI v1.4.0 (stable)
```

### Step 3: Authenticate the CLI
Authenticate your local shell environment by running the login command and pasting your developer API key when prompted:

```bash
apipedia auth login
# Input API key: ap_dev_********************
# Authentication successful. Logged in as: alex@company.com (Team Tier)
```

---

## Using the APIPEDIA CLI

The CLI is designed to help you extract schemas, query the platform's telemetry databases, and test integrations locally.

### 01. Lookup API Health & Telemetry
Quickly check the live latency, uptime, and SDK version statistics for any public API:

```bash
apipedia telemetry stripe
```

#### Sample Response Output
```json
{
  "api": "stripe",
  "status": "healthy",
  "live_health_score": 98,
  "vitals": {
    "latency_p50": "84ms",
    "latency_p99": "142ms",
    "uptime_30d": "99.98%"
  },
  "sdks": {
    "typescript": {
      "version": "14.22.0",
      "updated_at": "3 days ago",
      "issues": 0
    }
  }
}
```

### 02. Download and Parse OpenAPI Schemas
Retrieve the verified and sanitized OpenAPI specification directly from our pipeline cache:

```bash
apipedia schema download openai --format yaml --output ./openai-schema.yaml
# Downloading OpenAI schema... Done.
# Schema written to ./openai-schema.yaml
```

### 03. Run Local Playground Sandboxes
Spin up an isolated, local mock server of any catalog API matching our telemetry specifications:

```bash
apipedia mock run clerk --port 8080
# Loading Clerk mock server configurations...
# Verification complete. 48 endpoints mapped.
# Local Clerk sandbox running on: http://localhost:8080
```

You can now point your local development environment to `http://localhost:8080` instead of Clerk's production servers. The mock server will validate your request structures, headers, and API keys automatically, returning compliant simulated payloads.
