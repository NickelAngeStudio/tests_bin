# rust-tests-bin

This extension provides shortcut to the Rust [tests_bin](https://crates.io/crates/tests_bin) crate which is aimed toward Rustacean who wish to have a bin folder where they can easily organize all their unit tests to clean their src folder. [Visit Wiki for more informations.](https://github.com/NickelAngeStudio/tests_bin/wiki)

<img src="https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin_ext.png"/>

## Features
- Shortcut to create new unit tests file in bin folder.
- Open your unit tests files directly from your code.
- Shortcuts to rename and delete unit tests file.
- Customizable new unit tests file template.
- Lots of settings to fit your taste.

[More features details in wiki.](https://github.com/NickelAngeStudio/tests_bin/wiki/Features)

## Requirements

- Rust crate [tests_bin](https://crates.io/crates/tests_bin) from [crates.io](https://crates.io).

## Extension Settings
This extension contributes the following settings:

- `rust-tests-bin.behavior.openAfterCreate` : Enable/Disable file opening after creation.
- `rust-tests-bin.behavior.openAfterRename` : Enable/Disable file opening after renaming.
- `rust-tests-bin.behavior.deleteEmptyFolder` : Enable/Disable deletion of empty folder after rename/delete.
- `rust-tests-bin.display.showRenameFile` : Show/Hide `Rename file` shortcut.
- `rust-tests-bin.display.showDeleteFile` : Show/Hide `Delete file` shortcut.
- `rust-tests-bin.display.shortcutDisplay` : Select how shortcut icon and text are displayed.
- `rust-tests-bin.display.showInStatusBar` : Show/Hide `tests_bin` in status bar (reload required).
- `rust-tests-bin.display.showCodeLens` : Show/Hide all shortcuts above `tests_bin` macros.
- `rust-tests-bin.newFile.contentPath` : Path to the file whose content are copied in new unit tests file.

## Release Notes

### 1.0.0
Initial release of `rust-tests-bin`.

## License

[MIT](https://choosealicense.com/licenses/mit/)