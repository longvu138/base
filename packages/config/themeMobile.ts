// theme/themeConfig.ts
import type { ThemeConfig } from "antd"

export const getThemeMobileConfig = (colorPrimary = "F2AE00"): ThemeConfig => {
    return {
        hashed: false,
        token: {
            colorPrimary: colorPrimary,
            fontFamily: "Inter, sans-serif",
        },
        components: {
            Button: {
                borderRadius: 100,
            },
        },
    }
}
