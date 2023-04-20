/**
 * Contains codeLens provider.
 * 
 * @author NickelAngeStudio <https://github.com/NickelAngeStudio>
 * 
 * @since 2023
 * 
 * @license MIT
 * 
 * @see https://github.com/microsoft/vscode-extension-samples/tree/main/codelens-sample
 * 
 */

import * as vscode from 'vscode';
import { is_file_in_bin } from './fileSystem';
import * as parser from './parser';

/**
 * Code lens that provide quick shortcut when it detect tests_bin crate macros.
 * 
 * Will verify if file exists and offer to create it if it doesn't.
 * Will offer option to open and rename file if exists.
 * 
 * @ref https://github.com/microsoft/vscode-extension-samples/
 */
export class TestsBinCodeLensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];		// Codelens array of this procider
	private macroRegex: RegExp;						// Regex to find `tests_bin` macros

	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		// This regex detect #[unit_tests()] attribute and unit__tests! (), {} proc macro.
        this.macroRegex = /#\[unit_tests\([^)]*\)\]|unit__tests!\([^)]*\)|unit__tests!\{[^}]*\}/g;

		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});
	}

	/**
	 * Call by provider on onDidChangeConfiguration to create codeLens
	 * @param document Document to put codeLens into
	 * @param token Cancellation token
	 * @returns Array of codeLens created.
	 */
	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

		this.codeLenses = [];	// Reset codeLens array.

		if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('showCodeLens')) {	// If codeLens are showed
			const text = document.getText();	// Get text from document.
			const comments = parser.get_document_comment_ranges(document);	// Get comments ranges to make sure part found aren't commented.

			// Reset regex
			this.macroRegex.lastIndex = 0;
		
			let matches;
			while ((matches = this.macroRegex.exec(text)) !== null) {

				if(!this.is_commented(matches.index, comments)){	// Make sure match isn't commented
					let param = parser.get_filename_range_position(document, matches);	// Get macro parameters
					let range = parser.get_match_range(document, matches);	// Get macro range for codelens

					if(typeof param[1] === typeof vscode.Position) {	// Show create file since filename parameter not found
						this.create_codelens_to_create_file(range, param);
					} else {
						if(is_file_in_bin(param[0])) 
							this.create_codelens_for_existing_file(range, param);	// File exists, create Open file and Rename File codelens
						else 
							this.create_codelens_to_create_file(range, param);		// File doesn't exists, create Create file codelens
					}
				}		
			}
		}

		return this.codeLenses;

	}

	/**
	 * Create the codeLens Open file and Rename file
	 * @param range Range that codeLens apply to
	 * @param param Macro parameters.
	 */
	private create_codelens_for_existing_file(range: vscode.Range, param: [string, vscode.Range | vscode.Position]) {

		// Open file codelens
		this.codeLenses.push(new vscode.CodeLens(range, {
			title: this.get_shortcut_title("folder-opened", "Open file"),
			tooltip: "Open unit tests file from bin.",
			command: "rust-tests-bin.open",
			arguments: [param]
		}));

		if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('showRenameFile')){	// Only if enabled
			// Rename file codelens
			this.codeLenses.push(new vscode.CodeLens(range, {
				title: this.get_shortcut_title("replace-all", "Rename file"),
				tooltip: "Rename tests file from bin.",
				command: "rust-tests-bin.rename",
				arguments: [param]
			}));
		}

		if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('showDeleteFile')){	// Only if enabled
			// Delete file codelens
			this.codeLenses.push(new vscode.CodeLens(range, {
				title: this.get_shortcut_title("trash", "Delete file"),
				tooltip: "Delete tests file from bin.",
				command: "rust-tests-bin.delete",
				arguments: [param]
			}));
		}
	}

	/**
	 * Create the codeLens Create file
	 * @param range Range that codeLens apply to
	 * @param param Macro parameters.
	 */
	private create_codelens_to_create_file(range: vscode.Range, param: [string, vscode.Range | vscode.Position]){

		// Create file codelens
		this.codeLenses.push(new vscode.CodeLens(range, {
			title: this.get_shortcut_title("new-file", "Create file"),
			tooltip: "Create unit tests file in bin.",
			command: "rust-tests-bin.create",
			arguments: [param]
		}));

	}

	/**
	 * Verify if regex match index is within a commented section
	 * @param match Match to verify
	 * @param comments Array of comments indexes
	 */
	private is_commented(index : number, comments : Array<[start : number, end: number]>) : boolean{
		
		let is_commented = false;
		comments.forEach(range => {	// Verify if index is withing range
			if(index > range[0] && index < range[1])	// index will NEVER be exactly start or end.
				is_commented = true;
		});

		return is_commented;

	}

	/**
	 * Get shortcut title according to shortcutDisplay configuration.
	 * @param icon Icon to show
	 * @param text Text to show
	 * @returns status bar text formatted.
	 */
	private get_shortcut_title(icon : string, text : string) : string {

		switch(vscode.workspace.getConfiguration('rust-tests-bin').get<string>('shortcutDisplay')){
			case "Icon only":
				return "$(" + icon + ")";
			
			case "Text only": 
				return text;
			
			default:{
				return "$(" + icon + ") " + text;
			}
		}
	}

}
