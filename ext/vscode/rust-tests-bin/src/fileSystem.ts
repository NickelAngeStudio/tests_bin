/**
 * Contains function that access the file system.
 * 
 * @author NickelAngeStudio <https://github.com/NickelAngeStudio>
 * 
 * @since 2023
 * 
 * @license MIT
 */

import * as vscode from 'vscode';
import * as fs from 'fs';

// `tests_bin` folder.
export let TESTS_BIN_FOLDER = "";

// Contants
const DEFAULT_BIN_FOLDER = "tests/unit";        // Contains the default `tests_bin folder path`.
const CONFIG_FOLDER_KEY = "tests_bin-folder";   // Key used to fetch custom folder in config.toml

// Regexes to pull value from .cargo/config.toml
const CONFIG_INNER_REGEX = /value = "[^"]*"/;
const CONFIG_VALUE_REGEX = /\"(.*)\"/i;

// Regex for file name validation. Ref : https://digitalfortress.tech/tips/top-15-commonly-used-regex/
const FILE_NAME_VALIDATION_REGEX = /^[\w,\s-\/]+\.rs$/;

// Used when no default file to copied content from
const DEFAULT_NEW_FILE_CONTENT = "// This template can be changed via Settings > New File > Change Path.\n\n/// Unit test description\n///\n/// # Verification(s)\n/// V1 | Description of aspect verified\n#[test]\nfn unit_test(){\n\ttodo!()\n}\n\n/// Ignored test description\n///\n/// # Verification(s)\n/// V1 | Description of aspect verified\n#[test]\n#[ignore = \"Must be executed manually\"]\nfn ignored_test(){\n\ttodo!()\n}";

/**
 * Create a new unit tests file filled with default content
 * @param filename Current filename
 * @returns New filename or undefined
 */
export async function createTestsFile(filename : string) : Promise<string | undefined> {

    const result = await vscode.window.showInputBox(showInputBoxOptions('Create new unit tests file', filename));

    // If input wasn't canceled.
    if(result !== undefined){
        let fullPath = TESTS_BIN_FOLDER + result;
       
        try {
            // 1. Create full folder path before file
            createFolderPath(fullPath);

            // 2. Create new file with wx that fail is the path exists. Ref : https://www.geeksforgeeks.org/node-js-fs-opensync-method/
            const f = fs.openSync(fullPath, 'wx');

            // 3. Write default content in new file
            fs.writeFileSync(f, getDefaultNewFileContent());

            // 4. Close file created
            fs.closeSync(f);

            // 5. Open file created if option is enabled.
            if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('behavior.openAfterCreate'))
                {openFileInCscode(result);}

        } catch (error) {
            return Promise.reject(error);
        }
    }

    return result;
}

/**
 * Get default new unit tests file content.
 * @returns Default new unit tests file content.
 */
function getDefaultNewFileContent() : string {

    let contentPath = vscode.workspace.getConfiguration('rust-tests-bin').get<string>('newFile.contentPath');
    if(contentPath) {   // If content configuration exists
        if(fs.existsSync(contentPath)){ // If file exists
            return fs.readFileSync(contentPath, {encoding:'utf8', flag:'r'});
        } else {
            return DEFAULT_NEW_FILE_CONTENT;    // Return default file content
        }
    } else {
        return DEFAULT_NEW_FILE_CONTENT;    // Return default file content
    }

}

/**
 * Show select file dialog
 * @param showTitle Dialog title
 * @param defaultPathUri Default dialog path
 * @param fileFilters File filters
 * @param buttonLabel Label on the open button
 * @ref https://stackoverflow.com/questions/45500570/how-to-open-folder-picker-dialog-in-vscode
 * @returns Promise with new Uri in string with `file://` removed or undefined if canceled
 */
