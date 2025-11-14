import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test.describe("Login Tests", () => {
  let loginPage: LoginPage;
  
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
    await expect.soft(page.locator("#txtPassword")).toHaveAttribute("required", "");
  });

  test("Verify error message is displayed upon clicking login button without filling any details", async () => {
    const validationMessage =
      await loginPage.verifyErrorMessageOnClickingLoginButtonWithoutFillingAnyFields();
    console.log("Validation Message:", validationMessage);
    await expect(validationMessage).toContain("Please fill out this field.");
  });

  test("Verify error message is displayed upon entering invalid email format", async () => {
    const errorMessage = await loginPage.verifyInvalidEmailErrorMessage("*@#$%");
    console.log("Error Message for Invalid Email:", errorMessage);
    await expect(errorMessage).toMatch(/A part following '@'/);
  });

  test("Verify error message is displayed upon entering incorrect email and password", async () => {
   const errorMsg = await loginPage.verifyIncorrectCredentialsErrorMessage("test@gmail.com", "wrongpassword");
   await expect(errorMsg).toMatch(/The email and password combination/);
  });

  test('Verify valid login redirects to dashboard', async ({ page }) => {
    await loginPage.nativeLogin("rishikesh@frugaltestingin.com", "Frugal@123");
    await expect(page).toHaveURL(/user/);
  });
});
