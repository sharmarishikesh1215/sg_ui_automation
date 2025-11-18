import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import dotenv from "dotenv";

dotenv.config();

test.describe("Login Tests", () => {
  let loginPage: LoginPage;
  let username: string = "rishikesh@frugaltestingin.com";
  let password: string = "Frugal@123";

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("Verify if the login form is displayed", async ({ page }) => {
    await expect(page.locator("body")).toMatchAriaSnapshot(`
    - link:
      - /url: https://sacredgroves.earth
      - img
    - heading "Welcome Back" [level=3]
    - text: Email address
    - textbox "example@email.com"
    - paragraph
    - text: Password
    - link "Forgot password?":
      - /url: /login/forget
    - textbox "Enter your password"
    - paragraph
    - button "Login"
    - separator
    - text: Or Continue With
    - link:
      - /url: /auth/login-google
      - button "Google"
    - text: Don't have an account?
    - link "Sign up":
      - /url: /signup
    - img "Sacred Groves Decorative Footer"
    - paragraph: /© \\d+-\\d+ The Sacred Groves\\. All rights reserved\\./
    `);
  });

  test("Verify if the email and password fields have the required attribute", async ({
    page,
  }) => {
    await expect.soft(page.locator("#email")).toHaveAttribute("required", "");
    await expect
      .soft(page.locator("#txtPassword"))
      .toHaveAttribute("required", "");
  });

  test("Verify error message is displayed upon clicking login button without filling any details", async () => {
    const validationMessage =
      await loginPage.verifyErrorMessageOnClickingLoginButtonWithoutFillingAnyFields();
    console.log("Validation Message:", validationMessage);
    await expect(validationMessage).toContain("Please fill out this field.");
  });

  test("Verify error message is displayed upon entering invalid email format", async () => {
    const errorMessage = await loginPage.verifyInvalidEmailErrorMessage(
      "*@#$%"
    );
    console.log("Error Message for Invalid Email:", errorMessage);
    await expect(errorMessage).toMatch(/A part following '@'/);
  });

  test("Verify error message is displayed upon entering incorrect email and password", async () => {
    const errorMsg = await loginPage.verifyIncorrectCredentialsErrorMessage(
      "test@gmail.com",
      "wrongpassword"
    );
    await expect(errorMsg).toMatch(/The email and password combination/);
  });

  test("Verify valid login redirects to dashboard", async ({ page }) => {
    await loginPage.nativeLogin(username, password);
    await expect(page).toHaveURL(/user/);
  });

  test("Verify error message when fields are cleared after entering data", async ({
    page,
  }) => {
    await loginPage.clearedEmailAndPasswordFieldsError(username, password);
    await expect.soft(page.locator("//p[@id='empt_loginEmail']")).toBeVisible();
    await expect
      .soft(page.locator("//p[@id='empt_loginPassword']"))
      .toBeVisible();
  });
});

test.describe("Forget Password Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.goToForgotPasswordPage();
  });

  test("Verify navigation to Forgot Password page", async ({ page }) => {
    await expect(page).toHaveURL(/forget/);
  });

  test("Verify error message is displayed when submitting empty phone number field", async ({
    page,
  }) => {
    await loginPage.clickSubmitButtonOnForgotPasswordPage();
    await expect(
      page.locator("//label[text()='This field is required.']")
    ).toBeVisible();
  });

  test("Verify country dropdown options are selectable", async ({ page }) => {
    await loginPage.countryDropdownOptions("India");
    await page.waitForTimeout(3000);
    await expect(page.locator("//div[@class='selected-dial-code']")).toHaveText(
      "+91"
    );
    await loginPage.countryDropdownOptions("USA");
    await page.waitForTimeout(3000);
    await expect(page.locator("//div[@class='selected-dial-code']")).toHaveText(
      "+1"
    );
    await loginPage.countryDropdownOptions("UK");
    await page.waitForTimeout(3000);
    await expect(page.locator("//div[@class='selected-dial-code']")).toHaveText(
      "+44"
    );
  });

  test("Verify submitting correct phone number proceeds to OTP page without any error", async ({
    page,
  }) => {
    await loginPage.countryDropdownOptions("India");
    await loginPage.fillPhoneNumber("8638985132");
    await loginPage.clickSubmitButtonOnForgotPasswordPage();
    await expect(page).toHaveURL(/signup\/verify/);
  });

  test("Verify otp field displays error message when submitted empty", async ({
    page,
  }) => {
    await loginPage.countryDropdownOptions("India");
    await loginPage.fillPhoneNumber("8638985132");
    await loginPage.clickSubmitButtonOnForgotPasswordPage();
    await loginPage.clickOkOnSuccessPopup();
    await loginPage.clickContinueButtonOnOtpPage();
    await expect(page.locator('html').getByRole('document')).toContainText('Verification code is invalid, please try again.');
  });

  test("Verify filling half otp field displays error message", async ({ page }) => {
    await loginPage.countryDropdownOptions("India");
    await loginPage.fillPhoneNumber("8638985132");
    await loginPage.clickSubmitButtonOnForgotPasswordPage();
    await loginPage.clickOkOnSuccessPopup();
    await loginPage.fillOtpField("123");
    await loginPage.clickContinueButtonOnOtpPage();
    await expect(page.locator('html').getByRole('document')).toContainText('Verification code is invalid, please try again.');
  });

  test("Verify retry otp button functionality", async ({ page }) => {
    await loginPage.countryDropdownOptions("India");
    await loginPage.fillPhoneNumber("8638985132");
    await loginPage.clickSubmitButtonOnForgotPasswordPage();
    await loginPage.clickOkOnSuccessPopup();
    await loginPage.clickRetryOtpButton();
   });

  test("Verify filling correct otp proceeds further", async ({ page }) => {
    await loginPage.countryDropdownOptions("India");
    await loginPage.fillPhoneNumber("8638985132");
    await loginPage.clickSubmitButtonOnForgotPasswordPage();
    await loginPage.clickOkOnSuccessPopup();
    await loginPage.fillOtpField("1234");
    await loginPage.clickContinueButtonOnOtpPage();
    await expect(page).toHaveURL(/login\/forget\/reset/);
  });

  test("Verify password reset functionality with valid password combination", async ({ page }) => {
    await loginPage.countryDropdownOptions("India");
    await loginPage.fillPhoneNumber("8638985132");
    await loginPage.clickSubmitButtonOnForgotPasswordPage();
    await loginPage.clickOkOnSuccessPopup();
    await loginPage.fillOtpField("1234");
    await loginPage.clickContinueButtonOnOtpPage();
    await loginPage.fillNewPasswordField("Frugal@123");
    await expect.soft(page.locator("#firstLi")).toHaveAttribute("class", "complete");
    await expect.soft(page.locator("#secondLi")).toHaveAttribute("class", "complete");
    await expect.soft(page.locator("#thirdLi")).toHaveAttribute("class", "complete");
    await expect.soft(page.locator("#fourthLi")).toHaveAttribute("class", "complete");
    await expect.soft(page.locator("#fifthLi")).toHaveAttribute("class", "complete");
  });
});
