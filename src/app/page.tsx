'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Input, Button } from '@headlessui/react';
import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Define a type for the successful response from our API route
interface ChatResponse {
	reply: string;
}

export default function ChatBox(): JSX.Element {
	let thinkingInterval: NodeJS.Timeout | null = null;

	// Explicitly type the state variables as string
	const [input, setInput] = useState<string>('');
	const [userInput, setUserInput] = useState<string>('');
	const [roasterImage, setRoasterImage] = useState<string>('neutral');
	const [response, setResponse] = useState<string>('Go on. Roast me.');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// Handles changes to the input box.
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setInput(e.target.value);
	};

	// Handles the form submission to send the message to the backend API route.
	const handleSend = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault(); // Prevent the default form submission (page reload)

		if (!input.trim()) return; // Don't send empty messages

		setIsLoading(true);
		setResponse(''); // Clear previous response
		setUserInput(input.trim());
		const userMessage: string = input.trim();
		setInput(''); // Clear the input box immediately
		roasterThinking();

		try {
			// Send the user's message to the custom Next.js API route
			const apiResponse = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				// Send the user's message in the request body
				body: JSON.stringify({ message: userMessage }),
			});

			// The data could be a ChatResponse or an error object { error: string }
			const data: ChatResponse | { error: string } =
				await apiResponse.json();

			if (!apiResponse.ok) {
				// Throw error if the response is not ok
				console.error('API Error:', data);
				throw new Error(
					'You know what? I don\'t care.'
				);
			}

			// Type check the successful response
			const successData = data as ChatResponse;
			setResponse(successData.reply);
			roasterTalking(successData.reply.split(' ').length);
		} catch (err) {
			console.error('API Error:', err);
			setResponse(
				'You know what? I don\'t care.'
			);
			roasterTalking();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='p-12 w-full flex flex-col items-center'>
			<Image
				src={`/the_roaster_${roasterImage}.png`}
				alt='The Roaster'
				width={400}
				height={800}
				className='rounded-lg'
			/>

			<div className='w-[400px] pt-8'>
				{userInput !== '' ? (
					<div className='w-3/4 flex flex-col items-end ml-auto'>
						<div className='mr-2'>Crowd</div>
						<div className='bg-red-800 text-white px-4 py-3 font-semibold text-xl max-w-max rounded-lg'>
							{userInput}
						</div>
					</div>
				) : (
					''
				)}

				{response !== '' ? (
					<div className='w-3/4 mb-4 pb-18'>
						<div className='ml-2'>The Roaster</div>
						<div className='bg-gray-950 text-white px-4 py-3 font-semibold text-xl max-w-max rounded-lg'>
							{response}
						</div>
					</div>
				) : (
					''
				)}

				<form
					onSubmit={handleSend}
					className='flex gap-2 pt-2 fixed w-[400px] bottom-0 pb-8 bg-white'
				>
					<Input
						type='text'
						value={input}
						onChange={handleInputChange}
						placeholder={
							isLoading
								? 'The Roaster is thinking...'
								: 'Roast me...'
						}
						disabled={isLoading}
						className='px-6 py-2 h-[52px] bg-gray-100 grow rounded-full disabled:bg-transparent outline-0'
					/>
					{!isLoading ? (
						<Button
							type='submit'
							disabled={isLoading || !input.trim()} // Also disable if input is empty
							className='p-4 rounded-full bg-red-800 font-bold text-xl text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<PaperAirplaneIcon className='size-5' />
						</Button>
					) : (
						''
					)}
				</form>
			</div>
		</div>
	);

	function roasterThinking(): void {
		// If already thinking, do nothing
		if (thinkingInterval) return;

		const speed = 300;

		thinkingInterval = setInterval(() => {
			setRoasterImage((prev) =>
				prev === 'thinking_1' ? 'thinking_2' : 'thinking_1'
			);
		}, speed);
	}

	function roasterTalking(numberOfWords: number = 10): void {
		const speed = 150;

		// Stop thinking before talking
		if (thinkingInterval) {
			clearInterval(thinkingInterval);
			thinkingInterval = null;
		}

		// Start with talking animation
		setRoasterImage('talking');

		let count = 0;
		const cycles = Math.round(numberOfWords / 2);

		const talkInterval = setInterval(() => {
			setRoasterImage((prev) =>
				prev === 'neutral' ? 'talking' : 'neutral'
			);
			count++;

			if (count >= cycles * 2) {
				clearInterval(talkInterval);
				setRoasterImage('neutral');
			}
		}, speed);
	}
}
