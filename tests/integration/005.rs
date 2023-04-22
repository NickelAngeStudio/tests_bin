// Test 005 : Error, file not found.
use tests_bin::{ unit__tests };

unit__tests!("foo.rs", "module1");
unit__tests!("foo.rs", "module1");

fn main() {
    
}