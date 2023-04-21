use std::{path::Path, process::Command, fs::{self, OpenOptions}, io::{self, BufWriter, Write, Error}};

/// Integrations tests
mod integration;

/// Performance tests
mod performance;

/// Stress tests
mod stress;

pub const CARGO_MANIFEST_DIR : &str = "CARGO_MANIFEST_DIR";             // Cargo manifest directory key
pub const CARGO_PKG_VERSION : &str = "CARGO_PKG_VERSION";               // Cargo package version key
pub const CARGO_PKG_NAME : &str = "CARGO_PKG_NAME";                     // Cargo package name key

/// Macro that run a command and assert result.
/// Params : Working dir, command, arguments, success expected (true, false), message expected.
#[macro_export]
macro_rules! assert_cmd {
    ($path:expr, $cmd:expr, $args:expr, $success:expr, $expected:expr) => {
        let result = run_command($path, $cmd, $args.to_vec());
        if result.0 == $success {
            if !result.1.contains($expected){
                panic!("Expected output to contain `{}` but got {}!", $expected, result.1);
            }
        } else {
            panic!("Expected Success(`{}`) for `{} {:?}` but got `{}` instead!", $success, $cmd, $args, result.0);
        }
    }
}


/// Initialize integration test folder and project from test name.
/// 
/// Returns base tests_bin path and test project path.
pub fn init_integration_test(test_name : &str) -> (String, String) {

    // 1. Create working path and project path
    let working_path = match std::env::var(CARGO_MANIFEST_DIR) {
        Ok(cargo_dir) => cargo_dir,
        Err(err) => panic!("{:?}", err),    // Panic if we can't fetch directory.
    };
    let project_path = format!("{}/{}", working_path, test_name);
    
    // 2. Delete test project if already exists
    if Path::new(&project_path).exists() {
        match std::fs::remove_dir_all(project_path.clone()){
            Ok(_) => {},
            Err(err) => panic!("{:?}", err),    // Panic if we can't delete old directory.
        }
    }

    // 3. Create test project and assert if success.
    assert_cmd!(&working_path, "cargo", ["new", test_name ], true, "binary (application)");
    
    // 4. Package `tests_bin` and allow-dirty
    assert_cmd!(&working_path, "cargo", ["package", "--allow-dirty"], true, "Packaging");

    // 5. Copy package in project
    #[allow(unused_assignments)]
    let mut pkg_name = String::new();
    #[allow(unused_assignments)]
    let mut pkg_version = String::new();
    let package_name = match std::env::var(CARGO_PKG_NAME) {
        Ok(name) => match std::env::var(CARGO_PKG_VERSION) {
            Ok(version) => {
                pkg_name = name.clone();
                pkg_version = version.clone();  
                format!("{}-{}", name, version) // Return package name
            },  
            Err(err) => panic!("{:?}", err),    // Panic if we can't get package version
        },
        Err(err) => panic!("{:?}", err),    // Panic if we can't get package name
    };
    let package_path = format!("{}/target/package/{}", working_path, package_name);
    let destination = format!("{}/{}", project_path, package_name);

    match copy_dir_all(Path::new(&package_path), destination){
        Ok(_) => {},
        Err(err) => panic!("{:?}", err),    // Panic if we can't copy package directory.
    }

    // 6. Add dependency to new project Cargo.toml
    let dependency = format!("{} = {{ path=\"{}\", version=\"{}\" }}", pkg_name, package_name, pkg_version);
    match append_file(format!("{}/Cargo.toml", project_path), dependency){
        Ok(_) => {},
        Err(err) => panic!("{:?}", err),    // Panic if we can't append Cargo.toml
    }

   // 7. Return test project path
   (working_path, project_path)
   
}

/**
 * Append data to a file and return true on success.
 */
pub fn append_file(file_path : String, data : String) -> Result<bool, Error> {

    let result = OpenOptions::new()
        .append(true)
        .open(file_path);

    match result {
        Ok(file) => {
            let mut writer = BufWriter::new(file);
            match writer.write_all(data.as_bytes()){
                Ok(_) => Ok(true),
                Err(err) => Err(err),
            }
        },
        Err(err) => Err(err),
    }

}

/**
 * Copy test file to destination, run cargo run and compare result to expected.
 */
pub fn run_test(working_path : &String, project_path : &String, test_file : &str, success : bool, expected : &str){

    // 1. Clean test project
    assert_cmd!(project_path, "cargo", ["clean" ], true, "");

    // 2. Copy test over main.rs
    let from = format!("{}/tests/{}", working_path, test_file);
    let to = format!("{}/src/main.rs", project_path);
    match fs::copy(from, to){
        Ok(_) => {},
        Err(err) => panic!("{:?}", err),    // Panic if we can't copy test file
    }

    // 3. Run test project
    assert_cmd!(project_path, "cargo", ["run" ], success, expected);

    
}

/// Run shell command and return if success and output message as string
pub fn run_command(working_dir : &String, command : &str, args : Vec<&str>) -> (bool, String) {

    // Set working directory first
    match std::env::set_current_dir(Path::new(working_dir.as_str())){
        Ok(_) => {
            // Create command and match output
            match Command::new(command).args(args).output(){
                Ok(output) => {
                    // Accumulate all output
                    let mut vec_out = output.stdout; 
                    vec_out.append(&mut output.stderr.clone());

                    match String::from_utf8(vec_out){
                        Ok(message) =>  (output.status.success(), message),
                        Err(err) => (output.status.success(), err.to_string()),
                    }
                },
                Err(err) => (false, err.to_string()),
            }
        },
        Err(err) => panic!("{:?}", err),    // Panic if we can't set working directory
    }

}

/// Clean integration project and folder
pub fn clean_integration_test(working_path : String, project_path : String) {  

    // 1. Delete project folder
    match std::fs::remove_dir_all(project_path){
        Ok(_) => {},
        Err(err) => panic!("{:?}", err),    // Panic if we can't delete test project directory.
    }

    // 2. Delete package directory
    let package_path = format!("{}/target/package", working_path);
    match std::fs::remove_dir_all(package_path){
        Ok(_) => {},
        Err(err) => panic!("{:?}", err),    // Panic if we can't delete package directory.
    }


}

/**
 * Copy directory with files from source to destination
 * Ref : https://stackoverflow.com/questions/26958489/how-to-copy-a-folder-recursively-in-rust
 */
fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}