export async function showSelectFileDialog(showTitle : string, defaultPathUri : vscode.Uri, fileFilters : { [name: string]: string[];} | undefined, buttonLabel : string = "Select") : Promise<String | undefined>{

    // Open dialog options
    const options: vscode.OpenDialogOptions = {
        title: showTitle,
        defaultUri: defaultPathUri,
        canSelectMany: false,
        openLabel: buttonLabel,
        filters: fileFilters,
    };

    try {
        // 1. Open dialog
        const result = await vscode.window.showOpenDialog(options);

        if(result){
            // 2. Remove file:// from result
            let filePath = result?.toString().replace("file://", "");

            // 3. Return modified result
            return Promise.resolve(filePath);
        } else {
            // 2. Return undefined result
            return Promise.resolve(result);
        }
    } catch (error) {
        return Promise.reject(error);
    }

    
}

/**
 * Delete test file after confirmation
 * @param filename Filename to delete
 * @returns True if deleted, false otherwise
 */
export async function deleteTestsFile(filename : string) : Promise<boolean> {

    // Show confirmation for delete
    const answer = await vscode.window.showInformationMessage("Delete unit tests file `" + filename + "`?", "Yes", "No");

    if (answer === "Yes") {
        try {
            // 1. Get full path
            let fullPath = TESTS_BIN_FOLDER + filename;

            // 2. Delete file
            fs.rmSync(fullPath);

            // 3. Delete empty folders if enabled (except base folder)
            if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('behavior.deleteEmptyFolder'))
                {deleteEmptyFolders(filename);}

            // 4. Resolve result
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    } else {
        return Promise.resolve(false);
    }

}

/**
 * Open the tests bin base folder.
 */
export function openTestsBinFolder() {

    // 1. Create folder path if not exists
    createFolderPath(TESTS_BIN_FOLDER + "ignore.rs");

    // 2. Open folder with revealFileInOS command.
    vscode.commands.executeCommand("revealFileInOS",
        vscode.Uri.parse(TESTS_BIN_FOLDER));
}

/**
 * Rename a unit tests file.
 * @param currentFilename Current filename
 * @returns New filename or undefined
 */
export async function renameTestsFile(currentFilename : string) : Promise<string | undefined> {

    let result = await vscode.window.showInputBox(showInputBoxOptions('Rename unit tests file', currentFilename));

    // If input wasn't canceled.
    if(result !== undefined){

        if(result.trim() !== currentFilename.trim()){  // Only if new path is different from old path

            let fullPathOld = TESTS_BIN_FOLDER + currentFilename;
            let fullPathNew = TESTS_BIN_FOLDER + result;

            try {
                // 1. Create full folder path for new path
                createFolderPath(fullPathNew);

                // 2. Rename file
                fs.renameSync(fullPathOld, fullPathNew);

                // 3. Delete empty folders if enabled (except base folder)
                if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('behavior.deleteEmptyFolder'))
                    {deleteEmptyFolders(currentFilename);}

                // 4. Open new file if option enabled
                if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('behavior.openAfterRename'))
                    {openFileInCscode(result);}

            } catch (error) {
                return Promise.reject(error);
            }
        } else {
            result = undefined; // Set result as undefined since nothing changed.
        }
    }

    return result;
}

/**
 * Delete empty folders after renaming a file
 * @param filename Previous file name.
 */
