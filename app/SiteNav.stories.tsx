import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SiteNav } from "./SiteNav";

const meta = {
  component: SiteNav,
  tags: ["ai-generated"],
} satisfies Meta<typeof SiteNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "JNSW.DE" })).toHaveAttribute("href", "/#top");
  },
};

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const brandAccent = canvas.getByText(".DE");
    await expect(getComputedStyle(brandAccent).color).toBe("rgb(49, 87, 255)");
  },
};
