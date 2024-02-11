import {
	Button,
	Container,
	Text,
	Title,
	Modal,
	TextInput,
	Group,
	Card,
	ActionIcon,
	Code,
	TimelineItem,
	Timeline
} from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import { MoonStars, Sun, Trash, Check } from 'tabler-icons-react';

import {
	MantineProvider,
	ColorSchemeProvider,
	ColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import FlipClockCountdown from "@flylikeapenguin/react-flip-clock-countdown";
import '@flylikeapenguin/react-flip-clock-countdown/dist/index.css';

export default function App() {
	// const dt = Date.parse('2024/02/11 13:24:50')
	const [dt, setDt] = useState(new Date().getTime() + 10000)
	const [tasks, setTasks] = useState([]);
	const [opened, setOpened] = useState(false);
	const [active, setActive] = useState(-1);
	const [showMET, setShowMET] = useState(new Date() > dt);

	const preferredColorScheme = useColorScheme();
	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'mantine-color-scheme',
		defaultValue: 'dark',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = value =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);

	const taskTitle = useRef('');
	const taskSummary = useRef('');
	// const dt = Date.parse('2024/03/02 07:28:34')

	function createTask() {
		setTasks([
			...tasks,
			{
				title: taskTitle.current.value,
				summary: taskSummary.current.value,
				complete: taskSummary.current.value
			},
		]);

		saveTasks([
			...tasks,
			{
				title: taskTitle.current.value,
				summary: taskSummary.current.value,
				complete: taskSummary.current.value
			},
		]);
	}

	function deleteTask(index) {
		var clonedTasks = [...tasks];

		clonedTasks.splice(index, 1);

		setTasks(clonedTasks);

		saveTasks([...clonedTasks]);
	}

	function loadTasks() {
		let loadedTasks = localStorage.getItem('tasks');

		let tasks = JSON.parse(loadedTasks);

		if (tasks) {
			setTasks(tasks);
		}
	}

	function saveTasks(tasks) {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}

	useEffect(() => {
		loadTasks();
	}, []);

	const getTasks = () => {
		return tasks.map((task, index) => {
			if (task.title) {
				return (
					<TimelineItem key={index} mt={'sm'}
						onClick={() => {
							setActive(index);
						}}>
						<Group position={'apart'}>
							<Text weight={'bold'}>{task.title}</Text>
							<ActionIcon
								onClick={() => {
									deleteTask(index);
								}}
								color={'gray'}
								variant={'transparent'}>
								<Trash />
							</ActionIcon>
						</Group>
						<Text color={'dimmed'} size={'md'} mt={'sm'}>
							{task.summary
								? task.summary
								: 'No summary was provided for this task'}
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
						<Modal
							opened={opened}
							size={'md'}
							title={'New Task'}
							withCloseButton={false}
							onClose={() => {
								setOpened(false);
							}}
							centered>
							<TextInput
								mt={'md'}
								ref={taskTitle}
								placeholder={'Task Title'}
								required
								label={'Title'}
							/>
							<TextInput
								ref={taskSummary}
								mt={'md'}
								placeholder={'Task Summary'}
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
										createTask();
										setOpened(false);
									}}>
									Create Task
								</Button>
							</Group>
						</Modal>
						<Container size={600} my={40}>
							<Group position={'apart'} className='flip-clock-down'>
								<Title sx={theme => ({
									fontFamily: `consolas, ${theme.fontFamily}`,
									fontWeight: 900
								})}>
									{showMET ? 'MET' : 'T-'}
								</Title>
								<FlipClockCountdown to={dt} hideOnComplete={false} />
							</Group>
							< Group position={'apart'}>
								<Title
									sx={theme => ({
										fontFamily: `Greycliff CF, ${theme.fontFamily}`,
										fontWeight: 900,
									})}>
									My Tasks
								</Title>
								<ActionIcon
									color={'blue'}
									onClick={() => toggleColorScheme()}
									size='lg'>
									{colorScheme === 'dark' ? (
										<Sun size={16} />
									) : (
										<MoonStars size={16} />
									)}
								</ActionIcon>
							</Group>
							{tasks.length > 0 ? (
								<Timeline active={active} color='blue' bulletSize={25}>
									{getTasks()}
								</Timeline>
							) : (
								<Text size={'lg'} mt={'md'} color={'dimmed'}>
									You have no tasks
								</Text>
							)}
							<Button
								onClick={() => {
									setOpened(true);
								}}
								fullWidth
								mt={'md'}>
								New Task
							</Button>
						</Container>
					</div>
				</MantineProvider>
			</ColorSchemeProvider >
		</div>
	);
}
