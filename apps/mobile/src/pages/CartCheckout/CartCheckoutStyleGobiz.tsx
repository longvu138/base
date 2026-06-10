import { ConfigProvider } from "antd";
import { CartCheckoutStyleDefault } from "./CartCheckoutStyleDefault";

export const CartCheckoutStyleGobiz = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            borderRadiusLG: 6,
            paddingLG: 14,
          },
          Button: {
            borderRadius: 6,
            controlHeightLG: 44,
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

export default CartCheckoutStyleGobiz;
