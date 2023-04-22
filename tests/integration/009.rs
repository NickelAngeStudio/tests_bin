// Test 009: unit__tests! work with module name
use tests_bin::{ unit__tests };

unit__tests!("ponyo/ham.rs");
unit__tests!("super_test.rs", "module1");

fn main() {
    
}