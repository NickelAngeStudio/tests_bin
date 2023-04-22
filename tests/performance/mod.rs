use std::path::Path;

// Contains tests_bin performance tests for Linux, Windows and Macos
use crate::{ init_integration_test, clean_integration_test, copy_dir_all, assert_cmd, run_command, copy_file};
use std::time::SystemTime;

/// Integration tests project name
const PRJ_NAME : &str = "_tb_performance";

/// Loop count of performance test.
const LOOP_COUNT : usize = 1000;

/// How many test before reporting which loop we are on.
const REPORT_DIV : usize = 50;

/// tests_bin performance tests.
/// 
/// # Verification(s)
/// V1 | Copy unit tests file in project.
/// V2 | Copy legacy.rs in test project.
/// V3 | Accumulate legacy performance LOOP_COUNT times.
/// V4 | Display legacy performance time in ms.
/// V5 | Copy tests_bin.rs in test project.
/// V6 | Accumulate tests_bin performance LOOP_COUNT times.
/// V7 | Display tests_bin performance time in ms.
/// V8 | Display difference between tests_bin and legacy.
#[test]
#[ignore = "Long run time. Must be done manually."]
fn performance_tests() {
    // Get performance test working path and project path.
    let (working_path, project_path) = init_integration_test(PRJ_NAME);

    // V1 | Copy unit tests file in project.
    let tests_path = format!("{}/tests/performance/unit", working_path);
    let dest_path = format!("{}/tests/unit", project_path);
    match copy_dir_all(Path::new(&tests_path), Path::new(&dest_path)){
        Ok(_) => {},
        Err(err) => panic!("{:?}", err),    // Panic if we can't copy directory.
    }

    // V2 | Copy legacy.rs in test project.
    copy_file(format!("{}/tests/performance/legacy.rs", working_path), format!("{}/src/main.rs", project_path));

    // V3 | Accumulate legacy performance LOOP_COUNT times.
    let mut legacy : i128 = 0;
    for i in 0..LOOP_COUNT {
        if i % REPORT_DIV == 0 {   // Reporting test loop
            println!("`Legacy` loop {} running...", i);
        }
        legacy = legacy + get_run_time_micros(&project_path);
    }

    // V4 | Display legacy performance time in ms.
    println!("`Legacy` time for {} compilations is : {}ms", LOOP_COUNT,  legacy / 1000);

    // V5 | Copy tests_bin.rs in test project.
    copy_file(format!("{}/tests/performance/tests_bin.rs", working_path), format!("{}/src/main.rs", project_path));

    // V6 | Accumulate tests_bin performance LOOP_COUNT times.
    let mut tb : i128 = 0;
    for i in 0..LOOP_COUNT {
        if i % REPORT_DIV == 0 {   // Reporting test loop
            println!("`tests_bin` loop {} running...", i);
        }
        tb = tb + get_run_time_micros(&project_path);
    }

    // V7 | Display tests_bin performance time in ms.
    println!("`tests_bin` time for {} compilations is : {}ms", LOOP_COUNT,  tb / 1000);

    // V8 | Display difference between tests_bin and legacy.
    println!("Performance cost time for {} compilations is : {}ms", LOOP_COUNT,  (tb-legacy) / 1000);


    // Clean integration test folders
    clean_integration_test(working_path, project_path);
}

/**
 * Clean project, run cargo test and get time in microseconds.
 */
#[inline(always)]
pub fn get_run_time_micros(project_path : &String) -> i128 {

    // 1. Clean test project
    assert_cmd!(project_path, "cargo", ["clean" ], true, "");

    // 2. Capture system time before test run
    let now = SystemTime::now();

    // 3. Run test project
    assert_cmd!(project_path, "cargo", ["test" ], true, "Finished");   

    // 4. Return time elapsed in microseconds.
    match now.elapsed() {
        Ok(elapsed) => elapsed.as_micros() as i128,
        Err(err) => panic!("{:?}", err),    // Panic if we can't get time elapsed
    }
}
