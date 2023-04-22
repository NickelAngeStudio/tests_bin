// Test 007: Error same module name.
use tests_bin::{ unit__tests };

unit__tests!("base_test.rs");
unit__tests!("base_test.rs");

fn main() {
    
}