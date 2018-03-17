const vscode = require('vscode');
const CreateGuarded = require('./CreateGuarded');;

function activate(context) {
    let guarded = new CreateGuarded();

    context.subscriptions.push(vscode.commands.registerCommand('create.guarded', () => {
            guarded.create();
        })
    );
}

exports.activate = activate;
