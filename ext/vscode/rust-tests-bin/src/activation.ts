/**
 * Contains functions called during extension activation.
 * 
 * @author NickelAngeStudio <https://github.com/NickelAngeStudio>
 * 
 * @since 2023
 * 
 * @license MIT
 */

import * as vscode from 'vscode';
import { TestsBinCodeLensProvider } from './binCodeLens';
import * as fs from './fileSystem';

// `tests_bin` status bar.
let statusBar: vscode.StatusBarItem;

/**
 * Statusbar quick item definition
 */
class StatusBarQuickPickItem implements vscode.QuickPickItem {
	command : string;   // Command to be executed on selection.
  
  	constructor(public label: string, public detail: string, command : string) {
    	this.command = command;
  	}

    // Execute quick pick command
    execute() {
        vscode.commands.executeCommand(this.command);
    }

}

let quickRefresh =  new StatusBarQuickPickItem("Refresh base folder", 
    "Refresh `tests_bin` base folder after change in `.cargo/config.toml`.", 
    "rust-tests-bin.refresh");

let quickReload =  new StatusBarQuickPickItem("Reload `rust-tests-bin`", 
    "Reload `rust-tests_bin` extension for setting changes.", 
    "rust-tests-bin.reload");

let quickToggleRename =  new StatusBarQuickPickItem("Toggle `Rename file` shortcut", 
    "Hide / show the `Rename file` shortcut of unit tests macro.", 
    "rust-tests-bin.toggleRename");

let quickOpenFolder =  new StatusBarQuickPickItem("Open `tests_bin` base folder", 
    "Open `tests_bin` base folder in explorer.", 
    "rust-tests-bin.openFolder");






/**
 * Create `tests_bin` status bar.
 * @param context Context of extension.
 */
export function create_status_bar(context: vscode.ExtensionContext) {

	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 500);
	statusBar.text = `$(folder) tests_bin`;
	statusBar.tooltip = "Click to open quick pick menu";	
	statusBar.command = "rust-tests-bin.statusBarMenu";
	statusBar.show();

	context.subscriptions.push(statusBar);

}


/**
 * Register the refresh command used to refresh paths.
 * @param context Context of extension
 */
export function register_refresh_command(context: vscode.ExtensionContext){
	// C1. Refresh tests_bin folder command
	context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.refresh', () => {
		// Refresh tests_bin folder
		fs.refresh_tests_bin_folder();
		
		// Message that refresh is completed.
		vscode.window.showInformationMessage('`rust-tests-bin` path refreshed!');
	}));

	// C2. Show status bar quick pick menu
	// Ref : https://github.com/microsoft/vscode-extension-samples/blob/main/quickinput-sample/src/extension.ts
	context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.statusBarMenu', () => {

        // Create quick pick with options
		const quickPick = vscode.window.createQuickPick();		
		quickPick.items = [ quickOpenFolder, quickRefresh , quickReload, quickToggleRename ];

        // Register quick pick events
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				(<StatusBarQuickPickItem>selection[0]).execute();
                quickPick.hide();
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());

        // Show quick pick
		quickPick.show();
		
	}));

    
    // C3. Toggle `Rename file` shortcut.
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.toggleRename', () => {

        let current_value = vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('showRenameFile');

        // Update configuration
        vscode.workspace.getConfiguration('rust-tests-bin').update("showRenameFile", !current_value);

        // Show toggle value in message
        if(!current_value){
            vscode.window.showInformationMessage('`Rename file` shortcut activated.');
        } else {
            vscode.window.showInformationMessage('`Rename file` shortcut disabled.');
        }
        
    }));

    // C4. Open tests_bin base folder.
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.openFolder', () => {

        fs.open_tests_bin_folder();
            
    }));

    // C5. Reload `rust-tests-bin` extension
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.reload', () => {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
    }));


}

/**
 * Register the `tests_bin` code lens that provide shortcut for macros.
 */
export function register_code_lens() {
	const binCodeLensProvider = new TestsBinCodeLensProvider();

	// Register code lens provider only for rust files
	vscode.languages.registerCodeLensProvider('rust', binCodeLensProvider);

	// Command to open the unit test file
	vscode.commands.registerCommand("rust-tests-bin.open", (args: [string, vscode.Range | vscode.Position]) => {
		fs.open_file_in_vscode(args[0]);
	});

	// Command to rename the unit test file
	vscode.commands.registerCommand("rust-tests-bin.rename", (args: [string, vscode.Range | vscode.Position]) => {
		let result = fs.rename_tests_file(args[0]);

		result.then( (filename) => {
			// If input wan't canceled.
			if(filename != undefined) {
				// Write macro parameters with filename
				const textEditor = vscode.window.activeTextEditor;

				if(textEditor){
					textEditor.edit( builder => {
						builder.replace(<vscode.Range>args[1], "\"" + filename + "\"");		// Replace with new filename	
					});
				}
			}
		}).catch ( (error) => {
			// Show error message
			vscode.window.showErrorMessage(error.toString());
		});
	});

	// Command to create the unit test file
	vscode.commands.registerCommand("rust-tests-bin.create", async (args: [string, vscode.Range | vscode.Position]) => {
		
		let result = fs.create_tests_file(args[0]);

		result.then( (filename) => {
			// If input wan't canceled.
			if(filename != undefined) {
				// Write macro parameters with filename
				const textEditor = vscode.window.activeTextEditor;

				if(textEditor){
					textEditor.edit( builder => {
						if(typeof args[1] === typeof vscode.Position)	// We insert since no "" defined.
							builder.insert(<vscode.Position>args[1], "\"" + filename + "\"")
						else	// Replace content in ""
							builder.replace(<vscode.Range>args[1], "\"" + filename + "\"");
					});
				}
			}
		}).catch ( (error) => {
			// Show error message
			vscode.window.showErrorMessage(error.toString());
		});
		

	});
}