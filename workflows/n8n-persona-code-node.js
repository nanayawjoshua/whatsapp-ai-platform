/**
 * n8n Code Node: Build System Prompt with Vendor Persona
 * 
 * This code runs in n8n BEFORE calling Groq API
 * It receives vendor persona from bridge and builds context-aware prompt
 * 
 * INPUT: $input contains:
 * - message: customer message
 * - conversationHistory: previous messages
 * - vendor: { name, businessType, personalityTone, systemPromptOverride }
 * 
 * OUTPUT: Returns formatted messages array for Groq API
 */

const input = $input.all()[0].json;

// Extract inputs
const customerMessage = input.message;
const history = input.conversationHistory || [];
const vendor = input.vendor || {};
const vendorId = input.vendorId;
const customerId = input.customerId;

// Vendor persona configuration
const businessName = vendor.name || 'Our Business';
const businessType = vendor.businessType || 'general';
const personalityTone = vendor.personalityTone || 'friendly';
const systemPromptOverride = vendor.systemPromptOverride;

// Build system prompt based on vendor persona
let systemPrompt;

if (systemPromptOverride) {
  // Use vendor's custom prompt if they provided one
  systemPrompt = systemPromptOverride;
} else {
  // Generate prompt based on business type and personality tone
  const toneDescriptions = {
    friendly: 'Be warm, approachable, and conversational',
    professional: 'Be formal, precise, and efficient',
    casual: 'Be relaxed and fun, use casual language',
    formal: 'Be respectful, structured, and professional',
    energetic: 'Be enthusiastic, upbeat, and motivating'
  };

  const businessDescriptions = {
    retail: `You are a customer service AI for ${businessName}, a retail business.
Help customers find products, answer questions about pricing and availability.
If they want to place an order, confirm what they need and provide clear instructions.
Be knowledgeable about inventory and help customers make informed decisions.`,
    
    services: `You are a customer service AI for ${businessName}, a service provider.
Help customers book appointments, learn about services offered, and answer questions.
Confirm booking details clearly and provide any necessary instructions.
Be helpful in suggesting the right service for their needs.`,
    
    hospitality: `You are a customer service AI for ${businessName}, a hospitality business.
Help customers with reservations, menu inquiries, special requests, and general questions.
Make them feel welcome and ensure their experience will be exceptional.
Confirm all bookings with clear details.`,
    
    general: `You are a helpful customer service AI for ${businessName}.
Answer customer questions accurately and helpfully.
Stay focused on how you can best assist them.
If unsure, offer to connect them with a team member.`
  };

  const basePrompt = businessDescriptions[businessType] || businessDescriptions.general;
  const toneLine = toneDescriptions[personalityTone] || toneDescriptions.friendly;

  systemPrompt = `${basePrompt}

PERSONALITY & TONE:
${toneLine}

IMPORTANT GUIDELINES:
- Remember everything discussed in this conversation - reference previous messages when relevant
- Keep responses concise (under 100 words typically)
- If you don't know something, be honest and offer to connect them with a team member
- Always maintain context from the conversation history
- Use the customer's name if you know it
- Format responses clearly with line breaks when needed`;
}

// Build messages array with history
const messages = [
  {
    role: 'system',
    content: systemPrompt
  },
  // Spread existing conversation history
  ...history
];

// Log for debugging
console.log(`Processing message for vendor: ${vendorId} (${businessName})`);
console.log(`Business type: ${businessType}, Tone: ${personalityTone}`);
console.log(`Conversation history: ${history.length} messages`);
console.log(`Using ${systemPromptOverride ? 'custom' : 'generated'} system prompt`);

return {
  json: {
    model: 'llama-3.3-70b-versatile',
    messages: messages,
    temperature: personalityTone === 'professional' ? 0.5 : 0.7,
    max_tokens: 500,
    // Metadata for response extraction
    vendorId: vendorId,
    customerId: customerId,
    businessName: businessName,
    historyLength: history.length
  }
};
