// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TestsBinCodeLensProvider } from './binCodeLens';
import { is_crate_added, refresh_tests_bin_folder, create_tests_file } from './fileSystem';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// 1. Verify if dependency "test_bins" is in Cargo.toml
	if(is_crate_added()) {
		// 1.1. Refresh tests_bin folder path.
		refresh_tests_bin_folder();

		// 1.2. Register code lens
		register_code_lens();
	} else {
		// If not found, show warning in log.
		console.warn("rust-tests-bin : Crate `tests_bin` not found in `Cargo.toml` [dependencies]!\nYou can add it with `cargo add tests_bin` command in your terminal.");
	}

	// 2. Create command to refresh extension bin folder path
	register_refresh_command(context);

}

// This method is called when your extension is deactivated
export function deactivate() {
}

/**
 * Register the refresh command used to refresh paths.
 * @param context Context of extension
 */
function register_refresh_command(context: vscode.ExtensionContext){
	context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.refresh', () => {
		// 1. Refresh tests_bin folder
		refresh_tests_bin_folder();
		
		// 2. Message that refresh is completed.
		vscode.window.showInformationMessage('`rust-tests-bin` path refreshed!');
	}));
}

/**
 * Register the `tests_bin` code lens that provide shortcut for macros.
 */
function register_code_lens() {
	const binCodeLensProvider = new TestsBinCodeLensProvider();

	// Register code lens provider only for rust files
	vscode.languages.registerCodeLensProvider('rust', binCodeLensProvider);

	// Command to open the unit test file
	vscode.commands.registerCommand("rust-tests-bin.open", (args: [string, string]) => {
		//vscode.window.showInformationMessage(`${tests_bin_folder} action clicked with args=${args}`);
	});

	// Command to rename the unit test file
	vscode.commands.registerCommand("rust-tests-bin.rename", (args: [string, string]) => {
		//vscode.window.showInformationMessage(`${tests_bin_folder} action clicked with args=${args}`);
	});

	// Command to create the unit test file
	vscode.commands.registerCommand("rust-tests-bin.create", async (args: [string, string]) => {
		
		let result = create_tests_file(args[0]);


		result.then( (filename) => {
			// If input wan't canceled.
			if(filename != undefined) {
				// Write macro parameters with filename
				console.log("Filename=", filename);
			}
		}).catch ( (error) => {
			// Show error message
			vscode.window.showErrorMessage(error.toString());
		});
		

	});
}
