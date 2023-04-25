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
export function getDocumentCommentRanges(document: vscode.TextDocument) : Array<[number, number]> {

    let text = document.getText();
    let ranges:Array<[number, number]> = [];

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
export function getMatchRange(document: vscode.TextDocument, matches : any) : vscode.Range {

    return getRangeFromStartEnd(document, matches.index, matches.index + matches[0].length);

}


/**
 * Create code range from document with start and end position.
 * @param document Document to get range from
 * @param start Start position to get range
 * @param end End position to get range
 * @returns Range created
 */
function getRangeFromStartEnd(document: vscode.TextDocument, start : number, end : number) : vscode.Range {	

    const lineStart = document.lineAt(document.positionAt(start).line);
    const posStart = new vscode.Position(lineStart.lineNumber, start);

    const lineEnd = document.lineAt(document.positionAt(end).line);
    // Get end character position of last line
    let charEndIndex = lineEnd.text.indexOf("}");	// Look for macro with {} end
    if(charEndIndex < 0)
        {charEndIndex = lineEnd.text.indexOf("]");}	// Look for attribute end character
    if(charEndIndex < 0)
        {charEndIndex = lineEnd.text.indexOf(";");}
    if(charEndIndex < 0)		// If no end character, use `end`
        {charEndIndex = end;}

    const posEnd = new vscode.Position(lineEnd.lineNumber, charEndIndex);

    return new vscode.Range(posStart, posEnd);
}


/**
 * Extract filename with range or position if no filename.
 * 
 * @param match Match of regex
 * @returns Tuple of filename with it's range or position where to insert text.
 */
export function getFilenameRangePosition(document: vscode.TextDocument, match : any) : [string, vscode.Range | vscode.Position]  {
    // Reset regex
    parameterRegex.lastIndex = 0;

    // Extract filename parameter via parameterRegex.
    let param = parameterRegex.exec(match[0].toString());

    if(param !== null) { // If filename was found, return filename and it's ranfe
        return [param[0].toString().replace(/"/g, "").trim(), getRangeOfParameter(document, match, param)];
    } else { // If no filename found, return position to insert new filename
        return ["", getPositionOfParameter(document, match)];
    }
}

/**
 * Get the range of parameter including ""
 * @param document Document to get line from
 * @param match Macro match
 * @param param Parameter match
 * @returns Range of parameter including ""
 */
function getRangeOfParameter(document: vscode.TextDocument, match : any, param : any) : vscode.Range {
    // Get line of document of parameter
    const line = document.lineAt(document.positionAt(match.index + param.index).line);

    // Get both position of ""
    const indexOfFirst = line.text.indexOf("\"");
    const indexOfSecond = line.text.indexOf("\"", indexOfFirst +1);

    // Create start and end position from indexes
    const posStart = new vscode.Position(line.lineNumber, indexOfFirst);
    const posEnd = new vscode.Position(line.lineNumber, indexOfSecond + 1);

    // Return new range
    return new vscode.Range(posStart, posEnd);
}

/**
 * Get the position after the 1st enclosure to see where to insert new filename.
 * @param document Document to get lines from
 * @param match Macro match
 * @returns Position where to insert new filename
 */
function getPositionOfParameter(document: vscode.TextDocument, match : any) : vscode.Position {

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