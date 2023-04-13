//! This [Crate](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html) is aimed toward [Rustacean](https://rustaceans.org/) who wish to have a bin folder where they can easily
//! unload all their unit tests with a relative path.
//! 
//! **The legacy way to do it right now is like this :**
//! ```
//! // We supposed we put our unit tests in `tests/unit` and we wish 
//! // to link from a file in src/folder1/myfile.rs
//! #[cfg(test)]
//! #[path = "../../tests/unit/mytest.rs"] // Path is relative to myfile.rs
//! mod mytests;
//! 
//! pub fn to_test() {
//! }
//! ```
//! 
//! *Each subfolder add an extra `../` and refactoring might break the path.*
//! 
//! **This crate offer those 2 options instead :**
//! ```
//! // We use an attribute for this function unit tests.
//! // Module name is automatically generated.
//! // Rust-analyzer will show `> Run Tests | Debug` above this.
//! #[unit_tests("mytest.rs")]
//! pub fn to_test() {
//! }
//! ```
//! ```
//! // We can also use a global macro instead but
//! // we must define the module name as 2nd parameter.
//! unit_tests_bin!("mytest.rs", "mytests");
//! 
//! pub fn to_test() {
//! }
//! ```
//! 
//! **By default, the tests bin folder is `{project folder}/tests/unit`**
//! This can be changed. [See here](https://github.com/NickelAngeStudio/tests_bin/wiki#modifying-bin-default-folder)

use proc_macro::TokenStream;
use crate::config::extract_unit_tests_parameters;

/// Configuration mod
mod config;

/// Error enumeration mod
mod errors;

#[proc_macro]
pub fn unit_tests_bin(attr: TokenStream) -> TokenStream {

     // Content tokens accumulator
     let mut content = TokenStream::new();

     // 1. Extract parameters from attributes and empty tokenstream
     let parameters = extract_unit_tests_parameters(attr.clone(), TokenStream::new());
 
     // 2. Add unit test module definition
     content.extend(format!("#[cfg(test)]#[path = \"{}\"]mod {};", parameters.full_path, parameters.module_name).parse::<TokenStream>().unwrap());
 
     // 3. Return content tokenstream
     content

}

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