use std::path::Path;

// Contains tests_bin integration tests for Linux, Windows and Macos
use crate::{ init_integration_test, clean_integration_test, run_test, copy_dir_all};

/// Integration tests project name
const PRJ_NAME : &str = "_tb_integration";




/// tests_bin integration tests.
/// 
/// # Verification(s)
/// V1 | TestsBinErrors::IncorrectParameters > No literals
/// V2 | TestsBinErrors::IncorrectParameters > No comma separator
/// V3 | TestsBinErrors::IncorrectParameters > Too many parameters
/// V4 | TestsBinErrors::IncorrectParameters > Parameters mixed with idents.
/// V5 | File not found.
/// V6 | Copy unit tests files to tests/unit
/// V7 | Error : Same module name.
/// V8 | unit__tests! work without module name
/// V9 | run Cargo test.
/// V10 | unit__tests! work with module name 
/// V11 | run Cargo test.
/// V12 | #unit_tests work without module name
/// V13 | run Cargo test.
/// V14 | #unit_tests work with module name 
/// V15 | run Cargo test.
#[test]
fn integration_tests() {
    // Get integration test working path and project path.
    let (working_path, project_path) = init_integration_test(PRJ_NAME);

    // V1 | TestsBinErrors::IncorrectParameters > No literals
    run_test(&working_path, &project_path, "integration/001.rs", false, "Incorrect parameters!");

    // V2 | TestsBinErrors::IncorrectParameters > No comma separator
    run_test(&working_path, &project_path, "integration/002.rs", false, "Incorrect parameters!");

    // V3 | TestsBinErrors::IncorrectParameters > Too many parameters
    run_test(&working_path, &project_path, "integration/003.rs", false, "Incorrect parameters!");

    // V4 | TestsBinErrors::IncorrectParameters > Parameters mixed with idents.
    run_test(&working_path, &project_path, "integration/004.rs", false, "Incorrect parameters!");

    // V5 | File not found.
    run_test(&working_path, &project_path, "integration/005.rs", false, "No such file or directory");
    
    // V6 | Copy unit tests files to tests/unit
    let tests_path = format!("{}/tests/integration/unit", working_path);
    let dest_path = format!("{}/tests/unit", project_path);
    match copy_dir_all(Path::new(&tests_path), Path::new(&dest_path)){
        Ok(_) => {},
        Err(err) => panic!("{:?}", err),    // Panic if we can't copy package directory.
    }

    // V7 | Error : Same module name.
    run_test(&working_path, &project_path, "integration/007.rs", false, "is defined multiple times");

    // V8 | unit__tests! work without module name
    run_test(&working_path, &project_path, "integration/008.rs", true, "Finished");

    // V9 | unit__tests! work with module name 
    run_test(&working_path, &project_path, "integration/009.rs", true, "Finished");

    // V10 | #unit_tests work without module name
    run_test(&working_path, &project_path, "integration/010.rs", true, "Finished");

    // V11 | #unit_tests work with module name 
    run_test(&working_path, &project_path, "integration/011.rs", true, "Finished");

    // V12 | unit__tests! and #unit_tests work together
    run_test(&working_path, &project_path, "integration/012.rs", true, "Finished");

    // Clean integration test folders
    clean_integration_test(working_path, project_path);
}