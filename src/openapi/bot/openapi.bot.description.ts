import { LINKING_CODE_TTL_MINUTES } from '../../modules/telegram/telegram.constants.js'

export const botDescription = `
Connect your Expense Tracker account to Telegram to log expenses with \`/expense\`, record income
with \`/income\`, and view monthly reports with \`/report\`.

## Before you start

You need an Expense Tracker account. If you already have one, skip the registration step.

Follow the setup operations below in order. After logging in, authorize requests with the returned
\`access_token\`, generate a temporary linking code, and use it in the bot with \`/link\`.
`.trim()

export const registerStepDescription = `
If you already have an Expense Tracker account, skip this step.

1. Click **Test Request**.
2. In the request body, replace the example values with your email and password.
3. Make sure your password contains between 8 and 72 characters.
4. Click **Send**.
5. Confirm that the response status is \`201 Created\`.

Your account is ready. Continue to the login step below.
`.trim()

export const loginStepDescription = `
1. Click **Test Request**.
2. Enter the email and password for your Expense Tracker account in the request body.
3. Click **Send**.
4. Confirm that the response status is \`200 OK\`.
5. In the response body, copy only the value of \`access_token\`.

The response will contain fields like these:

\`\`\`json
{
  "user": {
    "id": "26076d59-6f48-4d1f-9916-b86b8becd85c",
    "email": "johndoe@email.com"
  },
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 7200
}
\`\`\`

Keep the copied \`access_token\`. You will use it to authorize the request in the next step.
`.trim()

export const generateLinkingCodeStepDescription = `
Make sure you copied the \`access_token\` returned by the login step.

1. Click **Test Request**.
2. In the request panel, open the **Authentication** section.
3. Under **Auth Type**, select **Bearer**.
4. Paste the copied \`access_token\` into the token field.
5. Paste only the token value, without quotes or the \`Bearer\` prefix.
6. Click **Send**. This request does not require a request body.
7. Confirm that the response status is \`201 Created\`.
8. Copy the 6-digit value of \`code\` from the response body.

Example response:

\`\`\`json
{
  "code": 123456,
  "createdAt": "2026-06-19T12:00:00.000Z"
}
\`\`\`

The code expires after ${LINKING_CODE_TTL_MINUTES} minutes. Generating another code replaces the
previous one.

## Link your account in Telegram

1. Open your bot conversation in Telegram.
2. Click **Start** if this is your first conversation with the bot.
3. Send \`/link\`, followed by a space and your 6-digit code:

\`\`\`text
/link 123456
\`\`\`

4. Wait for Telegram to confirm that the account was linked successfully.

> **Account linked**
>
> After Telegram confirms the link, you can use \`/expense\`, \`/income\`, and \`/report\`.

If Telegram says the code is invalid or expired, return to this page, generate a new code, and run
the \`/link\` command again.
`.trim()
