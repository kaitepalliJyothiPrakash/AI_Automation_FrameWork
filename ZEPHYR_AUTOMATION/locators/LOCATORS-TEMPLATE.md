# <STORY-ID> <Feature Name> - Locators
#
# FORMAT RULES:
# - Line 1       : Title comment  →  # <STORY-ID> <Feature Name> - Locators
# - Line 3       : Class header   →  ## <PageClassName>   (PascalCase, matches the generated TypeScript class name)
# - url field    : Relative path to the page (no base URL)
# - Locators     : camelCase name : CSS/XPath selector
# - One locator  : per line, no blank lines between locators
# - Only include : locators needed by the story's acceptance criteria

## SamplePage
- url: /web/index.php/some/page
- primaryInput: input[name="fieldName"]
- secondaryInput: input[name="anotherField"]
- submitButton: button[type="submit"]
- cancelButton: button.oxd-button--ghost
- successMessage: .oxd-toast-content--success
- errorAlert: .oxd-alert-content-text
- fieldErrorMessage: .oxd-input-field-error-message
- pageHeading: .oxd-topbar-header-breadcrumb-module
- tableRow: .oxd-table-row
- searchInput: input.oxd-input[placeholder="Type for hints..."]
- dropdownOption: .oxd-select-option
