/**
 * Contains extension commands definitions and codes and activation script.
 * 
 * @author NickelAngeStudio <https://github.com/NickelAngeStudio>
 * 
 * @since 2023
 * 
 * @license MIT
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from './fileSystem';
import * as activation from './activation';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// 1. Verify if dependency "test_bins" is in Cargo.toml
	if(fs.isCrateAdded()) {
		// 1.1. Refresh tests_bin folder path.
		fs.refreshTestsBinFolder();

		// 1.2. Register code lens
		activation.registerCodeLens();
	} else {
		// If not found, show warning in log.
		console.warn("rust-tests-bin : Crate `tests_bin` not found in `Cargo.toml` [dependencies]!\nYou can add it with `cargo add tests_bin` command in your terminal.");
	}

	// 2. Create command to refresh extension bin folder path
	activation.registerExtensionCommand(context);

	// 3. Create status bar element if enabled
	if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('display.showInStatusBar'))
		{activation.createStatusBar(context);}

}

// This method is called when your extension is deactivated
export function deactivate() {
}

