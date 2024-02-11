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
	const [dt, setDt] = useState(new Date().getTime() + 5000)
	const [stages, setStages] = useState([]);
	const [opened, setOpened] = useState(false);
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

	const stageTitle = useRef('');
	const stageSummary = useRef('');
	// const dt = Date.parse('2024/03/02 07:28:34')
	function createStage() {
		setStages([
			...stages,
			{
				title: stageTitle.current.value,
				summary: stageSummary.current.value,
			},
		]);

		saveStages([
			...stages,
			{
				title: stageTitle.current.value,
				summary: stageSummary.current.value,
			},
		]);
	}

	function deleteStage(index) {
		var clonedStages = [...stages];

		clonedStages.splice(index, 1);

		setStages(clonedStages);

		saveStages([...clonedStages]);
	}

	function loadStages() {
		fetch('https://api.npoint.io/a89455894d88ff71c0cc')
			.then((response) => response.json())
			.then((responseJson) => {
				setStages(responseJson);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function saveStages(stages) {
		localStorage.setItem('stages', JSON.stringify(stages));
	}

	useEffect(() => {
		loadStages();
	}, []);

	const getStages = () => {
		return stages.map((stage, index) => {
			if (stage.title) {
				return (
					<TimelineItem key={index} mt={'sm'}
						onClick={() => {
							setActive(index);
							if (index === stages.length - 1) {
								fireworksRef.current?.start();
								setTimeout(() => fireworksRef.current?.waitStop(), 30000)
							}
						}}>
						<Group position={'apart'}>
							<Text weight={'bold'}>{stage.title}</Text>
							<ActionIcon
								onClick={() => {
									deleteStage(index);
								}}
								color={'dark'}
								variant={'transparent'}>
								<Trash />
							</ActionIcon>
						</Group>
						<Text color={'dimmed'} size={'md'} mt={'sm'}>
							{stage.summary
								? stage.summary
								: 'No summary was provided for this stage'}
						</Text>
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
									min: 25,
									max: 40
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
						<Modal
							opened={opened}
							size={'md'}
							title={'New Stage'}
							withCloseButton={false}
							onClose={() => {
								setOpened(false);
							}}
							centered>
							<TextInput
								mt={'md'}
								ref={stageTitle}
								placeholder={'Stage Title'}
								required
								label={'Title'}
							/>
							<TextInput
								ref={stageSummary}
								mt={'md'}
								placeholder={'Stage Summary'}
								label={'Summary'}
							/>
							<Group mt={'md'} position={'apart'}>
								<Button
									onClick={() => {
										setOpened(false);
									}}
									variant={'subtle'}>
									Cancel
								</Button>
								<Button
									onClick={() => {
										createStage();
										setOpened(false);
									}}>
									Create Stage
								</Button>
							</Group>
						</Modal>
						<Container size={600} my={40}>
							<Group position={'center'} className='flip-clock-down'>
								<Title sx={theme => ({
									fontFamily: `consolas, ${theme.fontFamily}`,
									fontWeight: 900,
									fontSize: 50
								})}>
									{showMET ? 'T+' : 'T-'}
								</Title>
								<FlipClockCountdown to={dt} hideOnComplete={false} onComplete={() => {
									setShowMET(true);
									setActive(0);
									fireworksRef.current?.start();
									setTimeout(() => {
										fireworksRef.current?.waitStop(); fireworksRef.current?.updateOptions({
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
							<Button
								onClick={() => {
									setOpened(true);
								}}
								fullWidth
								mt={'md'}>
								New Stage
							</Button>
						</Container>
					</div>
				</MantineProvider>
			</ColorSchemeProvider >
		</div>
	);
}