export function deleteEmptyFolders(filename : string){

    // Split filename at / to get folders
    let folders = filename.split(/\//g);

    // Navigate from last folder (excluding filename) to first folder.
    for(let i = folders.length - 1; i > 0; i--){
        let folder = TESTS_BIN_FOLDER;  // Folder path accumulator

        for(let j = 0; j < i; j++){     // Create full folder path
            folder += folders[j] + "/";
        }

        try {
            // Try to delete folder. If not empty, will result in error.
            fs.rmdirSync(folder);
        } catch (error) {
            return; // If any error occured, stop trying to delete folders.
        }
    }
}

/**
 * Open a file relative to file bin.
 * @param filename  Filename relative to tests bin to open in visual studio 
 */
export function openFileInCscode(filename : string){

    // Get full path of the file
    let fullPath = TESTS_BIN_FOLDER + filename;

    // Open file in visual studio
    vscode.window.showTextDocument(vscode.Uri.file(fullPath));

}

/**
 * Get folder path without file.rs
 * @param filename File to get folder path.
 * @returns Folder path without file.rs
 */
function createFolderPath(filename : string) : string {

    let path = "";

    // Get full path without file.rs
    let fullSplit = filename.split('/');   // Split at folder separator
    for(let i = 0; i < fullSplit.length -1; i++){
        path += fullSplit[i] + '/';    // Accumulate all parts except last

        if(!fs.existsSync(path))    // If path doesn't exists, create it.
            {fs.mkdirSync(path);}
    }
        

    return path;

}

/**
 * Create options for showInputBox for file input.
 * @param title Input box title
 * @param defaultValue Default value of input box
 * @returns vscode.InputBoxOptions created
 */
function showInputBoxOptions(title : string, defaultValue : string) : vscode.InputBoxOptions | undefined {
    return {
        title: title,
        value: defaultValue,
        placeHolder: 'For example: `myfile.rs` or `myfolder/myfile.rs`',
        
        validateInput: text => {
            if(FILE_NAME_VALIDATION_REGEX.exec(text) === null){
                return "Invalid file name. Make sure to include `.rs` extension.";
            } else {
                return null;
            }
        }
    };
}

/**
 * Verify if given filename is in bin
 * @param filename File to verify existence
 * @returns True if file exists in bin, false otherwise
 */
export function isFileInBin(filename : string) : boolean {

    return filename.trim() !== "" && fs.existsSync(TESTS_BIN_FOLDER + filename);
}

/**
 * Verify if dependency `tests_bin` is added to cargo.toml
 * 
 * @returns True if dependency `tests_bin` is added to cargo.toml, false otherwise.
 */
export function isCrateAdded() : boolean {
	
	if(vscode.workspace.workspaceFolders !== undefined) {
		// Cargo.toml path.
		let filePath = vscode.workspace.workspaceFolders[0].uri.fsPath + '/Cargo.toml';

		// Verify if file exists before reading.
		if(fs.existsSync(filePath)){
			// Get data sync from file
			let data = fs.readFileSync(filePath);

			// Return that `tests_bin` was found.
			return (data.toString().search("tests_bin") > 0);
		} 
	}

	return false;

}

/**
 * Refresh / Initialize `tests_bin_folder` global variable.
 */
export function refreshTestsBinFolder() {
    TESTS_BIN_FOLDER = fetchTestsBinFolder() + "/";
}

/**
 * Fetch the tests_bin folder in .cargo/config.toml if exists.
 * 
 * Put the result in `tests_bin_folder` global
 */
function fetchTestsBinFolder() : string {

	if(vscode.workspace.workspaceFolders !== undefined) {
		
        let projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath + "/";   // Project path
		let filePath = projectPath + '.cargo/config.toml';    // config.toml path.

		// Verify if file exists before reading.
		if(fs.existsSync(filePath)){
			// Get data sync from file
			const data = fs.readFileSync(filePath, 'utf-8');

            // Read config.toml line by line
            let lines = data.split(/\r?\n/);
            for(let i = 0; i < lines.length; i++){
                // Match line start with key
                if(lines[i].trim().substring(0, CONFIG_FOLDER_KEY.length) === CONFIG_FOLDER_KEY){
                    // Get segment between curly braces.
                    let inner = CONFIG_INNER_REGEX.exec(lines[i]);
                    if(inner !== null){
                        // Get folder value
                        let value = CONFIG_VALUE_REGEX.exec(inner[0].toString());

                        if(value !== null){
                            return projectPath + value[0].toString().replace(/"/g, "");	// Return value fetched from config.toml
                        }
                    }
                }
            }
		}

        return projectPath + DEFAULT_BIN_FOLDER;	// Return default bin folder value
	}

    throw new Error("Cannot initialize `tests_bin` folder!");

}