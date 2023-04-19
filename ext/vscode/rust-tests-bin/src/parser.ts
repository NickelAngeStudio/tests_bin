/**
 * Contains document parsers used by codeLens provider.
 * 
 * @author NickelAngeStudio <https://github.com/NickelAngeStudio>
 * 
 * @since 2023
 * 
 * @license MIT
 */

import * as vscode from 'vscode';

// This regex extraxt comments from document. 
// Ref : https://stackoverflow.com/questions/5989315/regex-for-match-replacing-javascript-comments-both-multiline-and-inline
const commentRegex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;

// This extract each macro parameter.
const parameterRegex = /\"(.*?)\"/gm; 

/**
 * Get document comments ranges in an array of tuples.
 * @param document Document to get comments range from
 * @returns Array of comments range.
 */
export function get_document_comment_ranges(document: vscode.TextDocument) : Array<[start : number, end: number]> {

    let text = document.getText();
    let ranges:Array<[start : number, end: number]> = [];

    // Reset regex
    commentRegex.lastIndex = 0;

    let matches;
    while ((matches = commentRegex.exec(text)) !== null) {	// Extract comments with commentRegex

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
export function get_match_range(document: vscode.TextDocument, matches : any) : vscode.Range {

    return get_range_from_start_end(document, matches.index, matches.index + matches[0].length);

}


/**
 * Create code range from document with start and end position.
 * @param document Document to get range from
 * @param start Start position to get range
 * @param end End position to get range
 * @returns Range created
 */
function get_range_from_start_end(document: vscode.TextDocument, start : number, end : number) : vscode.Range {	

    const line_start = document.lineAt(document.positionAt(start).line);
    const pos_start = new vscode.Position(line_start.lineNumber, start);

    const line_end = document.lineAt(document.positionAt(end).line);
    // Get end character position of last line
    let char_end_index = line_end.text.indexOf("}");	// Look for macro with {} end
    if(char_end_index < 0)
        char_end_index = line_end.text.indexOf("]");	// Look for attribute end character
    if(char_end_index < 0)
        char_end_index = line_end.text.indexOf(";");
    if(char_end_index < 0)		// If no end character, use `end`
        char_end_index = end;

    const pos_end = new vscode.Position(line_end.lineNumber, char_end_index);

    return new vscode.Range(pos_start, pos_end);
}


/**
 * Extract filename with range or position if no filename.
 * 
 * @param match Match of regex
 * @returns Tuple of filename with it's range or position where to insert text.
 */
export function get_filename_range_position(document: vscode.TextDocument, match : any) : [string, vscode.Range | vscode.Position]  {
    // Reset regex
    parameterRegex.lastIndex = 0;

    // Extract filename parameter via parameterRegex.
    let param = parameterRegex.exec(match[0].toString());

    if(param !== null) { // If filename was found, return filename and it's ranfe
        return [param[0].toString().replace(/"/g, "").trim(), get_range_of_parameter(document, match, param)];
    } else { // If no filename found, return position to insert new filename
        return ["", get_position_of_parameter(document, match)];
    }
}

/**
 * Get the range of parameter including ""
 * @param document Document to get line from
 * @param match Macro match
 * @param param Parameter match
 * @returns Range of parameter including ""
 */
function get_range_of_parameter(document: vscode.TextDocument, match : any, param : any) : vscode.Range {
    // Get line of document of parameter
    const line = document.lineAt(document.positionAt(match.index + param.index).line);

    // Get both position of ""
    const indexOfFirst = line.text.indexOf("\"");
    const indexOfSecond = line.text.indexOf("\"", indexOfFirst +1);

    // Create start and end position from indexes
    const pos_start = new vscode.Position(line.lineNumber, indexOfFirst);
    const pos_end = new vscode.Position(line.lineNumber, indexOfSecond + 1);

    // Return new range
    return new vscode.Range(pos_start, pos_end);
}

/**
 * Get the position after the 1st enclosure to see where to insert new filename.
 * @param document Document to get lines from
 * @param match Macro match
 * @returns Position where to insert new filename
 */
function get_position_of_parameter(document: vscode.TextDocument, match : any) : vscode.Position {

    // Get global position of first `(`
    let index = match[0].toString().indexOf("(");
    if(index < 0) { // Try getting `{` then
        index = match[0].toString().indexOf("{");
    }

    // Get line of index
    const line = document.lineAt(document.positionAt(match.index + index).line);

    // Get position of closure opening
    let indexOf = line.text.indexOf("(");
    if(indexOf < 0) { // Try getting `{` then
        indexOf = line.text.indexOf("{");
    }

    // Return position to insert from
    return new vscode.Position(line.lineNumber, indexOf + 1);

}