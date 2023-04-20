use proc_macro::TokenStream;

use crate::errors::TestsBinErrors;

// Contants
const TESTS_BIN_BASE_FOLDER : &str = "tests/unit";                  // Default tests bin base folder
const TESTS_BIN_BASE_FOLDER_KEY : &str = "tests_bin-folder";        // Key used to fetch custom base folder
const CARGO_MANIFEST_DIR : &str = "CARGO_MANIFEST_DIR";             // Cargo manifest directory key
const ILLEGAL_CHARACTER_REPLACE : char = '_';                       // Illegal character will be replaceby this
const PARAMETERS_SEPARATOR : char = ',';                            // Parameters separator.

/// Parameters of unit test macros.
pub(crate) struct UnitTestParameters {
    pub full_path : String,
    pub module_name : String,
}

/// Extract unit tests parameters path and module name from attributes.
/// 
/// If no module name specified, it will be generated from item.
/// 
/// Panic(s)
/// Will panic! if parameters are incorrect.
#[inline(always)]
pub(crate) fn extract_unit_tests_parameters(attr: TokenStream, item: TokenStream) -> UnitTestParameters {

    let mut full_path : Option<String> = None;
    let mut module_name : Option<String> = None;
    let mut separator : bool = false;

    // Extract parameters
    attr.into_iter().for_each(|token| {
        // Syntax error because of extra tokens
        if full_path != Option::None && module_name != Option::None {
            panic!("{}", TestsBinErrors::IncorrectParameters.to_string());
        }

        match token {
            
            proc_macro::TokenTree::Punct(punct) => {
                    match punct.as_char() {
                        PARAMETERS_SEPARATOR => separator = true,  // Only PARAMETERS_SEPARATOR allowed
                        _ => panic!("{}", TestsBinErrors::IncorrectParameters.to_string()), // Anything else is a syntax error.
                    }
                },
            proc_macro::TokenTree::Literal(lit) => {
                let parameter = lit.to_string().replace("\"", "");  // Extract parameter and remove ""

                if full_path == Option::None {  // If full_path has no value, it is the full path.
                    match std::env::var(CARGO_MANIFEST_DIR){
                        Ok(value) => full_path = Some(format!("{}/{}/{}", value, get_tests_bin_base_folder(), parameter)),
                        Err(_) => panic!("Env variable `{}` not set!", CARGO_MANIFEST_DIR),
                    }
                } else {    // Else it is the module name parameter.
                    if separator {
                        module_name = Some(parameter);
                    } else {
                        panic!("{}", TestsBinErrors::IncorrectParameters.to_string()); // Misssing `,`separator.
                    }
                }
            },

            // Anything else is a syntax error.
            _ => panic!("{}", TestsBinErrors::IncorrectParameters.to_string()),
        }
    });

    // Generate module name if none for unit_tests attribute macros
    if module_name == Option::None {
        module_name = Some(generate_test_mod_name(item));
    }

    // Return parameters
    UnitTestParameters{ full_path: full_path.unwrap(), module_name: module_name.unwrap() }

}

/// Get the tests_bin base folder as string
#[inline(always)]
pub(crate) fn get_tests_bin_base_folder() -> String {

    match std::env::var(TESTS_BIN_BASE_FOLDER_KEY) {
        Ok(base_folder) => base_folder,         // Return base folder for config.toml
        Err(_) => String::from(TESTS_BIN_BASE_FOLDER)   // Key not found, return base folder.
    }
}

/// Generate tests module name from attributes and item tokens
/// 
/// Will replace illegal characters of filename with _
/// 
/// Cannot be unit tested because of TokenStream.
#[inline(always)]
pub(crate) fn generate_test_mod_name(item: TokenStream) -> String {

    // Module name string that accumulate characters
    let mut module_name = String::new();

    // Add tokenstream idents to name
    for token in item {
        match token {
            proc_macro::TokenTree::Ident(ident) => module_name.push_str(format!("{}{}", ident.to_string().as_str(), ILLEGAL_CHARACTER_REPLACE).as_str()),
            _ => {},    // Ignore anything else
        }
    }

    // Remove last _ character
    module_name.pop();
        
    // Return module name generated.
    module_name

}

/// Can't use own crates to organize those. =(
#[cfg(test)]
mod tests {
    use crate::config::{TESTS_BIN_BASE_FOLDER, get_tests_bin_base_folder, TESTS_BIN_BASE_FOLDER_KEY};

    const TESTS_BIN_CUSTOM_FOLDER : &str = "tests/custom";  // Used for custom test

    /// Test default folder value
    #[test]
    fn get_tests_bin_base_folder_default() {
        
        let base_folder = get_tests_bin_base_folder();
        assert_eq!(base_folder.as_str(), TESTS_BIN_BASE_FOLDER, "Expected base folder `{}`, got `{}`!", TESTS_BIN_BASE_FOLDER, base_folder);

    }

    /// Test custom folder value
    #[test]
    #[ignore = "Will fail default test when running in multiple thread."]
    fn get_tests_bin_base_folder_custom() {

        // Set custom folder in env
        std::env::set_var(TESTS_BIN_BASE_FOLDER_KEY, TESTS_BIN_CUSTOM_FOLDER);
        
        let base_folder = get_tests_bin_base_folder();
        assert_eq!(base_folder.as_str(), TESTS_BIN_CUSTOM_FOLDER, "Expected base folder `{}`, got `{}`!", TESTS_BIN_CUSTOM_FOLDER, base_folder);

    }

}