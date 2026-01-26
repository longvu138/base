// theme/themeConfig.ts
import type { ThemeConfig } from "antd"

export const getThemeConfig = (colorPrimary = "#1890ff"): ThemeConfig => {
    return {
        hashed: false,
        token: {
            colorPrimary: colorPrimary,
            fontFamily: "Inter,  sans-serif",
        },
        components: {
            Input: {
                borderRadius: 10,
            },
            Button: {
                borderRadius: 16,
            },
        },
    }
}
