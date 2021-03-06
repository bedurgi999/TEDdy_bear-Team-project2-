import { createTheme } from "@mui/material/styles";
import { brown } from "@mui/material/colors";

/**
 * main color
 */
export const theme = createTheme({
  brown: {
    light: brown[300],
    main: brown[500],
    dark: brown[900],
  },
});
