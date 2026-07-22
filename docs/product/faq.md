# APIPEDIA Developer FAQ

This document addresses the most frequently asked technical, pricing, and architectural questions regarding the APIPEDIA platform.

---

## Technical & Architecture

### How is regional latency calculated?
We measure latency using active synthetic probes executed every 60 seconds from 5 global edge zones: US-East, EU-Central, AP-South, SA-East, and US-West. Probes perform safe, stateless requests to each API's ping or status endpoints. The values shown in the dashboard represent rolling 24-hour averages for the median (`p50`) and tail (`p99`) latency metrics.

### Does APIPEDIA store my API keys when I use the Live Playground?
No. When you run requests in Live Mode within the playground, your API keys are handled entirely in one of two secure ways:
1. **Client-Side Direct**: The requests are dispatched directly from your browser to the API provider. Your keys are stored in your browser's local storage (`localStorage`) and never touch APIPEDIA servers.
2. **Local CLI Proxy**: If the API provider lacks CORS support, you can pipe requests through the APIPEDIA CLI running locally (`apipedia proxy`). This bypasses our cloud infrastructure completely.

### How does the sandbox mock playground work without an account?
When you click **Send** on a simulated endpoint, the request is intercepted by our client-side OpenAPI Mock Engine. This engine reads the cached OpenAPI specification for that API, checks your request parameter types, and dynamically compiles a schema-compliant JSON response structure. It behaves like a real backend server but runs completely client-side in less than 5 milliseconds.

---

## SDKs & Data Ingestion

### How is the SDK quality score computed?
The SDK Quality Score (0–100) is updated daily through static code analysis of the provider's official repositories. The score is calculated using four primary criteria:
1. **Maintenance Activity (30%)**: Time since the last commit and average issue closure rate.
2. **Type Coverage (30%)**: Percentage of functions with complete type signatures (for TypeScript, Go, Java, Swift, etc.).
3. **Dependency Health (20%)**: Number of outdated or vulnerable dependencies in the SDK package definitions.
4. **Issue Backlog (20%)**: Open issues tagged as bugs or crashes relative to repository stars.

### How do I list my own API on APIPEDIA?
Submit your API by providing an OpenAPI 3.0+ specification link.
1. Create a Pull Request adding your API definition file under the `apis/` directory in our open-source repository.
2. Our pipeline will automatically download the spec, verify it formats correctly, and test connectivity.
3. Once the automated validation passes, the review team will approve and merge, indexing your API in the next hourly catalog rebuild.

---

## Hosting & Security

### Can I run APIPEDIA inside my own network?
Yes. APIPEDIA is open-source (Apache 2.0) and can be run locally using Docker Compose or deployed to a Kubernetes cluster using our Helm charts. For enterprise environments requiring private microservice discovery, RBAC, SSO, and offline ingestion pipelines, contact our sales team about the **Enterprise VPC Edition**.

### Does APIPEDIA support GraphQL and gRPC APIs?
Yes. While REST and OpenAPI are the most common formats, the APIPEDIA catalog supports GraphQL (via schema introspection) and gRPC (via Protobuf definitions). The similarity engine analyzes their query layouts, mutation schemas, and protobuf service structures to calculate DNA matching details just like REST APIs.
