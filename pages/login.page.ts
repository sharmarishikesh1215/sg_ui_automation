import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly url = "https://webapp.sacredgroves.earth";
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly wrongEmailAndPasswordErrorMessage: Locator;
  readonly errorModalBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#txtPassword");
    this.wrongEmailAndPasswordErrorMessage = page.locator(
      "//div[@class='modal-body']//span[contains(text(), 'The email and password combination')]"
    );
    this.errorModalBody = page.locator("div.modal-body");
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

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
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
    // Wait for the modal body to become visible and return whatever text it contains.
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
}
