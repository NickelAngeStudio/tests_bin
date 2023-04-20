#![doc(html_logo_url = "https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin.png")]
#![doc(html_favicon_url = "https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin.png")]
//! This [crate](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html) is aimed toward [Rustacean](https://rustaceans.org/) who wish to have a bin folder where they can easily
//! unload all their unit tests to clean their `src` folder. 
//! 
//! *Includes a VSCode extension to add quick shortcuts like create file, rename file and more. [See here!](TODO_LINK)*
//! 
//! <img src="https://raw.githubusercontent.com/NickelAngeStudio/tests_bin/main/tests_bin_ext.png" width="600" height="160"><br>
//! 
//! [Get more details on the wiki here!](https://github.com/NickelAngeStudio/tests_bin/wiki)

use proc_macro::TokenStream;
use crate::config::extract_unit_tests_parameters;

/// Configuration mod
mod config;

/// Error enumeration mod
mod errors;

/// Link a unit tests module without an [item](https://doc.rust-lang.org/reference/items.html).
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