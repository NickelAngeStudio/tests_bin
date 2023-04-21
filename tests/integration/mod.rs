// Contains tests_bin integration tests for Linux, Windows and Macos
use crate::{ init_integration_test, clean_integration_test, run_test};

/// Integration tests project name
const PRJ_NAME : &str = "_tb_integration";




/// tests_bin integration tests.
/// 
/// # Verification(s)
/// V1 | TestsBinErrors::IncorrectParameters > No literals
/// V2 | TestsBinErrors::IncorrectParameters > No comma separator
/// V3 | TestsBinErrors::IncorrectParameters > Too many parameters
/// V4 | TestsBinErrors::IncorrectParameters > Parameters mixed with idents.
#[test]
fn integration_tests() {
    // Get integration test working path and project path.
    let (working_path, project_path) = init_integration_test(PRJ_NAME);

    // V1 | TestsBinErrors::IncorrectParameters > No literals
    run_test(&working_path, &project_path, "integration/001.rs", false, "Incorrect parameters!");

    // V2 | TestsBinErrors::IncorrectParameters > No comma separator
    // V3 | TestsBinErrors::IncorrectParameters > Too many parameters
    // V4 | TestsBinErrors::IncorrectParameters > Parameters mixed with idents.

    // Clean integration test folders
    clean_integration_test(working_path, project_path);
}