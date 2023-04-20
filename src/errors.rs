
/// Enumeration of possible tests_bin errors.
pub enum TestsBinErrors {

    /// Happens when attributes macros parameters are incorrects.
    IncorrectParameters

}

impl ToString for TestsBinErrors{
    fn to_string(&self) -> String {
        match self {
            TestsBinErrors::IncorrectParameters => String::from("Incorrect parameters! Should be \"path\" with optional \"module_name\" separated by comma `,`."),
        }
    }
}