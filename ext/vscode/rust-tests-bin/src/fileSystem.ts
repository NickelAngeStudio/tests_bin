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
export let tests_bin_folder = "";

// Contants
const DEFAULT_BIN_FOLDER = "tests/unit";        // Contains the default `tests_bin folder path`.
const CONFIG_FOLDER_KEY = "tests_bin-folder";   // Key used to fetch custom folder in config.toml

// Regexes to pull value from .cargo/config.toml
const CONFIG_INNER_REGEX = /value = "[^"]*"/;
const CONFIG_VALUE_REGEX = /\"(.*)\"/i;

// Regex for file name validation. Ref : https://digitalfortress.tech/tips/top-15-commonly-used-regex/
const FILE_NAME_VALIDATION_REGEX = /^[\w,\s-\/]+\.rs$/;

/**
 * Create a new unit tests file filled with default content
 * @param filename Current filename
 * @returns New filename or undefined
 */
export async function create_tests_file(filename : string) : Promise<string | undefined> {

    const result = await vscode.window.showInputBox(show_input_box_options('Create new unit tests file', filename));

    // If input wasn't canceled.
    if(result != undefined){
        let full_path = tests_bin_folder + result;
       
        try {
            // 1. Create full folder path before file
            create_folder_path(full_path);

            // 2. Create new file with wx that fail is the path exists. Ref : https://www.geeksforgeeks.org/node-js-fs-opensync-method/
            const f = fs.openSync(full_path, 'wx');

            // 3. Write default content
            let content = vscode.workspace.getConfiguration('rust-tests-bin').get<string>('createdFileContent');
            if(content != undefined)
                fs.writeFileSync(f, content);

            // 4. Close file created
            fs.closeSync(f);

            // 5. Open file created if option is enabled.
            if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('openAfterCreate'))
                open_file_in_vscode(result);

        } catch (error) {
            return Promise.reject(error);
        }
    }

    return result;
}

