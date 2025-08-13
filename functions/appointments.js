const OpenAI = require('openai');

exports.handler = async function(context, event, callback) {
  // Make sure to set OPENAI_API_KEY in your Twilio Function environment variables!
  const openai = new OpenAI({
    apiKey: context.OPENAI_API_KEY,
  });

  // Preferences/context passed in as a parameter
  const preferences = event.preferences || "";
  console.log("Preferences: ", preferences);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build the system and user prompt
  const systemPrompt = `
    You are an appointment booking assistant. 
    Given a user's preferences, return a JSON object with 3 available future appointment slots.
    - Appointments must be Monday to Friday, between 10am and 8pm on whole or half hours only.
    - Only suggest appointments **AFTER** today's date (${today}). DO NOT SUGGEST APPOINTMENTS IN THE PAST.
    - The output JSON should be:
    {
      "availableAppointments": [
        {
          "startTime": "<ISO8601>",
        },
        ...
      ]
    }
    - The times should be randomized each run, and reflect user preferences for time or days, if specified.
    - Ensure no duplicate date+time.
    - Return nothing but the JSON object.
    `;

  const userPrompt = `User preferences for appointments: "${preferences}". Generate the 3 appointment slots using the defined rules.`;

  let gptResponse;
  try {
    // Call OpenAI GPT API
    gptResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
  } catch (e) {
    return callback(e);
  }

  // Extract and parse available appointment slots from GPT's response
  let slots = [];
  let raw = gptResponse.choices[0].message.content || "";

  try {
    // GPT might return code-blocks -- clean them if present
    raw = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    if (parsed.availableAppointments && Array.isArray(parsed.availableAppointments)) {
      slots = parsed.availableAppointments;
    }
  } catch (e) {
    // If parsing fails, return a 500 error
    return callback(`Could not parse GPT response: ${e}`);
  }

  // Map over each slot to add displayTime (using built-in formatting)
  const updatedSlots = slots.map(appointment => {
    try {
      const date = new Date(appointment.startTime);
      const displayTime = date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }); 
      return {
        ...appointment,
        displayTime,
      };
    } catch (e) {
      return appointment;
    }
  });

  // Prepare response
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.setBody({
    availableAppointments: updatedSlots,
  });
  
  return callback(null, response);
};
