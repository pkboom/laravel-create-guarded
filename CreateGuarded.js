const vscode = require('vscode');

module.exports = class CreateGuarded {
    async create() {
        
        if (this.activeEditor() === undefined) {
            return;
        } 
        
        let activeDocument = this.activeDocument().uri;
        
        if (activeDocument === undefined) {
            return;
        }
        
        let fillable = await this.getFillable(activeDocument);

        this.insertGuaded(fillable);
    } 
    
    async getFillable(activeDocument) {
        let fillable = {
            start: 0,
            end: 0,
        };

        let classStartLine = 0;

        let doc = await vscode.workspace.openTextDocument(activeDocument);

        for (let line = 0; line < doc.lineCount; line++) {
            let textLine = doc.lineAt(line).text.trim();

            if (!fillable.start && /fillable/.test(textLine)) {
                fillable.start = line;
            }
            
            if (!!fillable.start && /];/.test(textLine)) {
                fillable.end = line + 1;
                
                break;
            }
            
            if (/class/.test(textLine)) {
                classStartLine = textLine.endsWith('{') ? line + 1 : line + 2;
            }
            
            if (/use/.test(textLine)) {
                classStartLine = line + 2;
            }

            if (/}/.test(textLine)) {
                fillable.start = classStartLine;
                fillable.end = classStartLine;

                break;
            }
        }

        return fillable;
    }
    
    insertGuaded(fillable) {
        console.log(fillable);
        let snippet = '\tprotected \\$guarded = [];\$1\n';

        this.activeEditor().insertSnippet(
            new vscode.SnippetString(snippet),
            this.range(fillable.start, fillable.end)
        );

    }

    range(startLine, endLine) {
        return new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(endLine, 0))
    }

    activeEditor() {
        return vscode.window.activeTextEditor;
    }

    activeDocument() {
        return this.activeEditor().document;
    }

    config(key) {
        return vscode.workspace.getConfiguration('phpTestCreator').get(key);
    }
}