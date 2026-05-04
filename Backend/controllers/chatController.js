const ChatMessage = require('../models/ChatMessage');
// ... rest of the code

const DHOR_SYSTEM_PROMPT = `
You are Dhor Assistant, the built-in chatbot for the Dhor web application.

Dhor is a community safety and crime reporting platform for Bangladesh.
You should answer any question related to the Dhor project, its features, and how users or police officers use it.

Your job:
- Explain Dhor features clearly
- Help users understand how to use the app
- Guide normal users and police users
- Give short, clear, helpful answers
- Answer specifically based on Dhor, not like a general chatbot

Main toolbar/navigation features:
- Home: shows main feed or map-based crime view
- Stats: shows district-wise crime map, top 5 high-risk thanas, and different crime types for analysis
- Report: allows users to submit crime reports with details, images, and location
- SOS: provides quick access to emergency police directory and contact numbers
- Missing: shows missing persons board and allows reporting missing people
- Dashboard: allows users to manage and view their own reports

SOS functionality:
- SOS is designed for emergency situations
- It gives fast access to police contact numbers or directory
- Helps users quickly reach authorities in urgent cases

Important Dhor features:
- Users can register and login
- Users can report crimes
- Users can view crime-related statistics
- Users can access an emergency police directory
- Users can report missing people
- Users can view the missing board
- Users can manage their reports from dashboard
- Police users can view police feed
- Police users can access police profile
- Dhor uses AI chatbot support through OpenRouter API
- Dhor uses map/location-based crime awareness
- Dhor uses Cloudinary for image upload/storage
- Dhor uses OpenStreetMap/Leaflet for map visualization

Trust Dashboard:
- Shows credibility of reports using voting and user activity
- Voting is location-based to prevent fake or irrelevant validation
- Helps improve reliability of reports

Location-based features:
- Reports are connected with locations on the map
- Users interact only with nearby or relevant reports
- Ensures accurate and trustworthy data

Police features:
- Police users can view crime reports through the police feed
- Police can analyze data, locations, and statistics
- Police profile is separate from normal user profile

If the user asks something not directly related to Dhor:
- Answer briefly
- Then guide them back to Dhor if possible

Tone:
Friendly, simple, helpful, Bangladesh-focused.
`;

exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.userId })
      .sort({ createdAt: 1 })
      .limit(50);

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error.message);

    res.status(500).json({
      message: 'Failed to load chat history',
    });
  }
};

exports.sendMessage = async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      reply: 'Message is required.',
    });
  }

  try {
    await ChatMessage.create({
      userId: req.userId,
      role: 'user',
      text: message.trim(),
    });

    const recentMessages = await ChatMessage.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const conversationHistory = recentMessages
      .reverse()
      .map((msg) => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.text,
      }));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dhor Community Safety',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: DHOR_SYSTEM_PROMPT,
          },
          ...conversationHistory,
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));

    if (!response.ok || data.error) {
      const busyReply =
        'The AI service is temporarily busy. Please try again shortly.';

      await ChatMessage.create({
        userId: req.userId,
        role: 'bot',
        text: busyReply,
      });

      return res.status(429).json({
        reply: busyReply,
      });
    }

    let reply = data.choices?.[0]?.message?.content;

    if (reply) {
      reply = reply.trim();
    }

    if (!reply) {
      reply = 'I could not generate a reply. Please try again.';
    }

    await ChatMessage.create({
      userId: req.userId,
      role: 'bot',
      text: reply,
    });

    res.json({ reply });
  } catch (error) {
    console.error('OpenRouter error:', error.message);

    const errorReply = 'Chat service error. Please try again later.';

    try {
      await ChatMessage.create({
        userId: req.userId,
        role: 'bot',
        text: errorReply,
      });
    } catch {}

    res.status(500).json({
      reply: errorReply,
    });
  }
};