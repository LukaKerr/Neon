const {remote, clipboard} = require('electron');
const {Menu, MenuItem, dialog } = remote;
const fs = require("fs");

var openButton, saveButton;
var editor, menu;
var fileEntry, hasWriteAccess;

function handleDocumentChange(title) {
	var mode = "";
	var modeName = "";
	if (title) {
		title = title.match(/[^/]+$/)[0];
		document.getElementById("title").innerHTML = title;
		document.title = title;
		if (title.match(/.json$/)) {
			mode = {name: "javascript", json: true};
			modeName = "JSON";
		} else if (title.match(/.html$/)) {
			mode = "htmlmixed";
			modeName = "HTML";
		} else if (title.match(/.css$/)) {
			mode = "css";
			modeName = "CSS";
		} else if (title.match(/.rb$/)) {
			mode = "ruby";
			modeName = "Ruby";
		} else if (title.match(/.py$/)) {
			mode = "python";
			modeName = "Python";
		} else if (title.match(/.php$/)) {
			mode = "php";
			modeName = "PHP";
		} else if (title.match(/.js$/)) {
			mode = "javascript";
			modeName = "JavaScript";
		} else if (title.match(/.coffee$/)) {
			mode = "coffeescript";
			modeName = "CoffeeScript";
		} else if (title.match(/.sh$/)) {
			mode = "shell";
			modeName = "Shell Script";
		} else if (title.match(/.yaml$/)) {
			mode = "yaml";
			modeName = "Yaml";
		} else if (title.match(/.hs$/)) {
			mode = "haskell";
			modeName = "Haskell";
		} else if (title.match(/.rs$/)) {
			mode = "rust";
			modeName = "Rust";
		} else if (title.match(/.sass$/)) {
			mode = "sass";
			modeName = "Sass";
		} else if (title.match(/.go$/)) {
			mode = "go";
			modeName = "Go";
		} else if (title.match(/.clj$/)) {
			mode = "clojure";
			modeName = "Clojure";
		}
	} else {
		document.getElementById("title").innerHTML = "[no file selected]";
	}
	editor.setOption("mode", mode);
	document.getElementById("mode").innerHTML = modeName;
}

function newFile() {
	fileEntry = null;
	hasWriteAccess = false;
	handleDocumentChange(null);
}

function setFile(theFileEntry, isWritable) {
	fileEntry = theFileEntry;
	hasWriteAccess = isWritable;
}

function readFileIntoEditor(theFileEntry) {
	fs.readFile(theFileEntry.toString(), function (err, data) {
		handleDocumentChange(theFileEntry);
		editor.setValue(String(data));
	});
}

function writeEditorToFile(theFileEntry) {
	var str = editor.getValue();
	fs.writeFile(theFileEntry, editor.getValue(), function (err) {
		if (err) {
			return;
		}

		handleDocumentChange(theFileEntry);
	});
}

var onChosenFileToOpen = function(theFileEntry) {
	setFile(theFileEntry, true);
	readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function(theFileEntry) {
	setFile(theFileEntry, true);
	writeEditorToFile(theFileEntry);
};

function handleOpenButton() {
	dialog.showOpenDialog({properties: ['openFile']}, function(filename) { 
		onChosenFileToOpen(filename.toString()); 
	});
	document.getElementById('open-dialog').innerHTML = "";
}

function handleSaveButton() {
	if (fileEntry && hasWriteAccess) {
		writeEditorToFile(fileEntry);
	} else if (!fileEntry) {
		dialog.showSaveDialog(function(filename) {
			if (filename) {
				onChosenFileToSave(filename.toString(), true);
			}
		});
	}
}

function initContextMenu() {
	menu = new Menu();
	menu.append(new MenuItem({
		label: 'Copy',
		click: function() {
			clipboard.writeText(editor.getSelection(), 'copy');
		}
	}));
	menu.append(new MenuItem({
		label: 'Cut',
		click: function() {
			clipboard.writeText(editor.getSelection(), 'copy');
			editor.replaceSelection('');
		}
	}));
	menu.append(new MenuItem({
		label: 'Paste',
		click: function() {
			editor.replaceSelection(clipboard.readText('copy'));
		}
	}));

	window.addEventListener('contextmenu', function(ev) { 
		ev.preventDefault();
		menu.popup(remote.getCurrentWindow(), ev.x, ev.y);
	}, false);
}


onload = function() {
	initContextMenu();

	openButton = document.getElementById("open");
	saveButton = document.getElementById("save");

	openButton.addEventListener("click", handleOpenButton);
	saveButton.addEventListener("click", handleSaveButton);

	editor = CodeMirror(
		document.getElementById("editor"),
		{
			mode: {
				name: "javascript", json: true 
			},
			lineNumbers: true,
			theme: "material",
			extraKeys: {
				"Cmd-S": function(instance) { handleSaveButton() },
			}
		});

	newFile();
};
