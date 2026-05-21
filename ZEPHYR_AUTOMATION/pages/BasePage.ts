import { Page } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string = "") {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }
}
