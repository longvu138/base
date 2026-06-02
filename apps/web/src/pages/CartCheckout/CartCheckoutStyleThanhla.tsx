import { ConfigProvider } from "antd";
import { CartCheckoutStyleDefault } from "./CartCheckoutStyleDefault";

export const CartCheckoutStyleThanhla = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            borderRadiusLG: 4,
            boxShadowTertiary: "0 1px 2px rgba(15, 23, 42, 0.08)",
          },
          Button: {
            borderRadius: 4,
            controlHeightLG: 42,
          },
          Table: {
            headerBg: "#ffffff",
            rowHoverBg: "#f8fafc",
          },
        },
      }}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-5">
        <CartCheckoutStyleDefault />
      </div>
    </ConfigProvider>
  );
};

export default CartCheckoutStyleThanhla;
