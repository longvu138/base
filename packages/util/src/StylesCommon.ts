import { css } from "@emotion/css"

export const classFormItem = css({
  marginBottom: "0 !important",
  ".ant-form-item-label": {
    label: {
      padding: "0 !important",
      "&:before": {
        display: "none !important",
      },
      lineHeight: "0 !important",
    },
    lineHeight: "0 !important",
    padding: "0 !important",
  },
  ".ant-form-item-explain-warning": {
    marginTop: "4px",
    fontSize: "12px !important",
  },
  ".ant-form-item-explain-error": {
    marginTop: "4px",
    fontSize: "12px !important",
  },
  ".ant-form-item-required": {
    height: "51px !important",
  },
  input: {
    fontSize: "12px !important",
  },
})
