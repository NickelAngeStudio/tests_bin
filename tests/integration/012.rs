// Test 012 | unit__tests! and #unit_tests work together
use tests_bin::{ unit__tests, unit_tests };

unit__tests!("ponyo/ham.rs");
unit__tests!("super_test.rs", "module1");

#[unit_tests("ponyo/ham.rs", "iwantham")]
pub fn totoro(){

}

#[unit_tests("sf1/sf2/foo.rs", "neighbor")]
pub fn foo(){
    
}

fn main() {
    
}