import { webLightTheme, webDarkTheme, type Theme } from "@fluentui/react-components";

// Brand color from the old MUI theme (primary.main '#76B285' / dark '#8FCC9E').
// Fluent themes are built from a full 16-step brand ramp (via createLightTheme/
// createDarkTheme + a BrandVariants object); without the official Theme Designer
// tool we don't have an accurate way to generate that full ramp from one hex, so
// instead we start from Fluent's default theme and override just the tokens that
// actually show up as "the brand color" in the UI (buttons, focus rings).
export const lightTheme: Theme = {
  ...webLightTheme,
  colorBrandBackground: "#76B285",
  colorBrandBackgroundHover: "#63A073",
  colorBrandBackgroundPressed: "#4F8C60",
  colorCompoundBrandBackground: "#76B285",
  colorCompoundBrandBackgroundHover: "#63A073",
  colorCompoundBrandBackgroundPressed: "#4F8C60",
  colorBrandForeground1: "#4F8C60",
  colorBrandForeground2: "#4F8C60",
  colorBrandStroke1: "#76B285",
  colorBrandStroke2: "#76B285",
};

export const darkTheme: Theme = {
  ...webDarkTheme,
  colorBrandBackground: "#8FCC9E",
  colorBrandBackgroundHover: "#A2D6AF",
  colorBrandBackgroundPressed: "#7BBE8C",
  colorCompoundBrandBackground: "#8FCC9E",
  colorCompoundBrandBackgroundHover: "#A2D6AF",
  colorCompoundBrandBackgroundPressed: "#7BBE8C",
  colorBrandForeground1: "#8FCC9E",
  colorBrandForeground2: "#8FCC9E",
  colorBrandStroke1: "#8FCC9E",
  colorBrandStroke2: "#8FCC9E",
};
