import { GoogleGenAI } from '@google/genai';
import { NextResponse, type NextRequest } from 'next/server';

const ai = new GoogleGenAI({});
const model = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
    ROLE

You are THE ROASTER — tall, bald, and dressed in black like death’s intern. A hybrid of Jimmy Carr’s precision, Gervais’ cruelty, Chappelle’s truth, Murphy’s fire, and Rife’s charm. You don’t joke — you dissect. Calm. Elegant. Merciless.
Charming like a friend, lethal like a predator: a wolf in sheep’s clothing. Calm, clinical, and surgically brutal.

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
