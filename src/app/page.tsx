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

	const [input, setInput] = useState('');
	const [roasterImage, setRoasterImage] = useState('lights_off');
	const [isLoading, setIsLoading] = useState(true);
	const [history, setHistory] = useState<ChatMessage[]>([]);
	const [loadedImage, setLoadedImage] = useState(roasterImage);
	const [imageHeight, setImageHeight] = useState(0); // dynamic image height

	const imageContainerRef = useRef<HTMLDivElement | null>(null);
	const chatContainerRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Play audio in background
	useEffect(() => {
		const audio = new Audio('/audio/soundtrack.mp3');
		audio.loop = true;
		audio.volume = 0.3;
		audioRef.current = audio;

		const startAudio = () => {
			audio.play().catch(() => console.log('Playback failed'));
			// Remove listener after first play
			window.removeEventListener('click', startAudio);
		};

		// Wait for any user interaction
		window.addEventListener('click', startAudio);

		return () => {
			audio.pause();
			window.removeEventListener('click', startAudio);
		};
	}, []);

	// Fix viewport height for iOS
	useEffect(() => {
		const setVH = () => {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		};
		setVH();
		window.addEventListener('resize', setVH);
		return () => window.removeEventListener('resize', setVH);
	}, []);

	// Measure image container height dynamically
	useEffect(() => {
		const updateHeight = () => {
			if (imageContainerRef.current) {
				setImageHeight(imageContainerRef.current.offsetHeight);
			}
		};

		updateHeight();
		window.addEventListener('resize', updateHeight);
		return () => window.removeEventListener('resize', updateHeight);
	}, [loadedImage]);

	useEffect(() => {
		const img = new window.Image();
		img.src = `/img/the_roaster_${roasterImage}.png`;
		img.onload = () => setLoadedImage(roasterImage);
	}, [roasterImage]);

	useEffect(() => {
		if (!isLoading && inputRef.current) inputRef.current.focus();
	}, [isLoading]);

	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [history]);

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

	useEffect(() => {
		const fetchInitialMessage = async () => {
			try {
				const res = await fetch('/api/chat/init');
				const data = await res.json();
				const firstMessage =
					data.firstMessage || 'How are you doing today?';
				roasterTalking(firstMessage.split(' ').length);
				printAIMessage(firstMessage);
			} catch {
				const fallback = 'How are you doing today?';
				roasterTalking(fallback.split(' ').length);
				printAIMessage(fallback);
			}
		};
		fetchInitialMessage();
	}, []);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const handleSend = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input.trim()) return;

		const userMessage = input.trim();
		setInput('');
		roasterThinking();
		setIsLoading(true);
		setHistory((prev) => [...prev, { role: 'user', text: userMessage }]);

		try {
			const apiResponse = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: userMessage, history }),
			});

			const data: ChatResponse = await apiResponse.json();
			const aiReply = data.reply;
			roasterTalking(aiReply.split(' ').length);
			printAIMessage(aiReply);
		} catch {
			roasterTalking();
			printAIMessage("You know what? I don't care.");
		}
	};

	return (
		<div
			className='flex flex-col items-center w-full overflow-hidden'
			style={{
				height: 'calc(var(--vh, 1vh) * 100)',
				backgroundColor: 'white',
			}}
		>
			{/* Audio player */}
			<audio
				ref={audioRef}
				src='/audio/soundtrack.mp3'
				loop
				autoPlay
				hidden
			/>

			{/* Fixed image container */}
			<div
				ref={imageContainerRef}
				className='fixed top-0 w-full flex justify-center bg-white z-10 p-4'
			>
				<Image
					src={`/img/the_roaster_${loadedImage}.png`}
					alt='The Roaster'
					width={700}
					height={700}
					className='w-full max-w-[700px] h-auto object-contain'
					priority
					onLoad={() => {
						if (imageContainerRef.current)
							setImageHeight(
								imageContainerRef.current.offsetHeight
							);
					}}
				/>
			</div>

			{/* Chat container with dynamic padding-top */}
			<div
				ref={chatContainerRef}
				className='flex flex-col w-full max-w-[700px] px-4 pb-24 space-y-6 overflow-y-auto scrollbar-hide flex-grow'
				style={{ paddingTop: `${imageHeight + 16}px` }} // +16px for safe spacing
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

			{/* Fixed input */}
			<form
				onSubmit={handleSend}
				className='fixed bottom-0 w-full max-w-[700px] flex gap-2 items-center bg-white px-4 pb-8 z-10'
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
					className='px-4 py-2 h-[52px] bg-gray-100 flex-grow rounded-full disabled:bg-transparent outline-none'
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
		if (thinkingInterval) return;
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
