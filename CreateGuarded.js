const vscode = require("vscode");

module.exports = class CreateGuarded {
    async create() {
        if (this.activeEditor() === undefined) {
            return;
        }

        let activeDocument = this.activeDocument().uri;

        if (activeDocument === undefined) {
            return;
        }

        let range = await this.getReplaceRange(activeDocument);

        this.insertGuaded(range);
    }

    async getReplaceRange(activeDocument) {
        let range = {
            start: 0,
            end: 0
        };

        let classStartLine = 0;

        let doc = await vscode.workspace.openTextDocument(activeDocument);

        for (let line = 0; line < doc.lineCount; line++) {
            let textLine = doc.lineAt(line).text.trim();

            if (/class/.test(textLine)) {
                classStartLine = textLine.endsWith("{") ? line + 1 : line + 2;

                break;
            }
        }

        // Starting after 'class {'
        for (let line = classStartLine; line < doc.lineCount; line++) {
            let textLine = doc.lineAt(line).text.trim();

            if (/\/\//.test(textLine)) {
                range.start = classStartLine;
                range.end = classStartLine + 1;

                break;
            }

            if (!range.start && /fillable/.test(textLine)) {
                range.start = line;
            }

            if (!!range.start && /];/.test(textLine)) {
                range.end = line + 1;

                break;
            }
        }

        if (!range.start) {
            range.start = classStartLine;
            range.end = classStartLine;
        } 

        return range;
    }

    insertGuaded(range) {
        console.log(range);
        let snippet = "\tprotected \\$guarded = [];$1\n";

        this.activeEditor().insertSnippet(
            new vscode.SnippetString(snippet),
            this.range(range.start, range.end)
        );
    }

    range(startLine, endLine) {
        return new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, 0)
        );
    }

    activeEditor() {
        return vscode.window.activeTextEditor;
    }

    activeDocument() {
        return this.activeEditor().document;
    }

    config(key) {
        return vscode.workspace.getConfiguration("phpTestCreator").get(key);
    }
};
