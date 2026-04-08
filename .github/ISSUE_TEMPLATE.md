Please fill-in this template.

- [ ] I have a question that is specific to this extension; thus, inappropriate for the main [EditorConfig issue tracker](https://github.com/editorconfig/editorconfig/issues).
- [ ] I tried running `code --disable-extensions` and the issue did **NOT** present itself.

Delete the following condition if it doesn't apply to your case:

If the extension is not picking up the expected configuration for a file:

- [ ] I tried `npm install editorconfig -g` and ran `editorconfig [file-in-question]` and the configuration was what I expected. If not, please file on the [`editorconfig-core-js` issue tracker](https://github.com/editorconfig/editorconfig-core-js/issues).

## Issue

|             | Visual Studio Code | editorconfig-vscode |
| ----------- | ------------------ | ------------------- |
| **Version** | `x.x.x`            | `x.x.x`             |

### Root `.editorconfig` File

```ini
root = true

[*]
indent_style = space
indent_size = 2
```

Are there any other relevant `.editorconfig` files in your project? Yes / No

| Visual Studio Code Setting     | Default | User    | Workspace |
| ------------------------------ | ------- | ------- | --------- |
| `editor.insertSpaces`          | `true`  | `____`  | `____`    |
| `editor.tabSize`               | `4`     | `_`     | `_`       |
| `editor.trimAutoWhitespace`    | `true`  | `____`  | `____`    |
| `files.autoSave`               | `"off"` | `"___"` | `"___"`   |
| `files.insertFinalNewline`     | `false` | `_____` | `_____`   |
| `files.trimTrailingWhitespace` | `false` | `_____` | `_____`   |

### File opened

`./foo.js`

### Expected behavior

```ini
indent_size = 2
```

### Actual behavior

```ini
indent_size = 4
```

### Additional comments or steps to reproduce
