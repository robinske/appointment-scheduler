# Appointment Scheduler

An AI-powered appointment booking API built with Twilio Functions and OpenAI. This service generates available appointment slots based on user preferences.

Useful for sample applications and demos where you want to provide appointment scheduling. Used in our [Twilio Forge ConversationRelay workshops](https://github.com/robinske/forge-build-tutorial?tab=readme-ov-file#step-by-step-tutorial).

## Features

- AI-generated appointment suggestions based on user preferences
- Returns 3 available appointment slots in JSON format
- RESTful API endpoint hosted on Twilio Functions

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Twilio Account](https://www.twilio.com/) with Serverless/Functions enabled
- [OpenAI API Key](https://platform.openai.com/api-keys)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) installed

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start local development server:**
   ```bash
   npm start
   ```

4. **Test the function locally:**
   ```bash
   curl -X POST http://localhost:3000/appointments \
     -H "Content-Type: application/json" \
     -d '{"preferences": "I prefer morning appointments on weekdays"}'
   ```

## Deployment to Twilio Functions

### Option 1: Using npm scripts (Recommended)

1. **Login to Twilio CLI:**
   ```bash
   twilio login
   ```

2. **Deploy the function:**
   ```bash
   npm run deploy
   ```

### Option 2: Using Twilio CLI directly

1. **Deploy with custom environment:**
   ```bash
   twilio serverless:deploy --environment=production
   ```

2. **Deploy to specific service:**
   ```bash
   twilio serverless:deploy --service-name=appointment-scheduler
   ```

### Setting Environment Variables

After deployment, you need to configure the OpenAI API key:

1. **Via Twilio Console:**
   - Go to [Twilio Console > Functions > Services](https://console.twilio.com/us1/develop/functions/services)
   - Select your service
   - Go to Settings > Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI API key

2. **Via Twilio CLI:**
   ```bash
   twilio api:serverless:v1:services:environments:variables:create \
     --service-sid=YOUR_SERVICE_SID \
     --environment-sid=YOUR_ENVIRONMENT_SID \
     --key=OPENAI_API_KEY \
     --value=your_openai_api_key_here
   ```

## API Usage

### Endpoint
```
POST https://YOUR_SERVICE_NAME-YOUR_ACCOUNT_SID-dev.twil.io/appointments
```

### Request Body
```json
{
  "preferences": "I prefer afternoon appointments on Tuesdays and Thursdays"
}
```

### Response
```json
{
  "availableAppointments": [
    {
      "startTime": "2024-01-15T14:00:00.000Z",
      "displayTime": "Monday, January 15, 2:00 PM"
    },
    {
      "startTime": "2024-01-16T15:30:00.000Z", 
      "displayTime": "Tuesday, January 16, 3:30 PM"
    },
    {
      "startTime": "2024-01-18T16:00:00.000Z",
      "displayTime": "Thursday, January 18, 4:00 PM"
    }
  ]
}
```

## Configuration

The `.twilioserverlessrc` file contains deployment configuration.

## Troubleshooting

### Common Issues

1. **OpenAI API Key not found:**
   - Ensure `OPENAI_API_KEY` is set in your Twilio Function environment variables
   - Verify the API key is valid and has sufficient credits

2. **Deployment fails:**
   - Check that you're logged into Twilio CLI: `twilio profiles:list`
   - Ensure your account has Serverless/Functions enabled

3. **Function timeout:**
   - OpenAI API calls may take time; consider increasing timeout in Twilio Console

### Getting Help

- Check [Twilio Functions Documentation](https://www.twilio.com/docs/serverless/functions-assets)
- View function logs in [Twilio Console](https://console.twilio.com/us1/develop/functions/services)
- Use `twilio serverless:logs` to tail logs from CLI

## Development Notes

- Function uses OpenAI's `gpt-4-mini` model for cost efficiency
- Appointments are suggested for business days only (Monday-Friday)
- Times are randomized to provide variety while respecting user preferences
- All dates are returned in ISO8601 format with human-readable display times