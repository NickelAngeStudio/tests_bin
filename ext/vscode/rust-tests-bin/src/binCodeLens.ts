import * as vscode from 'vscode';

/**
 * Code lens that provide quick shortcut when it detect tests_bin crate macros.
 * 
 * Ref : https://github.com/microsoft/vscode-extension-samples/
 */
export class TestsBinCodeLensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private regex: RegExp;
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		// This regex detect #[unit_tests()] attribute and unit_tests_bin! proc macro.
        this.regex = /#\[unit_tests\([^)]*\)\]|unit_tests_bin!\([^)]*\)/g;

		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

		//if (vscode.workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) {
			this.codeLenses = [];
			const regex = new RegExp(this.regex);
			const text = document.getText();
			let matches;
			while ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				const indexOf = line.text.indexOf(matches[0]);
				const position = new vscode.Position(line.lineNumber, indexOf);
				const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
      
				if (range) {
					this.codeLenses.push(new vscode.CodeLens(range, {
                        title: "Open file",
                        tooltip: "Open unit tests file from bin.",
                        command: "rust-tests-bin.openFile",
                        arguments: ["Argument 1", false]
                    }));
                    this.codeLenses.push(new vscode.CodeLens(range, {
                        title: "Open file",
                        tooltip: "Open unit tests file from bin.",
                        command: "rust-tests-bin.openFile",
                        arguments: ["Argument 1", false]
                    }));
				}
			}
			return this.codeLenses;
		//}
		//return [];
	}

    /*
	public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
		//if (vscode.workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) {
            //console.log(codeLens.);

			codeLens.command = {
				title: "Open file",
				tooltip: "Open unit tests file from bin.",
				command: "rust-tests-bin.openFile",
				arguments: ["Argument 1", false]
			};

			return codeLens;
		//}
		//return null;
	}
    */
}