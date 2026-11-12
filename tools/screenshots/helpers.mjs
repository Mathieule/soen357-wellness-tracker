/** Shared steps for the screen scenarios of Output A, B and C. */
export const demo = (who) => async (page) => {
  await page.getByRole('button', { name: new RegExp(`^${who}`) }).click();
  await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor();
};
export const nav = (label) => async (page) => page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: label }).first().click();
export const settings = async (page) => page.getByRole('link', { name: /^(Settings|Profile)$/ }).first().click();
export async function signUp(page, email = 'nina@example.com', pw = 'Welcome123') {
  await page.getByRole('radio', { name: 'Create account' }).check({ force: true });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(pw);
  await page.getByRole('button', { name: 'Create account' }).last().click();
}
/** Short questionnaire (A/B): persona (auto-advance on click) → goals. */
export async function shortQuestionnaire(page, persona = 'Casual user', goals = ['Stay healthy and active']) {
  await page.getByText(persona, { exact: true }).click();
  await page.getByText('What are your fitness goals?').waitFor();
  for (const g of goals) await page.getByText(g, { exact: true }).click();
}
