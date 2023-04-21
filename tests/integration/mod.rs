// Contains tests_bin integration tests for Linux, Windows and Macos
use crate::{ init_integration_test, clean_integration_test};

/// Integration tests project name
const PRJ_NAME : &str = "_tb_integration";




/// tests_bin integration tests.
/// 
/// # Verification(s)
/// V1 | 
/// V2 | 
#[test]
fn integration_tests() {
    // Get integration test working path and project path.
    let (working_path, project_path) = init_integration_test(PRJ_NAME);

    // Clean integration test folders
    clean_integration_test(working_path, project_path);
}