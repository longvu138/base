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
        },
      }}
    >
      <div className="mx-auto w-full max-w-[640px] px-3 py-3">
        <CartCheckoutStyleDefault />
      </div>
    </ConfigProvider>
  );
};

export default CartCheckoutStyleThanhla;