export async function delete_tests_file(filename : string) : Promise<boolean> {

    // Show confirmation for delete
    const answer = await vscode.window.showInformationMessage("Delete unit tests file `" + filename + "`?", "Yes", "No");

    if (answer === "Yes") {
        try {
            // 1. Get full path
            let full_path = tests_bin_folder + filename;

            // 2. Delete file
            fs.rmSync(full_path);

            // 3. Delete empty folders if enabled (except base folder)
            if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('deleteEmptyFolder'))
                delete_empty_folders(filename);

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
export function open_tests_bin_folder() {

    // 1. Create folder path if not exists
    create_folder_path(tests_bin_folder + "ignore.rs")

    // 2. Open folder with revealFileInOS command.
    vscode.commands.executeCommand("revealFileInOS",
        vscode.Uri.parse(tests_bin_folder));
}

/**
 * Rename a unit tests file.
 * @param current_filename Current filename
 * @returns New filename or undefined
 */
export async function rename_tests_file(current_filename : string) : Promise<string | undefined> {

    let result = await vscode.window.showInputBox(show_input_box_options('Rename unit tests file', current_filename));

    // If input wasn't canceled.
    if(result != undefined){

        if(result.trim() !== current_filename.trim()){  // Only if new path is different from old path

            let full_path_old = tests_bin_folder + current_filename;
            let full_path_new = tests_bin_folder + result;

            try {
                // 1. Create full folder path for new path
                create_folder_path(full_path_new);

                // 2. Rename file
                fs.renameSync(full_path_old, full_path_new);

                // 3. Delete empty folders if enabled (except base folder)
                if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('deleteEmptyFolder'))
                    delete_empty_folders(current_filename);

                // 4. Open new file if option enabled
                if(vscode.workspace.getConfiguration('rust-tests-bin').get<boolean>('openAfterRename'))
                    open_file_in_vscode(result);

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
export function delete_empty_folders(filename : string){

    // Split filename at / to get folders
    let folders = filename.split(/\//g);

    // Navigate from last folder (excluding filename) to first folder.
    for(let i = folders.length - 1; i > 0; i--){
        let folder = tests_bin_folder;  // Folder path accumulator

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
export function open_file_in_vscode(filename : string){

    // Get full path of the file
    let full_path = tests_bin_folder + filename;

    // Open file in visual studio
    vscode.window.showTextDocument(vscode.Uri.file(full_path));

}

/**
 * Get folder path without file.rs
 * @param filename File to get folder path.
 * @returns Folder path without file.rs
 */
function create_folder_path(filename : string) : string {

    let path = "";

    // Get full path without file.rs
    let full_split = filename.split('/');   // Split at folder separator
    for(let i = 0; i < full_split.length -1; i++){
        path += full_split[i] + '/';    // Accumulate all parts except last

        if(!fs.existsSync(path))    // If path doesn't exists, create it.
            fs.mkdirSync(path);
    }
        

    return path;

}

/**
 * Create options for showInputBox for file input.
 * @param title Input box title
 * @param default_value Default value of input box
 * @returns vscode.InputBoxOptions created
 */
function show_input_box_options(title : string, default_value : string) : vscode.InputBoxOptions | undefined {
    return {
        title: title,
        value: default_value,
        placeHolder: 'For example: `myfile.rs` or `myfolder/myfile.rs`',
        
        validateInput: text => {
            if(FILE_NAME_VALIDATION_REGEX.exec(text) == null){
                return "Invalid file name. Make sure to include `.rs` extension."
            } else {
                return null;
            }
        }
    }
}

/**
 * Verify if given filename is in bin
 * @param filename File to verify existence
 * @returns True if file exists in bin, false otherwise
 */
export function is_file_in_bin(filename : string) : boolean {

    return filename.trim() != "" && fs.existsSync(tests_bin_folder + filename);
}

/**
 * Verify if dependency `tests_bin` is added to cargo.toml
 * 
 * @returns True if dependency `tests_bin` is added to cargo.toml, false otherwise.
 */
export function is_crate_added() : boolean {
	
	if(vscode.workspace.workspaceFolders !== undefined) {
		// Cargo.toml path.
		let file_path = vscode.workspace.workspaceFolders[0].uri.path + '/Cargo.toml';

		// Verify if file exists before reading.
		if(fs.existsSync(file_path)){
			// Get data sync from file
			let data = fs.readFileSync(file_path);

			// Return that `tests_bin` was found.
			return (data.toString().search("tests_bin") > 0);
		} 
	}

	return false;

}

/**
 * Refresh / Initialize `tests_bin_folder` global variable.
 */
export function refresh_tests_bin_folder() {
    tests_bin_folder = fetch_tests_bin_folder() + "/";
}

/**
 * Fetch the tests_bin folder in .cargo/config.toml if exists.
 * 
 * Put the result in `tests_bin_folder` global
 */
function fetch_tests_bin_folder() : string {

	if(vscode.workspace.workspaceFolders !== undefined) {
		
        let project_path = vscode.workspace.workspaceFolders[0].uri.path + "/";   // Project path
		let file_path = project_path + '.cargo/config.toml';    // config.toml path.

		// Verify if file exists before reading.
		if(fs.existsSync(file_path)){
			// Get data sync from file
			const data = fs.readFileSync(file_path, 'utf-8');

            // Read config.toml line by line
            let lines = data.split(/\r?\n/);
            for(let i = 0; i < lines.length; i++){
                // Match line start with key
                if(lines[i].trim().substring(0, CONFIG_FOLDER_KEY.length) == CONFIG_FOLDER_KEY){
                    // Get segment between curly braces.
                    let inner = CONFIG_INNER_REGEX.exec(lines[i]);
                    if(inner != null){
                        // Get folder value
                        let value = CONFIG_VALUE_REGEX.exec(inner[0].toString());

                        if(value != null){
                            return project_path + value[0].toString().replace(/"/g, "");	// Return value fetched from config.toml
                        }
                    }
                }
            }
		}

        return project_path + DEFAULT_BIN_FOLDER;	// Return default bin folder value
	}

    throw new Error("Cannot initialize `tests_bin` folder!");

}