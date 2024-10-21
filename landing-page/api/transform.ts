import { NextApiRequest, NextApiResponse } from 'next';
import { init } from '@instantdb/admin';
import { callAI } from '../src/utils/ai';

// Error if INSTANT_APP_ID or INSTANT_ADMIN_TOKEN is not set
if (!process.env.INSTANT_APP_ID || !process.env.INSTANT_ADMIN_TOKEN) {
  throw new Error('INSTANT_APP_ID and INSTANT_ADMIN_TOKEN must be set');
}

const db = init({ appId: process.env.INSTANT_APP_ID, adminToken: process.env.INSTANT_ADMIN_TOKEN });

// Get the AI model from environment variables
const AI_MODEL = process.env.AI_MODEL || 'claude-3-sonnet-20240229';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, text, transformerId } = req.body;

    try {
      // Fetch subscription data and transformer
      const data = await db.query({
        subscriptionData: { $: { where: { userId: userId } } },
        transformers: { $: { where: { id: transformerId } } },
      });

      const subscriptionData = data.subscriptionData[0];
      const transformer = data.transformers[0];
      if (!subscriptionData) {
        return res.status(404).json({ 
          error: 'Subscription data not found', 
          details: {
            userId: userId,
            queryResult: JSON.stringify(data.subscriptionData),
            timestamp: new Date().toISOString()
          }
        });
      }
      
      if (!transformer) {
        return res.status(404).json({ 
          error: 'Transformer not found', 
          details: {
            transformerId: transformerId,
            queryResult: JSON.stringify(data.transformers),
            timestamp: new Date().toISOString()
          }
        });
      }

      if (!subscriptionData.isSubscribed) {
        return res.status(403).json({ 
          error: 'User is not subscribed', 
          details: {
            userId: userId,
            subscriptionStatus: subscriptionData.isSubscribed,
            subscriptionData: JSON.stringify(subscriptionData),
            timestamp: new Date().toISOString()
          }
        });
      }
      // Apply the transformer using the shared AI utility
      const apiKey = AI_MODEL.startsWith('gpt') ? process.env.OPENAI_API_KEY! : process.env.ANTHROPIC_API_KEY!;
      const { content: transformedText } = await callAI(
        apiKey,
        AI_MODEL,
        transformer.content,
        text
      );

      res.status(200).json({ transformedText });
    } catch (error) {
      console.error('Error applying transformer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
