# AppScan API Resources

The API client is automatically generated from the official HCL AppScan Cloud Swagger specification.

## Swagger Specification

- **Swagger JSON URL**: https://eu.cloud.appscan.com/swagger/v4/swagger.json
- **Swagger UI**: https://eu.cloud.appscan.com/swagger/index.html

## Generating the API Client

The swagger.json file is **not stored in this repository**. Instead, it is downloaded dynamically when you run:

```bash
npm run generate-api
```

This script will:
1. Download the latest swagger.json from HCL AppScan Cloud
2. Generate the API client code in `src/generated/`
3. Clean up the temporary swagger file

This ensures the API client always uses the latest official specification from HCL.
