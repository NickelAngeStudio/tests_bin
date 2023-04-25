[![ubuntu-latest](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/ubuntu-latest.yml/badge.svg)](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/ubuntu-latest.yml)
[![windows-latest](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/windows-latest.yml/badge.svg?branch=main)](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/windows-latest.yml)
[![macos-latest](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/macos-latest.yml/badge.svg?branch=main)](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/macos-latest.yml)
[![ubuntu-performance](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/ubuntu-performance.yml/badge.svg)](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/ubuntu-performance.yml)
[![windows-performance](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/windows-performance.yml/badge.svg)](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/windows-performance.yml)
[![macos-performance](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/macos-performance.yml/badge.svg)](https://github.com/NickelAngeStudio/tests_bin/actions/workflows/macos-performance.yml)

<img src="https://github.com/NickelAngeStudio/tests_bin/blob/main/tests_bin.png?raw=true" width="64" height="64" align="left"/>

# tests_bin

This crate is aimed toward Rustacean who wish to have a bin folder where they can easily organize all their unit tests to clean their src folder. VSCode extension included! [Visit Wiki for more informations.](https://github.com/NickelAngeStudio/tests_bin/wiki)

<img src="https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin_ext.png"/>

## Features
### *Crate*
- Organize your unit tests with one relative path.
- Automatically create your unit tests module name.
- Add attribute macro directly above your item for easier unit tests tracking.
- Work with rust-analyzer to run your tests.
- Unit tests folder path is customizable.


### *VSCode Extension*
- Shortcut to create new unit tests file in bin folder.
- Open your unit tests files directly from your code.
- Shortcuts to rename and delete unit tests file.
- Customizable new unit tests file template.
- Lots of settings to fit your taste.

[More features details in wiki.](https://github.com/NickelAngeStudio/tests_bin/wiki/Features)

## Installation
```bash
cargo add tests_bin
```

## VSCode extension installation

Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.
```
ext install TODO
```

## Usage

```rust
use tests_bin::{ unit__tests, unit_tests };

// Will link a module to `tests/unit/global_tests.rs` with a module named `global_test_rs`.
unit__tests!("global_tests.rs");
 
// Will link a module to `tests/unit/add.rs` with a module named `pub_fn_add_usize`.
#[unit_tests("add.rs")]
pub fn add(left: usize, right: usize) -> usize {
    left + right
}
```

## Syntax
Without [item](https://doc.rust-lang.org/reference/items.html) : `unit__tests!("relative_path.rs" {, "module name"});`<br>
With an [item](https://doc.rust-lang.org/reference/items.html) : `#[unit_tests("relative_path.rs" {, "module name"})] item`<br>
<sub>*The element in `{}` are optional. The extension `.rs` is required.*</sub>

## License

[MIT](https://choosealicense.com/licenses/mit/)
