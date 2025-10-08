'use client';

import {
	useState,
	useRef,
	useEffect,
	type FormEvent,
	type ChangeEvent,
} from 'react';
import { Input, Button } from '@headlessui/react';
import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatResponse {
	reply: string;
}

interface ChatMessage {
	role: 'user' | 'model';
	text: string;
}

export default function ChatBox() {
	let thinkingInterval: NodeJS.Timeout | null = null;

	const [input, setInput] = useState<string>('');
	const [roasterImage, setRoasterImage] = useState<string>('thinking_1');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [history, setHistory] = useState<ChatMessage[]>([]);

	const chatContainerRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const [loadedImage, setLoadedImage] = useState(roasterImage);

	useEffect(() => {
		const img = new window.Image();
		img.src = `/the_roaster_${roasterImage}.png`;
		img.onload = () => setLoadedImage(roasterImage);
	}, [roasterImage]);


	// Focus input whenever AI finishes
	useEffect(() => {
		if (!isLoading && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isLoading]);

	// Scroll to bottom helper
	const scrollToBottom = (): void => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	};

	// Auto-scroll when messages are added
	useEffect(() => {
		scrollToBottom();
	}, [history]);

	// === Word-by-word printing only for AI messages ===
	const printAIMessage = (text: string) => {
		const words = text.split(' ');
		let currentText = '';
		let i = 0;

		setIsLoading(true);
		const interval = setInterval(() => {
			currentText += (i === 0 ? '' : ' ') + words[i];
			setHistory((prev) => {
				const newHistory = [...prev];
				if (newHistory[newHistory.length - 1]?.role === 'model') {
					newHistory[newHistory.length - 1].text = currentText;
				} else {
					newHistory.push({ role: 'model', text: currentText });
				}
				return newHistory;
			});

			i++;
			if (i >= words.length) {
				clearInterval(interval);
				setIsLoading(false);
			}
		}, 100);
	};

	// Fetch the first AI message on mount
	useEffect(() => {
		roasterThinking();

		const fetchInitialMessage = async () => {
			try {
				const res = await fetch('/api/chat/init');
				const data: { firstMessage: string } = await res.json();
				const firstMessage =
					data.firstMessage || 'How are you doing today?';
				roasterTalking(firstMessage.split(' ').length);
				printAIMessage(firstMessage);
			} catch (err) {
				console.error('Failed to load initial message', err);
				const fallback = 'How are you doing today?';
				roasterTalking(fallback.split(' ').length);
				printAIMessage(fallback);
			}
		};

		fetchInitialMessage();
	}, []);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setInput(e.target.value);
	};

	const handleSend = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (!input.trim()) return;

		const userMessage = input.trim();
		setInput('');
		roasterThinking();
		setIsLoading(true);

		// Add user message instantly
		setHistory((prev) => [...prev, { role: 'user', text: userMessage }]);

		try {
			const apiResponse = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: userMessage, history }),
			});

			const data: ChatResponse | { error: string } =
				await apiResponse.json();

			if (!apiResponse.ok)
				throw new Error("You know what? I don't care.");

			const aiReply = (data as ChatResponse).reply;
			roasterTalking(aiReply.split(' ').length);
			printAIMessage(aiReply);
		} catch (err) {
			console.error(err);
			roasterTalking();
			printAIMessage("You know what? I don't care.");
		}
	};

	return (
		<div className='flex flex-col items-center w-full h-screen bg-white overflow-hidden'>
			{/* Image fixed at top */}
			<div className='w-full flex justify-center p-4'>
				<Image
					src={`/the_roaster_${loadedImage}.png`}
					alt='The Roaster'
					width={700}
					height={700}
					priority
					className='rounded-lg'
				/>
			</div>

			{/* Chat container */}
			<div
				ref={chatContainerRef}
				className='flex flex-col w-full max-w-[700px] flex-grow px-4 pt-4 mb-24 space-y-6 overflow-y-auto scrollbar-hide'
			>
				{history.map((msg, idx) => (
					<div key={idx} className='flex flex-col'>
						<div
							className={`text-sm mb-1 ${
								msg.role === 'user'
									? 'text-red-700 mr-2 text-right'
									: 'text-gray-700 ml-2 text-left'
							}`}
						>
							{msg.role === 'user' ? 'Crowd' : 'The Roaster'}
						</div>
						<div
							className={`px-4 py-3 font-semibold text-xl rounded-lg max-w-[80%] break-words ${
								msg.role === 'user'
									? 'bg-red-700 text-white self-end'
									: 'bg-gray-950 text-white self-start'
							}`}
						>
							{msg.text}
						</div>
					</div>
				))}
			</div>

			{/* Input fixed at bottom */}
			<form
				onSubmit={handleSend}
				className='flex flex-row gap-2 w-full max-w-[700px] fixed bottom-0 pb-8 bg-white px-4 mx-auto'
			>
				<Input
					ref={inputRef}
					type='text'
					value={input}
					onChange={handleInputChange}
					placeholder={
						isLoading ? 'The Roaster is thinking...' : 'Roast me...'
					}
					disabled={isLoading}
					className='px-4 py-2 h-[52px] bg-gray-100 flex-grow rounded-full disabled:bg-transparent outline-none w-full max-w-[300px] sm:max-w-[700px]'
				/>
				{!isLoading && (
					<Button
						type='submit'
						disabled={isLoading || !input.trim()}
						className='p-4 rounded-full bg-red-700 font-bold text-xl text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
					>
						<PaperAirplaneIcon className='w-5 h-5' />
					</Button>
				)}
			</form>

			{/* Hide scrollbar */}
			<style jsx>{`
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</div>
	);

	// === Animation helpers ===
	function roasterThinking(): void {
		if (thinkingInterval) {
			return;
		}
		const speed = 300;
		thinkingInterval = setInterval(() => {
			setRoasterImage((prev) =>
				prev === 'thinking_1' ? 'thinking_2' : 'thinking_1'
			);
		}, speed);
	}

	function roasterTalking(numberOfWords: number = 10): void {
		if (thinkingInterval) {
			clearInterval(thinkingInterval);
			thinkingInterval = null;
		}

		setRoasterImage('talking');
		const speed = 100;
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
