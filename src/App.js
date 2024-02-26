import {
	Button,
	Container,
	Text,
	Title,
	Modal,
	TextInput,
	Group,
	ActionIcon,
	TimelineItem,
	Timeline
} from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import { MoonStars, Sun, Trash } from 'tabler-icons-react';

import {
	MantineProvider,
	ColorSchemeProvider,
} from '@mantine/core';
import { Fireworks } from '@fireworks-js/react'
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import FlipClockCountdown from "@flylikeapenguin/react-flip-clock-countdown";
import '@flylikeapenguin/react-flip-clock-countdown/dist/index.css';

export default function App() {
	// const dt = Date.parse('2024/02/11 13:24:50')
	const [timeNow, setTimeNow] = useState(new Date());
	const [dt, setDt] = useState(new Date().getTime() + 60000)
	const [stages, setStages] = useState([]);
	const [active, setActive] = useState(-1);
	const [showMET, setShowMET] = useState(new Date() > dt);
	const fireworksRef = useRef(null)
	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'mantine-color-scheme',
		defaultValue: 'dark',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = value =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);

	// function deleteStage(index) {
	// 	var clonedStages = [...stages];

	// 	clonedStages.splice(index, 1);

	// 	setStages(clonedStages);

	// 	saveStages([...clonedStages]);
	// }

	function loadDataStore() {
		fetch('https://api.npoint.io/a89455894d88ff71c0cc')
			.then((response) => response.json())
			.then((responseJson) => {
				setStages(responseJson.stages);
				setDt(responseJson.liftoffTime)
				setActive(responseJson.activeStage)
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function saveStages(stages) {
		localStorage.setItem('stages', JSON.stringify(stages));
	}

	function deltaTimeString(target, now) {
		var delta = (new Date(target).getTime() - now) / 1000;
		if (delta < 0) {
			return ''
		}
		// calculate (and subtract) whole days
		var days = Math.floor(delta / 86400);
		delta -= days * 86400;

		// calculate (and subtract) whole hours
		var hours = Math.floor(delta / 3600) % 24;
		delta -= hours * 3600;

		// calculate (and subtract) whole minutes
		var minutes = Math.floor(delta / 60) % 60;
		delta -= minutes * 60;

		// what's left is seconds
		var seconds = Math.floor(delta % 60);
		return `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}

	useEffect(() => {
		loadDataStore();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeNow(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const getStages = () => {
		return stages.map((stage, index) => {
			if (stage.title) {
				return (
					<TimelineItem key={index} mt={'sm'}
						onClick={() => {
							setActive(index);
							if (stages[index].fireworks === true) {
								fireworksRef.current?.start();
								setTimeout(() => fireworksRef.current?.waitStop(), 30000)
							}
						}}>
						<Group position={'apart'}>
							<Text weight={'bold'}>{stage.title}</Text>
							{/* <ActionIcon
								onClick={() => {
									deleteStage(index);
								}}
								color={'dark'}
								variant={'transparent'}>
								<Trash />
							</ActionIcon> */}
						</Group>
						<Group position={'apart'}>
							<Text color={'dimmed'} size={'md'} mt={'sm'}>
								{stage.summary
									? stage.summary
									: ''}
							</Text>
							<Text color={'dimmed'} size={'md'} mt={'sm'}>
								{stage.time
									? deltaTimeString(stage.time, timeNow)
									: ''}
							</Text>
						</Group>
					</TimelineItem>
				);
			}
		})

	}

	return (
		<div>
			<ColorSchemeProvider
				colorScheme={colorScheme}
				toggleColorScheme={toggleColorScheme}>
				<MantineProvider
					theme={{ colorScheme, defaultRadius: 'md' }}
					withGlobalStyles
					withNormalizeCSS>
					<div className='App'>
						<Fireworks
							ref={fireworksRef}
							options={{
								opacity: 0.2,
								brightness: { min: 10, max: 20 },
								hue: {
									min: 0,
									max: 360
								}
							}}
							autostart={false}
							style={{
								top: "30%",
								left: 0,
								width: '100%',
								height: '100%',
								position: 'fixed',

							}}
						/>
						<Container size={400} my={40}>
							<Group position={'center'} className='flip-clock-down'>
								<Title sx={theme => ({
									fontFamily: `consolas, ${theme.fontFamily}`,
									fontSize: 30
								})}>
									{showMET ? 'T+' : 'T-'}
								</Title>
								<FlipClockCountdown to={dt} hideOnComplete={false} digitBlockStyle={{ width: 30, height: 60, fontSize: 30 }} onComplete={() => {
									setShowMET(true);
									setActive(0);
									fireworksRef.current?.updateOptions({
										opacity: 0.2,
										brightness: { min: 10, max: 20 },
										hue: {
											min: 20,
											max: 40
										}
									})
									fireworksRef.current?.start();
									setTimeout(() => {
										fireworksRef.current?.waitStop();
										fireworksRef.current?.updateOptions({
											opacity: 0.2,
											brightness: { min: 10, max: 20 },
											hue: {
												min: 0,
												max: 360
											}
										})
									}, 5000);

								}} />
							</Group>
							< Group position={'apart'}>
								<Title
									sx={theme => ({
										fontFamily: `Greycliff CF, ${theme.fontFamily}`,
										fontWeight: 900,
										paddingTop: 15
									})}>
									Mission Progress
								</Title>
								<ActionIcon
									color={'gray'}
									onClick={() => toggleColorScheme()}
									size='lg'>
									{colorScheme === 'dark' ? (
										<Sun size={16} />
									) : (
										<MoonStars size={16} />
									)}
								</ActionIcon>
							</Group>
							{stages.length > 0 ? (
								<Timeline active={active} color='blue' bulletSize={25}>
									{getStages()}
								</Timeline>
							) : (
								<Text size={'lg'} mt={'md'} color={'dimmed'}>
									You have no stages
								</Text>
							)}
						</Container>
					</div>
				</MantineProvider>
			</ColorSchemeProvider >
		</div>
	);
}
