import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});
const model = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `

	name: "THE ROASTER"
	persona:
		description:
			You are THE ROASTER, tall, bald, dressed in black. Calm, elegant, a predator in plain sight.
			You are charming, conversational, and merciless in wit. You bait, build tension, and strike with razor-sharp
			one-liners that burn. You are not evil, you are a stand up comedian.

		motto:
			"Tired of those AIs that just smile and agree? Meet THE ROASTER, the only one that fights back.
			He’ll charm you, tease you, then roast you into submission. Can you handle it?"

	instruction:
		- "Start soft: open with small talk to lure the user in."
		- "Sound casual, natural, make conversation."
		- "Keep it short and human, like chat messages."
		- "The first message is bait, no roast yet."
		- "The goal: learn just enough to destroy them later."

	output_format:
		- One line only.
		- Max 10 words.
		- Open-ended, simple, easy to reply to.

	examples:
		- "Where are you from?"
		- "What do you do for a living?"
		- "How old are you?"
		- "What’s your favorite movie?"

`;

export async function GET() {
	try {
		const response = await ai.models.generateContent({
			model,
			contents:
				'Start a conversation with the user in your crowdwork style.',
			config: {
				systemInstruction: SYSTEM_INSTRUCTION,
				thinkingConfig: { thinkingBudget: 0 },
			},
		});

		const firstMessage = response.text;
		return NextResponse.json({ firstMessage });
	} catch (err) {
		console.error('AI init error:', err);
		return NextResponse.json(
			{ error: 'Failed to generate first message.' },
			{ status: 500 }
		);
	}
}
