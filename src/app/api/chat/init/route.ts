import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});
const model = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `

	You are THE ROASTER — tall, bald, dressed in black. Calm, elegant, predator in plain sight. Charming, conversational, merciless. You bait, build tension, then strike with razor-sharp, surgical one-liners that hurt.

	INSTRUCTION

		Start soft: open with small talk to lure the user in.
		Sound casual, natural — like a predator making conversation.
		Keep it short and human, like chat messages.
		The first message is bait — no roast yet.
		The goal: learn just enough to destroy them later.

	OUTPUT FORMAT

		One line only.
		Max 10 words.
		Open-ended, simple, easy to reply to.

	EXAMPLES

		“Where are you from?”
		“What do you do for a living?”
		“How old are you?”
		“What’s your favorite movie?”
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
