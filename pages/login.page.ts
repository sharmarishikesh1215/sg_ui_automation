import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly url = "https://webapp.sacredgroves.earth";
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly wrongEmailAndPasswordErrorMessage: Locator;
  readonly errorModalBody: Locator;
  readonly forgetPasswordLink: Locator;
  readonly submitButtonOnForgotPasswordPage: Locator;
  readonly countryDropdown: Locator;
  readonly IndiaOption: Locator;
  readonly USAOption: Locator;
  readonly UKOption: Locator;
  readonly phoneNumberInput: Locator;
  readonly errorMsgOtpField: Locator;
  readonly continueButtonOnOtpPage: Locator;
  readonly okButton: Locator;
  readonly retryBtn: Locator;
  readonly resetPasswordInput: Locator;
  readonly reenterPasswordInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#txtPassword");
    this.wrongEmailAndPasswordErrorMessage = page.locator(
      "//div[@class='modal-body']//span[contains(text(), 'The email and password combination')]"
    );
    this.errorModalBody = page.locator("div.modal-body");
    this.forgetPasswordLink = page.locator("//a[contains(text(), 'Forgot password')]");
    this.submitButtonOnForgotPasswordPage = page.locator("//button[text()='Submit']");
    this.countryDropdown = page.locator(
      "//div[@class='iti-arrow']"
    );
    this.IndiaOption = page.locator("(//span[text()='+91'])[1]");
    this.USAOption = page.locator("(//span[text()='+1'])[1]");
    this.UKOption = page.locator("(//span[text()='+44'])[1]");
    this.phoneNumberInput = page.locator("//input[@id='phone_number']");
    this.errorMsgOtpField = page.locator("((//div[@class='modal-body'])[1]/text())[2]");
    this.continueButtonOnOtpPage = page.locator("//button[text()='Continue']");
    this.okButton = page.locator("(//a[contains(text(), 'OK')])[1]");
    this.retryBtn = page.locator("//span[@class='timer']");
    this.resetPasswordInput = page.locator("//input[@id='password']");
    this.reenterPasswordInput = page.locator("//input[@id='re_password']");
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async clickLoginButton() {
    await this.page.click("button:has-text('Login')");
  }

  async verifyErrorMessageOnClickingLoginButtonWithoutFillingAnyFields() {
    return await this.emailInput.evaluate(
      (el) => (el as HTMLInputElement).validationMessage
    );
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async clearEmail() {
    await this.emailInput.clear();
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clearPassword() {
    await this.passwordInput.clear();
  }

  async clearedEmailAndPasswordFieldsError(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clearPassword();
    await this.clearEmail();
  }

  async verifyInvalidEmailErrorMessage(invalidEmail: string) {
    await this.fillEmail(invalidEmail);
    await this.clickLoginButton();
    return await this.emailInput.evaluate(
      (el) => (el as HTMLInputElement).validationMessage
    );
  }

  async verifyIncorrectCredentialsErrorMessage(
    email: string,
    password: string
  ) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
    await this.errorModalBody.waitFor({ state: "visible", timeout: 10000 });
    const txt = await this.errorModalBody.textContent();
    return txt?.trim();
  }

  async verifyErrorMsgUponWrongEmailandPasswordCombo(
    email: string,
    password: string
  ) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
    await this.errorModalBody.waitFor({ state: "visible", timeout: 10000 });
    const text = await this.errorModalBody.textContent();
    const visible = !!(text && text.trim().length > 0);
    console.log("Error message visible:", visible, "| text:", text?.trim());
    return text?.trim();
  }

  async nativeLogin(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async goToForgotPasswordPage() {
    await this.forgetPasswordLink.click();
  }

  async clickSubmitButtonOnForgotPasswordPage() {
    await this.submitButtonOnForgotPasswordPage.click();
  }

  async countryDropdownOptions(country: string) {
    await this.countryDropdown.click();
    if (country === "India") await this.IndiaOption.click();
    else if (country === "USA") await this.USAOption.click();
    else if (country === "UK") await this.UKOption.click();
  }

  async fillPhoneNumber(phoneNumber: string) {
    await this.phoneNumberInput.fill(phoneNumber);
  }

  async clickContinueButtonOnOtpPage() {
    await this.continueButtonOnOtpPage.click();
  }

  async clickOkOnSuccessPopup() {
    await this.okButton.click();
  }

  async fillOtpField(otp: string) {
    for (let i = 0; i < otp.length; i++) {
      const digit = otp.charAt(i);
      await this.page.fill(`//input[@id='codeBox${i + 1}']`, digit);
    }
  }

  async clickRetryOtpButton() {

  }

  async fillNewPasswordField(newPassword: string) {
    await this.resetPasswordInput.click();
    // Use `type` instead of `fill` so keydown/keyup events fire and the
    // client-side password checklist/validation updates per character.
    await this.resetPasswordInput.fill("");
    await this.resetPasswordInput.type(newPassword, { delay: 40 });
    // blur the field to ensure any onblur validation runs
    await this.resetPasswordInput.evaluate((el: HTMLInputElement) => el.blur());
    // fill the re-enter field similarly to trigger its validations
    await this.reenterPasswordInput.click();
    await this.reenterPasswordInput.fill("");
    await this.reenterPasswordInput.type(newPassword, { delay: 40 });
    await this.reenterPasswordInput.evaluate((el: HTMLInputElement) => el.blur());
  }
}
