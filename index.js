process.env.NODE_ENV = 'production';

const path = require('path');
const url = require('url');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

let addDocWin, main;

const mainMenu = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Add document',
				click() {
					addDocumentWindow();
				},
				accelerator:
					process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
			},
			{
				label: 'Clear document',
				click() {
					main.webContents.send('doc:clear');
				},
				accelerator:
					process.platform == 'darwin'
						? 'Command+Alt+C'
						: 'Ctrl+Alt+C',
			},
			{
				label: 'Exit',
				accelerator:
					process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				},
			},
		],
	},
];

function menuMac() {
	if (process.platform == 'darwin') {
		mainMenu.unshift({ label: '' });
	}
}

function enableDevTools() {
	if (
		process.env.NODE_ENV !== 'production' ||
		process.env.NODE_ENV === undefined
	) {
		mainMenu.push({
			label: 'Toggle DevTools',
			accelerator: process.platform == 'darwin' ? 'Command+T' : 'Ctrl+T',
			click: (i, fw) => {
				fw.toggleDevTools();
			},
		});
	}
}

function displayMenu() {
	menuMac();
	enableDevTools();

	const menu = Menu.buildFromTemplate(mainMenu);
	Menu.setApplicationMenu(menu);
}

function addWindow(winName, params) {
	let win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
		...params,
	});
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, 'static', `${winName}.html`),
			protocol: 'file',
			slashes: true,
		})
	);
	return win;
}

function addDocumentWindow() {
	addDocWin = addWindow('doc', {
		width: 400,
		height: 500,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			resizable: false,
		},
		title: 'Add Document',
	});
	addDocWin.on('close', () => {
		addDocWin = null;
	});
}

ipcMain.on('doc:add', (e, item) => {
	main.webContents.send('doc:add', item);
	addDocWin.close();
});

app.on('ready', () => {
	main = addWindow('index', {
		nodeIntegration: true,
		contextIsolation: false,
	});
	displayMenu();

	main.on('closed', () => {
		app.quit();
	});
});
