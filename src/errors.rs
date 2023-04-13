
/// Enumeration of possible tests_bin errors.
pub enum TestsBinErrors {

    /// Happens when attributes macros parameters are incorrects.
    IncorrectParameters

}

impl ToString for TestsBinErrors{
    fn to_string(&self) -> String {
        match self {
            TestsBinErrors::IncorrectParameters => String::from("Incorrect parameters! Should be `#[unit_tests(\"path\")]`, `#[unit_tests(\"path\", \"module name\")]` or unit_tests_bin!(\"path\", \"module name\")."),
        }
    }
}