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

let quickRefresh =  new StatusBarQuickPickItem("$(sync) Refresh base folder", 
    "Refresh `tests_bin` base folder after change in `.cargo/config.toml`.", 
    "rust-tests-bin.refresh");

let quickReload =  new StatusBarQuickPickItem("$(refresh) Reload `rust-tests-bin`", 
    "Reload `rust-tests_bin` extension for setting changes.", 
    "rust-tests-bin.reload");

let quickToggleRename =  new StatusBarQuickPickItem("Toggle `$(replace-all) Rename file` shortcut", 
    "Hide / show the `Rename file` shortcut of unit tests macro.", 
    "rust-tests-bin.toggleRename");

let quickToggleDelete =  new StatusBarQuickPickItem("Toggle `$(trash) Delete file` shortcut", 
    "Hide / show the `Delete file` shortcut of unit tests macro.", 
    "rust-tests-bin.toggleDelete");

let quickOpenFolder =  new StatusBarQuickPickItem("$(folder) Open `tests_bin` base folder", 
    "Open `tests_bin` base folder in explorer.", 
    "rust-tests-bin.openFolder");

let quickToggleCodeLens =  new StatusBarQuickPickItem("Toggle `$(inspect) codeLens`", 
	"Hide / Show shortcuts above `unit_tests` macros.", 
	"rust-tests-bin.toggleCodeLens");

let quickOpenSettings =  new StatusBarQuickPickItem("$(gear) Open settings", 
	"Open rust-tests-bin extension settings.", 
	"rust-tests-bin.openSettings");






/**
 * Create `tests_bin` status bar.
 * @param context Context of extension.
 */
export function createStatusBar(context: vscode.ExtensionContext) {

	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 500);
	statusBar.text = `$(folder) tests_bin`;
	statusBar.tooltip = "Click to open quick pick menu";	
	statusBar.command = "rust-tests-bin.statusBarMenu";
	statusBar.show();

	context.subscriptions.push(statusBar);

}

/**
 * Register the extension commands.
 * @param context Context of extension
 */
export function registerExtensionCommand(context: vscode.ExtensionContext){
	// C1. Refresh tests_bin folder command
	context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.refresh', () => {
		// Refresh tests_bin folder
		fs.refreshTestsBinFolder();
		
		// Message that refresh is completed.
		vscode.window.showInformationMessage('`rust-tests-bin` path refreshed!');
	}));

	// C2. Show status bar quick pick menu
	// Ref : https://github.com/microsoft/vscode-extension-samples/blob/main/quickinput-sample/src/extension.ts
	context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.statusBarMenu', () => {

        // Create quick pick with options
		const quickPick = vscode.window.createQuickPick();	
		
		switch(process.platform){	// Some options are different according to platform.
			case 'win32':
				// Windows platform `quickOpenFolder` doesn't work correctly.
				quickPick.items = [ quickOpenSettings, quickRefresh , quickReload, quickToggleRename, quickToggleDelete, quickToggleCodeLens ];
    		break;

  			default:
				quickPick.items = [ quickOpenSettings, quickOpenFolder, quickRefresh , quickReload, quickToggleRename, quickToggleDelete, quickToggleCodeLens ];
		}
		
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
		toggleBooleanConfiguration("display.showRenameFile", "`Rename file` shortcut");         
    }));

    // C4. Open tests_bin base folder.
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.openFolder', () => {
        fs.openTestsBinFolder();
    }));

    // C5. Reload `rust-tests-bin` extension
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.reload', () => {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
    }));

	// C6. Toggle `codeLens` shortcut.
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.toggleCodeLens', () => {
		toggleBooleanConfiguration("display.showCodeLens", "`codeLens` shortcut");        
    }));

	// C7. Toggle `Delete file` shortcut.
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.toggleDelete', () => {
		toggleBooleanConfiguration("display.showDeleteFile", "`Delete file` shortcut");         
    }));

	// C8. Select default content file path.
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.selectContentPath', () => {

		let result = fs.showSelectFileDialog("Select Rust file to copy content from", getDefaultPathUri(), {'rustFiles': ['rs']});

		result.then( (fileUri) => {
			if(fileUri){		// Update configuration value.
				vscode.workspace.getConfiguration('rust-tests-bin').update("newFile.contentPath", fileUri);

				// Show changed setting (Will make Modified in workspace appear)
				vscode.commands.executeCommand('workbench.action.openSettings');

				// Show confirmatin message
				vscode.window.showInformationMessage('Workspace setting for `Content Path` updated!');

			}
		}).catch ( (error) => {
			// Show error message
			vscode.window.showErrorMessage(error.toString());
		});
		
    }));

	// C9. Open rust-tests-bin extension settings.
    context.subscriptions.push(vscode.commands.registerCommand('rust-tests-bin.openSettings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', "rust-tests-bin");         
    }));
}

