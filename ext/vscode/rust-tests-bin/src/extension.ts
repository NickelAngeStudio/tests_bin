// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { TestsBinCodeLensProvider } from './binCodeLens';

// Collection of objects to be disposed when deactivated.
let disposables: vscode.Disposable[] = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Activated!');

	const openFileCLPrv = new TestsBinCodeLensProvider();

	// Register code lens provider only for rust files
	vscode.languages.registerCodeLensProvider('rust', openFileCLPrv);

	// Command to open the unit test file
	vscode.commands.registerCommand("rust-tests-bin.openFile", (args: any) => {
		vscode.window.showInformationMessage(`CodeLens action clicked with args=${args}`);
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('rust-tests-bin.burnBaby', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Burn baby from rust-tests-bin!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (disposables) {
		disposables.forEach(item => item.dispose());
	}
	disposables = [];
}
