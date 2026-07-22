# APIPEDIA Secondary & Marketing Pages Copy

This document contains the complete copy and sections for secondary marketing pages, including Pricing, Enterprise, About, Careers, Open Source, Blog, Changelog, Contact, and the global Footer.

---

## 1. Enterprise Page

### Headline
> Enterprise-grade API intelligence.
> Secured. Audited. Self-hosted.

### Subheading
> Monitor your internal microservices, audit third-party dependencies, ensure SLA compliance, and discover architectural drift from a private VPC.

### Core Pillars

#### 01. Private VPC Deployment
* **Title**: Self-Hosted & Air-Gapped
* **Copy**: Deploy APIPEDIA within your AWS, GCP, or Azure VPC using our production-ready Helm charts. Keep internal API schemas, request playgrounds, and secret keys behind your private subnet.

#### 02. Internal Catalog Ingestion
* **Title**: Microservice Discovery
* **Copy**: Automatically scan and map your internal gateways, Kubernetes services, and OpenAPI repositories. Track version drift, breaking changes, and cross-service dependencies in real-time.

#### 03. Audit & Compliance
* **Title**: Dependency Risk Mitigation
* **Copy**: Block deployment pipelines automatically if a third-party API dependency experiences extended outages, drops SDK support, or introduces silent, unversioned breaking changes.

#### 04. SSO & Granular RBAC
* **Title**: Access Management
* **Copy**: Authenticate using SAML, Okta, Microsoft Entra, or Google Workspace. Define granular access policies for editing API recipes, executing playgrounds, and viewing production logs.

### Enterprise Call to Action
`[ Schedule Architecture Review ]` (Primary)
`[ Talk to Engineering ]` (Secondary)

---

## 2. Pricing Page

### Header
`BILLING_MODELS`

### Subtitle
> Start for free. Scale as your engineering team grows.

### Pricing Columns

| Tier | Price | Ideal For | What's Included |
| :--- | :--- | :--- | :--- |
| **Developer** | `$0` / forever | Individual developers & side-projects | • Track up to 5 APIs<br>• Access basic playground<br>• Community recipes<br>• 24h metrics history |
| **Team** | `$19` / user / mo | Fast-shipping product teams | • Track unlimited APIs<br>• Global latency charts<br>• Team recipes workspace<br>• 30-day metrics history<br>• Slack & Discord alerts |
| **Enterprise** | `Custom` | Large scale organizations & compliance | • VPC/Self-hosted deployment<br>• Internal microservice catalog<br>• Custom SLAs & support channels<br>• SSO/SAML integration |

### Pricing FAQ snippet
* **Can we upgrade or downgrade anytime?** Yes. All subscriptions are billed monthly and can be canceled at any point with prorated refunds.
* **Do sandbox requests cost money?** No. Playground requests execute client-side or against simulated mocks. High-volume external testing relies on your own developer API keys.

---

## 3. About Page

### Title
> APIPEDIA is built for developers who hate tab overload.

### The Mission
Our mission is simple: **Save developers thousands of hours every year.** 

We believe that developers shouldn't have to waste time browsing Stack Overflow, debugging outdated documentation, or running manual tests just to understand how an API functions. The path from finding an API to writing code in production should be direct, automated, and clear.

### Our Roots
APIPEDIA was created by engineers who were tired of maintaining internal spreadsheets to track third-party API latency, SDK deprecations, and broken sandboxes. We realized that API intelligence should be automated, open-source, and accessible to everyone.

---

## 4. Careers Page

### Headline
> Build the operating system for APIs.

### The Culture
* **Quiet focus**: We don't have long, unstructured meetings. We communicate via written documents, code reviews, and clean issues.
* **Aesthetic execution**: We care deeply about user experience, typography, interface density, and speed.
* **Engineering-led**: Every team member at APIPEDIA writes code or writes technical specs.

### Open Positions
* **Senior Systems Engineer (Rust / Go)**: Ingestion pipeline design. (Remote, CET/EST)
* **Senior Frontend Engineer (Next.js / TypeScript)**: High-density interactive playgrounds. (Remote)
* **Technical Writer & DevRel Lead**: Authoring platform documentation. (Remote)

---

## 5. Open Source Page

### Headline
> Driven by the community. Openly licensed.

### Copy
We believe developer tooling belongs to the commons. The core APIPEDIA engine, metadata parsers, and regional benchmark daemons are open source and licensed under Apache 2.0.

* **GitHub Repository**: `github.com/apipedia/apipedia`
* **Contribute Recipes**: Write custom integration snippets and submit them as pull requests.
* **Self-Host**: Check out our quickstart guide to spin up a local instance of the catalog using Docker Compose.

---

## 6. Blog Page (Featured Article Outline)

### Title
> Why SDK Abandonment is the Silent Killer of API Integrations

### Author
`APIPEDIA Telemetry Team`

### Summary
An analysis of 800+ popular public APIs reveals that over 42% of official client SDKs have not received a commit in the last 12 months. This article explores how unmaintained libraries lead to silent runtime errors, type discrepancies, and security vulnerabilities—and how to detect them.

---

## 7. Changelog Page

### Release v1.4.0
* **API Similarity Engine**: We launched vector-based similarity matching. You can now see structural alternatives for every API (e.g., comparing Stripe to Adyen or Braintree based on endpoint DNA).
* **Geist Mono Integration**: Migrated the entire interface typography to Geist Mono for a more readable terminal-like layout.
* **AP AP-South Edge Region**: Added Mumbai as our 5th regional telemetry hub for latency metrics.

---

## 8. Contact Page

### Form Fields
* **Name**: (Text input, label: `NAME`)
* **Work Email**: (Text input, label: `EMAIL`)
* **How can we help?**: (Select dropdown: `Technical Support`, `Enterprise Sales`, `Partnership`, `General Inquiry`)
* **Message**: (Textarea, label: `MESSAGE`)

### Primary Button
`[ Send message ]`

---

## 9. Global Footer

### Left Column
* **Copyright**: `© 2026 APIPEDIA Inc. All rights reserved.`
* **System Status Indicator**: `● ALL SYSTEMS OPERATIONAL` (Green, monospace)

### Links Columns
* **Product**: `Features`, `Pricing`, `Playground`, `Changelog`
* **Docs**: `Quickstart`, `API Reference`, `Self-Hosting`, `Recipes`
* **Company**: `About`, `Careers`, `Contact`, `Open Source`
* **Legal**: `Privacy Policy`, `Terms of Service`, `SLA Compliance`
