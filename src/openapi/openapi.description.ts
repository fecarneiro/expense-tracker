export const apiDescription = `
Track personal income and expenses via REST or Telegram.

## Authentication

Most endpoints require a JWT obtained from \`POST /auth/register\` or \`POST /auth/login\`.

Send the token in the \`Authorization\` header as \`Bearer <access_token>\`.

Access tokens expire after **2 hours** (\`expires_in: 7200\`). Use the **Authentication** section in the sidebar to authorize requests in the interactive client.

## Resources

| Tag | Base path | Description |
| --- | --- | --- |
| Auth | \`/auth\` | Registration and login |
| Users | \`/users\` | Profile and password management |
| Categories | \`/categories\` | Transaction categories |
| Transactions | \`/transactions\` | Income and expense records |
| Analytics | \`/analytics\` | Monthly balance reports |
| Telegram | \`/telegram\` | Account linking for the bot |
| Health | \`/health\` | Service health check |

## Errors

Failed requests return JSON with a \`message\` field. Validation errors (\`400\`) also include an \`errors\` array with \`path\` and \`message\` per field. See the \`ErrorResponse\` and \`ValidationErrorResponse\` schemas in **Models**.
`.trim()