/**
 * Get the default new file content path as Uri.
 */
function getDefaultPathUri() : vscode.Uri {
	let path = vscode.workspace.getConfiguration('rust-tests-bin').get<string>('newFile.contentPath');
	if(path){
		return vscode.Uri.parse(path);
	} else {
		return vscode.Uri.parse("");
	}
}

/**
 * Toggle a boolean configuration
 * @param property Name of the configuration
 * @param label Label used to confirm new state
 */
function toggleBooleanConfiguration(property : string, label : string) {

	let currentValue = vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>(property);

	// Update configuration
	vscode.workspace.getConfiguration('rust-tests-bin').update(property, !currentValue);

	// Show toggle value in message
	if(!currentValue){
		vscode.window.showInformationMessage(label + '` activated.');
	} else {
		vscode.window.showInformationMessage(label + '` disabled.');
	}

}

/**
 * Register the `tests_bin` code lens that provide shortcut for macros.
 */
export function registerCodeLens() {
	const binCodeLensProvider = new TestsBinCodeLensProvider();

	// Register code lens provider only for rust files
	vscode.languages.registerCodeLensProvider('rust', binCodeLensProvider);

	// Command to open the unit test file
	vscode.commands.registerCommand("rust-tests-bin.open", (args: [string, vscode.Range | vscode.Position]) => {
		fs.openFileInCscode(args[0]);
	});
	

	// Command to rename the unit test file
	vscode.commands.registerCommand("rust-tests-bin.rename", (args: [string, vscode.Range | vscode.Position]) => {
		let result = fs.renameTestsFile(args[0]);

		result.then( (filename) => {
			// If input wan't canceled.
			if(filename !== undefined) {
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

	// Command to rename the delete test file
	vscode.commands.registerCommand("rust-tests-bin.delete", (args: [string, vscode.Range | vscode.Position]) => {

		let result = fs.deleteTestsFile(args[0]);

		result.then( (isDeleted) => {
			if(isDeleted){		// Show deletion confirmation.
				vscode.window.showInformationMessage('`' + args[0] + '` deleted.');
			}
		}).catch ( (error) => {
			// Show error message
			vscode.window.showErrorMessage(error.toString());
		});
	
	});

	// Command to create the unit test file
	vscode.commands.registerCommand("rust-tests-bin.create", async (args: [string, vscode.Range | vscode.Position]) => {
		
		let result = fs.createTestsFile(args[0]);

		result.then( (filename) => {
			// If input wan't canceled.
			if(filename !== undefined) {
				// Write macro parameters with filename
				const textEditor = vscode.window.activeTextEditor;

				if(textEditor){
					textEditor.edit( builder => {
						if(typeof args[1] === typeof vscode.Position)	// We insert since no "" defined.
							{builder.insert(<vscode.Position>args[1], "\"" + filename + "\"");}
						else	// Replace content in ""
							{builder.replace(<vscode.Range>args[1], "\"" + filename + "\"");}
					});
				}
			}
		}).catch ( (error) => {
			// Show error message
			vscode.window.showErrorMessage(error.toString());
		});
		

	});
}