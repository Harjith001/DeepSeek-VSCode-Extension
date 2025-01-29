// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import ollama from 'ollama';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "deepseek-extendor" is now active!');
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json


	const disposable = vscode.commands.registerCommand('deepseek-extendor.helloWorld', () => {

		const panel = vscode.window.createWebviewPanel(
			'deepSuck',
			'Deek seek Chat',
			vscode.ViewColumn.One,
			{enableScripts: true}
		);

		panel.webview.html = getWebviewContent();

		panel.webview.onDidReceiveMessage(async (message: any)=>{
			if (message.command === 'chat'){
				const userPrompt = message.text;
				let responsetext = '';

				try{
					const streamResponse = await ollama.chat({
						model: 'deepseek-r1:7b',
						messages: [{role: 'user', content: userPrompt}],
						stream: true
					}
					);
					

					for await (const part of streamResponse){
						responsetext += part.message.content;
						panel.webview.postMessage({command: 'chatResponse', text: responsetext});
					}

				}catch(error){
					panel.webview.postMessage({command: 'chatResponse', text: 'Error'});
				}
			}
		});
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
	return /*html*/`
	<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; margin: 1rem; }
        #prompt { width: 100%; box-sizing: border-box; }
        #response { border: 1px solid #ccc; margin-top: 1rem; padding: 0.5rem; min-height: 100px; }
    </style>
</head>
<body>
    <h2>Deep VS Code Extension</h2>
    <textarea id="prompt" rows="3" placeholder="Ask something..."></textarea>
    <button id="askBtn">Ask</button>
    <div id="response"></div>

    <script>
        const vscode = typeof acquireVsCodeApi !== "undefined" ? acquireVsCodeApi() : null;

        document.getElementById('askBtn').addEventListener('click', () => {
            const text = document.getElementById('prompt').value;
            if (vscode) {
                vscode.postMessage({ command: 'chat', text });
            } else {
                document.getElementById('response').innerText = "VS Code API not available.";
            }
        });

        window.addEventListener('message', (event) => {
            const { command, text } = event.data;
            if (command === 'chatResponse') {
                document.getElementById('response').innerText = text;
            }
        });
    </script>

</body>
</html>
	`;
}

export function deactivate() {}
