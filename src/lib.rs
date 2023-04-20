#![doc(html_logo_url = "https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin.png")]
#![doc(html_favicon_url = "https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin.png")]
//! This [crate](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html) is aimed toward [Rustacean](https://rustaceans.org/) who wish to have a bin folder where they can easily
//! organize all their unit tests to clean their `src` folder. 
//! 
//! *Include a VSCode extension for quick shortcuts like create tests file, rename file and more. [See here!](https://github.com/NickelAngeStudio/tests_bin/wiki/Extension)*
//! 
//! <img src="https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin_ext.png" width="865" height="235"><br>
//! 
//! [Get more details on the wiki here!](https://github.com/NickelAngeStudio/tests_bin/wiki)

use proc_macro::TokenStream;
use crate::config::extract_unit_tests_parameters;

/// Configuration mod
mod config;

/// Error enumeration mod
mod errors;

/// Link a unit tests module without an [item](https://doc.rust-lang.org/reference/items.html).
/// 
/// ### Syntax
/// `unit__tests!("relative_path.rs" {, "module name"});`<br>
/// *The element in `{}` are optional. The extension `.rs` is required.*
/// 
/// ### Path
///  By default, the macro will look in `{project_folder}/tests/unit/` for unit tests file.
/// [This can be changed here](https://github.com/NickelAngeStudio/tests_bin/wiki/Customization)
/// 
/// ### Example(s)
/// 
/// ```
/// use tests_bin::unit__tests;
/// 
/// // Will link a module to `tests/unit/global_tests.rs`
/// // with a module named `global_test_rs`.
/// unit__tests!("global_tests.rs");
/// 
/// // Will link a module to `tests/unit/target/target_tests.rs`
/// // with a module named `my_target_tests`.
/// unit__tests!("target/target_tests.rs", "my_target_tests");
/// ```
#[allow(non_snake_case)]
#[proc_macro]
pub fn unit__tests(attr: TokenStream) -> TokenStream {

     // Content tokens accumulator
     let mut content = TokenStream::new();

     // 1. Extract parameters from attributes and parsed attributes
     let parameters = extract_unit_tests_parameters(attr.clone(), attr.to_string().replace("\"", "").parse::<TokenStream>().unwrap());
 
     // 2. Add unit test module definition
     content.extend(format!("#[cfg(test)]#[path = \"{}\"]mod {};", parameters.full_path, parameters.module_name).parse::<TokenStream>().unwrap());
 
     // 3. Return content tokenstream
     content

}

/// Link a unit tests module with an [item](https://doc.rust-lang.org/reference/items.html).
/// 
/// ### Syntax
/// `#[unit_tests("relative_path.rs" {, "module name"})] item`<br>
/// *The element in `{}` are optional. The extension `.rs` is required.*
/// 
/// ### Path
///  By default, the macro will look in `{project_folder}/tests/unit/` for unit tests file.
/// [This can be changed here](https://github.com/NickelAngeStudio/tests_bin/wiki/Customization)
/// 
/// ### Example(s)
/// 
/// ```
/// use tests_bin::unit_tests;
/// 
/// // Will link a module to `tests/unit/add.rs`
/// // with a module named `pub_fn_add_usize`.
/// #[unit_tests("add.rs")]
/// pub fn add(left: usize, right: usize) -> usize {
///     left + right
/// }
/// 
/// // Will link a module to `tests/unit/operation/multiply.rs`
/// // with a module named `my_multiply_operation`.
/// #[unit_tests("operation/multiply.rs", "my_multiply_operation")]
/// pub fn multiply(left: usize, right: usize) -> usize {
///     left * right
/// }
/// ```
#[proc_macro_attribute]
pub fn unit_tests(attr: TokenStream, item: TokenStream) -> TokenStream {

    // Content tokens accumulator
    let mut content = TokenStream::new();

    // 1. Extract parameters from attributes and items
    let parameters = extract_unit_tests_parameters(attr.clone(), item.clone());

    // 2. Add unit test module definition
    content.extend(format!("#[cfg(test)]#[path = \"{}\"]mod {};", parameters.full_path, parameters.module_name).parse::<TokenStream>().unwrap());
    
    // 3. Add items to content
    content.extend(item);

    // 4. Return content tokenstream
    content

}