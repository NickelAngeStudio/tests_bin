<img src="https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin.png" style="float:left;padding-right:10px"  width="150" height="150">

## tests_bin

This crate is aimed toward Rustacean who wish to have a bin folder where they can easily unload all their unit tests to clean their src folder. VSCode extension included! [Visit Wiki for more informations.](/wiki)
<br>
## Installation
```bash
cargo add tests_bin
```

## VSCode extension installation

Ctrl-Shift-P and enter
```
TODO CMD HERE
```

## Usage

```rust
use tests_bin::{ unit__tests, unit_tests ];

// Will link a module to `tests/unit/global_tests.rs` with a module named `global_test_rs`.
unit__tests!("global_tests.rs");
 
// Will link a module to `tests/unit/add.rs` with a module named `pub_fn_add_usize`.
#[unit_tests("add.rs")]
pub fn add(left: usize, right: usize) -> usize {
    left + right
}
```

## Syntax
**Without [item](https://doc.rust-lang.org/reference/items.html) :** `unit__tests!("relative_path.rs" {, "module name"});`<br>
**With an [item](https://doc.rust-lang.org/reference/items.html) :** `#[unit_tests("relative_path.rs" {, "module name"})] item`<br>
<sub>*The element in `{}` are optional. The extension `.rs` is required.*</sub>

## License

[MIT](https://choosealicense.com/licenses/mit/)