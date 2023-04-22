// Test 011 | #unit_tests work with module name
use tests_bin::{ unit_tests };

#[unit_tests("ponyo/ham.rs", "iwantham")]
pub fn totoro(){

}

#[unit_tests("sf1/sf2/foo.rs", "neighbor")]
pub fn foo(){
    
}

fn main() {
    
}