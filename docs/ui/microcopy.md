# APIPEDIA UI Microcopy Catalog

This document defines the user interface copy guidelines, toast alerts, error and success dialogues, loading text, empty states, tooltips, and keyboard shortcuts used across the APIPEDIA client dashboard.

---

## 1. Dashboard Structural Labels

### Main Sidebar Navigation
* **Search Input Placeholder**: `Search APIs (/)`
* **All APIs Tab**: `ALL_APIS`
* **Compare Matrix Tab**: `COMPARE_MATRIX`
* **Custom Recipes Tab**: `RECIPES`
* **System Settings Tab**: `SETTINGS`
* **User Profile Menu Label**: `DEVELOPER_PROFILE`

### API Detail Tabs
* **Overview Tab**: `OVERVIEW`
* **Playground Tab**: `PLAYGROUND`
* **Documentation Tab**: `DOCUMENTATION`
* **DNA Profile Tab**: `API_DNA`
* **Recipes Tab**: `RECIPES`
* **Telemetry Tab**: `TELEMETRY`
* **Outages/Changelog Tab**: `CHANGELOG`
* **Comparison Matrix Button**: `[ + Pin to Compare ]`

---

## 2. System Toast Messages

Toasts appear in the bottom-right corner of the interface and automatically dismiss after 2000ms.

| Event Type | Status | Toast Headline | Toast Description |
| :--- | :--- | :--- | :--- |
| Copy Code | `Success` | `Snippet Copied` | Code copied to clipboard. |
| Copy Schema | `Success` | `Schema Copied` | OpenAPI JSON schema copied. |
| Key Generation | `Success` | `API Key Generated` | Token `ap_dev_...` active. |
| Sandbox Deployment | `Success` | `Sandbox Ready` | Local endpoint listening on port 8080. |
| Connection Test | `Success` | `Test Successful` | API responded with status `200 OK` in 84ms. |
| Network Error | `Error` | `Request Failed` | Host unreachable. Check internet connection. |
| Auth Error | `Warning` | `Invalid Token` | The developer key provided is not authenticated. |

---

## 3. Error & Success Messages

### API Validation Errors
* **Invalid JSON Payload**:
  * *Headline*: `PARSING_ERROR`
  * *Body*: *"Malformed JSON body. Ensure all string values are double-quoted and objects are closed correctly."*
* **Rate Limit Exceeded**:
  * *Headline*: `RATE_LIMIT_EXCEEDED`
  * *Body*: *"This endpoint is rate-limited to 10 requests per minute in Sandbox Mode. Upgrade to Team Tier for higher limits."*
* **Missing Query Parameters**:
  * *Headline*: `MISSING_REQUIRED_FIELDS`
  * *Body*: *"Request failed. Missing query parameter: `api_version`. Add this key under your Headers panel."*

### Key Generation Success Modal
* *Headline*: `API_KEY_CREATED`
* *Subheading*: *"Your new developer token has been successfully generated. Store this key securely. You will not be able to see it again."*
* *Button Label*: `Copy Key`

---

## 4. Form Validation & Helper Text

Used beneath forms to guide inputs dynamically.

* **Email Address Input**:
  * *Placeholder*: `enter your work email...`
  * *Error state*: `Invalid email format. E.g., alex@company.com`
* **API Ingestion URL**:
  * *Placeholder*: `https://api.provider.com/openapi.json`
  * *Helper Text*: `Must point directly to a raw JSON or YAML schema file.`
  * *Error state*: `Unable to parse OpenAPI schema. Check URL format.`
* **Environment Variable Key**:
  * *Placeholder*: `STRIPE_API_KEY`
  * *Helper Text*: `Convention: alphanumeric and underscores only.`
  * *Error state*: `Keys cannot contain spaces or special characters.`

---

## 5. Empty States & Loading States

### Empty States

#### No Search Results (API Search)
```
[!] NO_RESULTS_FOUND

No APIs matched your query.
Ensure spelling is correct, or browse by category.

[ Suggest New API Ingestion ]   [ Clear Filters ]
```

#### Empty Comparison Matrix
```
[+] COMPARE_MATRIX_EMPTY

Select at least two APIs from the catalog to compare performance,
latency benchmarks, SDK health, and compliance side-by-side.

[ Browse Catalog ]
```

### Loading States

* **Catalog Syncing**: `PULLING_CATALOG_SCHEMAS...`
* **Sandbox Launch**: `SPINNING_UP_LOCAL_MOCK_ENV...`
* **AI Processing**: `COMPILING_INTELLIGENCE_REPORT...`
* **Telemetry Fetch**: `BENCHMARKING_REGIONAL_LATENCY...`

---

## 6. Tooltips & Keyboard Shortcuts

Concise instructions overlaying active items.

### Tooltips
* **Pin Button**: `Pin API to comparison matrix. [P]`
* **Uptime Ring**: `Average success rate across edge locations over 30 days.`
* **DNA Vector Icon**: `View semantic similarity profile. [D]`
* **SDK Score Dial**: `Static repository health rating. Check commit activity.`
* **Send Request Button**: `Execute HTTP query against endpoint. [Enter]`

### Keyboard Shortcuts Catalog
Pressing `?` brings up the shortcut modal:

```
KEYBOARD_SHORTCUTS

/         Focus API Search
g + o     Go to Overview Tab
g + p     Go to Playground Tab
g + d     Go to DNA Profile Tab
g + t     Go to Telemetry Tab
c         Copy Code Snippet
p         Pin/Unpin API for comparison
Esc       Close Active Modal / Overlay
?         Open Shortcuts Guide
```
