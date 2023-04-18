import * as vscode from 'vscode';
import { is_file_in_bin } from './fileSystem';

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
	private parenthesisRegex: RegExp;				// Regex to extract content between parenthesis
	private braceRegex: RegExp;						// Regex to extract content between curly braces.
	private commentRegex: RegExp;					// Regex to extract comments from document

	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		// This regex detect #[unit_tests()] attribute and unit__tests! (), {} proc macro.
        this.macroRegex = /#\[unit_tests\([^)]*\)\]|unit__tests!\([^)]*\)|unit__tests!\{[^}]*\}/g;

		// This regex extraxt comments from document. 
		// Ref : https://stackoverflow.com/questions/5989315/regex-for-match-replacing-javascript-comments-both-multiline-and-inline
		this.commentRegex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;


		// Mixing both regex seems to create unwanted behaviour
		this.parenthesisRegex = /\((.*)\)/i;	// Get parameters between parenthesis
		this.braceRegex = /\{(.*)\}/i;			// Get parameters between braces

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
		const text = document.getText();	// Get text from document.

		if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('verifyIfComment')){ // If true, won't show codeLens for commented macros. (Slower)
			const comments = this.get_document_comment_range(document);	// Get comments ranges to make sure part found aren't commented.
		
			let matches;
			while ((matches = this.macroRegex.exec(text)) !== null) {

				if(!this.is_commented(matches.index, comments)){	// Make sure match isn't commented
					let param = this.get_macro_parameters(matches);	// Get macro parameters
					let range = this.get_match_range(document, matches, this.macroRegex);	// Get macro range for codelens

					if (range)
						if(is_file_in_bin(param[0])) 
							this.create_codelens_for_existing_file(range, param);	// File exists, create Open file and Rename File codelens
						else 
							this.create_codelens_to_create_file(range, param);		// File doesn't exists, create Create file codelens
				}		
			}
		} else {	// Don't verify if macro is commented (faster)
			let matches;
			while ((matches = this.macroRegex.exec(text)) !== null) {
				let param = this.get_macro_parameters(matches);	// Get macro parameters
				let range = this.get_match_range(document, matches, this.macroRegex);	// Get macro range for codelens

				if (range)
					if(is_file_in_bin(param[0])) 
						this.create_codelens_for_existing_file(range, param);	// File exists, create Open file and Rename File codelens
					else 
						this.create_codelens_to_create_file(range, param);		// File doesn't exists, create Create file codelens
			}
		}
		

		return this.codeLenses;
	}

	/**
	 * Create the codeLens Open file and Rename file
	 * @param range Range that codeLens apply to
	 * @param param Macro parameters.
	 */
	private create_codelens_for_existing_file(range: vscode.Range, param: [string, string]) {
		// Open file codelens
		this.codeLenses.push(new vscode.CodeLens(range, {
			title: "Open file",
			tooltip: "Open unit tests file from bin.",
			command: "rust-tests-bin.open",
			arguments: [param]
		}));

		// Rename file codelens
		this.codeLenses.push(new vscode.CodeLens(range, {
			title: "Rename file",
			tooltip: "Rename tests file from bin.",
			command: "rust-tests-bin.rename",
			arguments: [param]
		}));
	}

	/**
	 * Create the codeLens Create file
	 * @param range Range that codeLens apply to
	 * @param param Macro parameters.
	 */
	private create_codelens_to_create_file(range: vscode.Range, param: [string, string]){

		// Create file codelens
		this.codeLenses.push(new vscode.CodeLens(range, {
			title: "Create file",
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
	 * Get document comments ranges in an array of tuples.
	 * @param document Document to get comments range from
	 * @returns Array of comments range.
	 */
	private get_document_comment_range(document: vscode.TextDocument) : Array<[start : number, end: number]> {

		let text = document.getText();
		let ranges:Array<[start : number, end: number]> = [];

		let matches;
		while ((matches = this.commentRegex.exec(text)) !== null) {	// Extract comments with commentRegex

			// Get start index and end index of range.
			let start = matches.index;
			let end = matches.index + matches[0].length;

			// Push total indexes covered by comment.
			ranges.push([start, end]);
		}
	
		return ranges;
	}

	/**
	 * Create code range from document and match
	 * 
	 * @param document  Document to get range from.
	 * @param matches   Text match from macroRegex
	 * @returns Range of code
	 */
	private get_match_range(document: vscode.TextDocument, matches : any, regex : RegExp) : vscode.Range | undefined {

		const line = document.lineAt(document.positionAt(matches.index).line);
		const indexOf = line.text.indexOf(matches[0]);
		const position = new vscode.Position(line.lineNumber, indexOf);
		const range = document.getWordRangeAtPosition(position, new RegExp(regex));

		return range;
	}


	/**
	 * Extract filename and module name from matches.
	 * @param match Match of regex
	 * @returns Pair of filename and module name
	 */
	private get_macro_parameters(match : any) : [string, string] {

		let filename = "";			// Init filename as empty string
		let module_name = "";		// Init module name as empty string

		// Extract macro parameters with paramRegex.
		let param = this.parenthesisRegex.exec(match[0].toString());

		// If null, try with braces regex
		if(param == null) {
			param = this.braceRegex.exec(match[0].toString());
		}

		// Param could be null. Make sure it isn't.
		if(param != null){
			let param_split = param[1].toString().replace(/"/g, "").split(",");	// Remove "" and split with `,`
			filename = param_split[0].trim();	// Extract and trim filename

			if(param_split.length > 1) {	// If module name is defined
				module_name = param_split[1].trim();	// Extract and trim module name
			} 
		}

		return [filename, module_name];
	}
}