// Test 010 | #unit_tests work without module name
use tests_bin::{ unit_tests };

#[unit_tests("ponyo/ham.rs")]
pub fn totoro(){

}

#[unit_tests("sf1/sf2/foo.rs")]
pub fn foo(){
    
}

fn main() {
    
}